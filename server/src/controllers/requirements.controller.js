import { Requirement } from '../models/Requirement.js'
import {
  normalizeActor,
  normalizeText,
  validateAssignPayload,
  validateCommentPayload,
  validateCreateRequirementPayload,
  validateCriteriaPayload,
  validateDeadlinePayload,
  validateDuplicatePayload,
  validateLinkPayload,
  validateMergePayload,
  validateStatusPayload,
  validateUpdateRequirementPayload
} from '../validators/requirements.validator.js'

function sendValidationError(response, validationResult) {
  return response.status(validationResult.status || 400).json({
    message: validationResult.message
  })
}

function createVersionSnapshot(requirement, changeSummary, editedBy) {
  return {
    versionNumber: requirement.versions.length + 1,
    snapshot: {
      title: requirement.title,
      description: requirement.description,
      type: requirement.type,
      priority: requirement.priority,
      status: requirement.status,
      acceptanceCriteria: (requirement.acceptanceCriteria || []).map((criteria) =>
        typeof criteria === 'string' ? criteria : criteria.text
      ),
      linkedRequirementIds: requirement.linkedRequirementIds || []
    },
    changeSummary,
    editedBy
  }
}

function createHistoryEntry({ action, details = null, actor }) {
  return {
    action,
    details,
    actor
  }
}

function truncateText(value, maxLength = 90) {
  const normalizedValue = String(value || '').trim()
  if (normalizedValue.length <= maxLength) {
    return normalizedValue
  }

  return `${normalizedValue.slice(0, maxLength - 1)}...`
}

function createDuplicateGroupId() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `DUP-${timestamp}-${suffix}`
}

function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean))]
}

function haveSameItems(leftItems, rightItems) {
  return JSON.stringify([...leftItems].sort()) === JSON.stringify([...rightItems].sort())
}

function normalizeCriteriaForCopy(criteria, fallbackActor) {
  return {
    text: typeof criteria === 'string' ? criteria : criteria.text,
    createdBy: criteria.createdBy || fallbackActor
  }
}

function ensureOriginalDescription(requirement) {
  if (!requirement.originalDescription) {
    requirement.originalDescription =
      requirement.versions?.[0]?.snapshot?.description || requirement.description
  }
}

function getCommentHistoryAction(kind) {
  if (kind === 'clarification-request') {
    return 'Requested clarification'
  }

  if (kind === 'clarification-response') {
    return 'Responded to clarification'
  }

  return 'Added comment'
}

function hasChanged(requirement, update) {
  return Object.entries(update).some(([key, value]) => {
    if (key === 'deadline') {
      const currentDeadline = requirement.deadline ? requirement.deadline.toISOString() : null
      const nextDeadline = value ? new Date(value).toISOString() : null
      return currentDeadline !== nextDeadline
    }

    return JSON.stringify(requirement[key] ?? null) !== JSON.stringify(value ?? null)
  })
}

async function findActiveRequirement(requirementId) {
  return Requirement.findOne({
    requirementId: String(requirementId || '').toUpperCase(),
    isArchived: false
  })
}

export async function listRequirements(request, response, next) {
  try {
    const {
      projectId = 'proj-1',
      status,
      priority,
      assigneeId,
      search
    } = request.query

    const query = {
      projectId,
      isArchived: false
    }

    if (status) {
      query.status = status
    }

    if (priority) {
      query.priority = priority
    }

    if (assigneeId) {
      query['assignee.id'] = assigneeId
    }

    if (search) {
      query.$text = { $search: String(search) }
    }

    const requirements = await Requirement.find(query).sort({ updatedAt: -1 })
    requirements.forEach(ensureOriginalDescription)
    response.status(200).json({ requirements })
  } catch (error) {
    next(error)
  }
}

export async function createRequirement(request, response, next) {
  try {
    const validationResult = validateCreateRequirementPayload(request.body)
    if (!validationResult.ok) {
      return sendValidationError(response, validationResult)
    }

    const requirement = new Requirement(validationResult.value)
    requirement.versions.push(
      createVersionSnapshot(requirement, 'Created requirement', validationResult.value.createdBy)
    )
    requirement.history.push(
      createHistoryEntry({
        action: 'Created requirement',
        actor: validationResult.value.createdBy
      })
    )

    await requirement.save()

    return response.status(201).json({
      message: 'Requirement created successfully.',
      requirement
    })
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({
        message: 'A requirement with this ID already exists.'
      })
    }

    next(error)
  }
}

export async function getRequirement(request, response, next) {
  try {
    const requirement = await findActiveRequirement(request.params.id)
    if (!requirement) {
      return response.status(404).json({
        message: 'Requirement was not found.'
      })
    }

    ensureOriginalDescription(requirement)
    return response.status(200).json({ requirement })
  } catch (error) {
    next(error)
  }
}

export async function updateRequirement(request, response, next) {
  try {
    const requirement = await findActiveRequirement(request.params.id)
    if (!requirement) {
      return response.status(404).json({
        message: 'Requirement was not found.'
      })
    }

    if (requirement.status === 'locked') {
      return response.status(409).json({
        message: 'Locked requirements cannot be modified.'
      })
    }

    const validationResult = validateUpdateRequirementPayload(request.body)
    if (!validationResult.ok) {
      return sendValidationError(response, validationResult)
    }

    const { update, changeSummary, editedBy } = validationResult.value
    if (!hasChanged(requirement, update)) {
      return response.status(400).json({
        message: 'No actual requirement changes were submitted.'
      })
    }

    ensureOriginalDescription(requirement)
    requirement.set(update)
    requirement.versions.push(createVersionSnapshot(requirement, changeSummary, editedBy))
    requirement.history.push(
      createHistoryEntry({
        action: 'Updated requirement details',
        details: changeSummary,
        actor: editedBy
      })
    )
    await requirement.save()

    return response.status(200).json({
      message: 'Requirement updated successfully.',
      requirement
    })
  } catch (error) {
    next(error)
  }
}

export async function assignRequirement(request, response, next) {
  try {
    const requirement = await findActiveRequirement(request.params.id)
    if (!requirement) {
      return response.status(404).json({
        message: 'Requirement was not found.'
      })
    }

    if (requirement.status === 'locked') {
      return response.status(409).json({
        message: 'Locked requirements cannot be assigned.'
      })
    }

    const validationResult = validateAssignPayload(request.body)
    if (!validationResult.ok) {
      return sendValidationError(response, validationResult)
    }

    const { assignee, actor } = validationResult.value
    const previousAssigneeId = requirement.assignee?.id || null
    const isSameAssignee = previousAssigneeId === assignee.id

    if (isSameAssignee) {
      return response.status(400).json({
        message: 'Requirement is already assigned to this team member.'
      })
    }

    requirement.assignee = assignee
    requirement.history.push(
      createHistoryEntry({
        action: previousAssigneeId ? 'Reassigned requirement' : 'Assigned requirement',
        details: assignee.name,
        actor
      })
    )
    await requirement.save()

    return response.status(200).json({
      message: previousAssigneeId
        ? 'Requirement reassigned successfully.'
        : 'Requirement assigned successfully.',
      requirement
    })
  } catch (error) {
    next(error)
  }
}

export async function setRequirementDeadline(request, response, next) {
  try {
    const requirement = await findActiveRequirement(request.params.id)
    if (!requirement) {
      return response.status(404).json({
        message: 'Requirement was not found.'
      })
    }

    if (requirement.status === 'locked') {
      return response.status(409).json({
        message: 'Locked requirements cannot be modified.'
      })
    }

    const validationResult = validateDeadlinePayload(request.body)
    if (!validationResult.ok) {
      return sendValidationError(response, validationResult)
    }

    const { deadline, actor } = validationResult.value
    const normalizedDate = new Date(deadline)
    requirement.deadline = normalizedDate
    requirement.history.push(
      createHistoryEntry({
        action: 'Set deadline',
        details: normalizedDate.toISOString().split('T')[0],
        actor
      })
    )
    await requirement.save()

    return response.status(200).json({
      message: 'Requirement deadline updated.',
      requirement
    })
  } catch (error) {
    next(error)
  }
}

export async function setRequirementStatus(request, response, next) {
  try {
    const requirement = await findActiveRequirement(request.params.id)
    if (!requirement) {
      return response.status(404).json({
        message: 'Requirement was not found.'
      })
    }

    const validationResult = validateStatusPayload(request.body)
    if (!validationResult.ok) {
      return sendValidationError(response, validationResult)
    }

    const { status, reason, actor } = validationResult.value

    if (requirement.status === 'locked' && status !== 'locked') {
      return response.status(409).json({
        message: 'Locked requirements cannot change status.'
      })
    }

    if (status === 'locked' && requirement.status !== 'approved') {
      return response.status(409).json({
        message: 'Only approved requirements can be locked.'
      })
    }

    if (requirement.status === status) {
      return response.status(400).json({
        message: `Requirement is already ${status}.`
      })
    }

    requirement.status = status
    requirement.rejectionReason = status === 'rejected' ? reason : null
    requirement.history.push(
      createHistoryEntry({
        action: status === 'locked' ? 'Locked requirement' : `Changed status to ${status}`,
        details: reason,
        actor
      })
    )
    await requirement.save()

    return response.status(200).json({
      message: 'Requirement status updated.',
      requirement
    })
  } catch (error) {
    next(error)
  }
}

export async function markRequirementsAsDuplicates(request, response, next) {
  try {
    const validationResult = validateDuplicatePayload(request.body)
    if (!validationResult.ok) {
      return sendValidationError(response, validationResult)
    }

    const { requirementIds, actor } = validationResult.value
    const selectedRequirements = await Requirement.find({
      requirementId: { $in: requirementIds },
      isArchived: false
    })

    if (selectedRequirements.length !== requirementIds.length) {
      return response.status(404).json({
        message: 'Some selected requirements are not available.'
      })
    }

    const selectedProjectIds = uniqueStrings(
      selectedRequirements.map((requirement) => requirement.projectId)
    )
    if (selectedProjectIds.length !== 1) {
      return response.status(409).json({
        message: 'Selected requirements must belong to the same project.'
      })
    }

    const projectId = selectedProjectIds[0]
    const existingGroupIds = uniqueStrings(
      selectedRequirements.map((requirement) => requirement.duplicateGroupId)
    )
    const duplicateGroupId = existingGroupIds[0] || createDuplicateGroupId()
    const selectedIdSet = new Set(requirementIds)

    const existingGroupRequirements = existingGroupIds.length > 0
      ? await Requirement.find({
        projectId,
        isArchived: false,
        duplicateGroupId: { $in: existingGroupIds }
      })
      : []

    const requirementsById = new Map(
      [...selectedRequirements, ...existingGroupRequirements].map((requirement) => [
        requirement.requirementId,
        requirement
      ])
    )
    const requirementsToMark = [...requirementsById.values()]

    requirementsToMark.forEach((requirement) => {
      const changedGroup = requirement.duplicateGroupId !== duplicateGroupId
      requirement.duplicateGroupId = duplicateGroupId

      if (changedGroup || selectedIdSet.has(requirement.requirementId)) {
        requirement.history.push(
          createHistoryEntry({
            action: 'Marked duplicate group',
            details: duplicateGroupId,
            actor
          })
        )
      }
    })

    await Promise.all(requirementsToMark.map((requirement) => requirement.save()))

    return response.status(200).json({
      message: 'Selected requirements marked as duplicates.',
      duplicateGroupId,
      requirementIds: requirementsToMark.map((requirement) => requirement.requirementId)
    })
  } catch (error) {
    next(error)
  }
}

export async function mergeDuplicateRequirements(request, response, next) {
  try {
    const validationResult = validateMergePayload(request.body)
    if (!validationResult.ok) {
      return sendValidationError(response, validationResult)
    }

    const { duplicateGroupId, primaryRequirementId, actor } = validationResult.value
    const duplicateCandidates = await Requirement.find({
      duplicateGroupId,
      isArchived: false
    })

    if (duplicateCandidates.length < 2) {
      return response.status(400).json({
        message: 'Selected requirements are not marked as duplicates.'
      })
    }

    const projectIds = uniqueStrings(duplicateCandidates.map((requirement) => requirement.projectId))
    if (projectIds.length !== 1) {
      return response.status(409).json({
        message: 'Duplicate group contains requirements from multiple projects.'
      })
    }

    const primaryRequirement = duplicateCandidates.find(
      (requirement) => requirement.requirementId === primaryRequirementId
    )
    if (!primaryRequirement) {
      return response.status(400).json({
        message: 'Primary requirement must belong to the selected duplicate group.'
      })
    }

    const lockedCandidate = duplicateCandidates.find((requirement) => requirement.status === 'locked')
    if (lockedCandidate) {
      return response.status(409).json({
        message: `Locked requirement ${lockedCandidate.requirementId} cannot be merged.`
      })
    }

    const duplicateRequirements = duplicateCandidates.filter(
      (requirement) => requirement.requirementId !== primaryRequirementId
    )
    const duplicateIds = duplicateRequirements.map((requirement) => requirement.requirementId)
    const duplicateIdSet = new Set(duplicateIds)
    const candidateIds = duplicateCandidates.map((requirement) => requirement.requirementId)
    const now = new Date()

    const mergedSummaryLines = duplicateRequirements.map(
      (requirement) =>
        `- [${requirement.requirementId}] ${requirement.title}: ${requirement.description}`
    )
    const mergedBlock = mergedSummaryLines.length > 0
      ? `\n\nMerged duplicate details:\n${mergedSummaryLines.join('\n')}`
      : ''
    const mergedDescription = `${primaryRequirement.description}${mergedBlock}`
    primaryRequirement.description = mergedDescription.length > 5000
      ? `${mergedDescription.slice(0, 4997)}...`
      : mergedDescription

    const primaryLinks = new Set(primaryRequirement.linkedRequirementIds || [])
    duplicateRequirements.forEach((requirement) => {
      ;(requirement.linkedRequirementIds || []).forEach((linkedRequirementId) => {
        if (
          linkedRequirementId !== primaryRequirementId &&
          !duplicateIdSet.has(linkedRequirementId)
        ) {
          primaryLinks.add(linkedRequirementId)
        }
      })
    })
    primaryLinks.delete(primaryRequirementId)
    duplicateIds.forEach((duplicateId) => primaryLinks.delete(duplicateId))
    primaryRequirement.linkedRequirementIds = [...primaryLinks]

    const primaryCriteriaTexts = new Set(
      (primaryRequirement.acceptanceCriteria || [])
        .map((criteria) => normalizeText(criteria.text || criteria).toLowerCase())
        .filter(Boolean)
    )
    duplicateRequirements.forEach((requirement) => {
      ;(requirement.acceptanceCriteria || []).forEach((criteria) => {
        const copiedCriteria = normalizeCriteriaForCopy(criteria, actor)
        const normalizedText = normalizeText(copiedCriteria.text)
        const criteriaKey = normalizedText.toLowerCase()
        if (!normalizedText || primaryCriteriaTexts.has(criteriaKey)) {
          return
        }

        primaryCriteriaTexts.add(criteriaKey)
        primaryRequirement.acceptanceCriteria.push({
          ...copiedCriteria,
          text: normalizedText
        })
      })
    })

    primaryRequirement.duplicateGroupId = null
    primaryRequirement.mergedIntoRequirementId = null
    primaryRequirement.mergedFromIds = uniqueStrings([
      ...(primaryRequirement.mergedFromIds || []),
      ...duplicateIds
    ])
    primaryRequirement.history.push(
      createHistoryEntry({
        action: 'Merged duplicate requirements',
        details: duplicateIds.join(', '),
        actor
      })
    )
    primaryRequirement.versions.push(
      createVersionSnapshot(
        primaryRequirement,
        `Merged duplicates: ${duplicateIds.join(', ')}`,
        actor
      )
    )

    duplicateRequirements.forEach((requirement) => {
      requirement.isArchived = true
      requirement.archivedAt = now
      requirement.duplicateGroupId = null
      requirement.mergedIntoRequirementId = primaryRequirementId
      requirement.linkedRequirementIds = []
      requirement.history.push(
        createHistoryEntry({
          action: 'Archived after duplicate merge',
          details: `Merged into ${primaryRequirementId}`,
          actor
        })
      )
    })

    const primaryLinkIds = [...primaryLinks]
    const relatedRequirements = await Requirement.find({
      projectId: primaryRequirement.projectId,
      isArchived: false,
      requirementId: { $nin: candidateIds },
      $or: [
        { linkedRequirementIds: { $in: duplicateIds } },
        { requirementId: { $in: primaryLinkIds } }
      ]
    })

    relatedRequirements.forEach((requirement) => {
      const currentLinks = requirement.linkedRequirementIds || []
      const nextLinks = new Set(
        currentLinks.filter(
          (linkedRequirementId) =>
            !duplicateIdSet.has(linkedRequirementId) &&
            linkedRequirementId !== requirement.requirementId
        )
      )

      if (primaryLinks.has(requirement.requirementId)) {
        nextLinks.add(primaryRequirementId)
      }

      const nextLinkList = [...nextLinks]
      if (haveSameItems(currentLinks, nextLinkList)) {
        return
      }

      requirement.linkedRequirementIds = nextLinkList
      requirement.history.push(
        createHistoryEntry({
          action: `Redirected duplicate links to ${primaryRequirementId}`,
          details: duplicateIds.join(', '),
          actor
        })
      )
    })

    await Promise.all([
      primaryRequirement.save(),
      ...duplicateRequirements.map((requirement) => requirement.save()),
      ...relatedRequirements.map((requirement) => requirement.save())
    ])

    return response.status(200).json({
      message: 'Duplicate requirements merged successfully.',
      primaryRequirement,
      archivedRequirementIds: duplicateIds,
      updatedLinkedRequirementIds: relatedRequirements.map((requirement) => requirement.requirementId)
    })
  } catch (error) {
    next(error)
  }
}

export async function archiveRequirement(request, response, next) {
  try {
    const requirement = await findActiveRequirement(request.params.id)
    if (!requirement) {
      return response.status(404).json({
        message: 'Requirement was not found.'
      })
    }

    if (requirement.status === 'locked') {
      return response.status(409).json({
        message: 'Locked requirements cannot be archived.'
      })
    }

    requirement.isArchived = true
    requirement.archivedAt = new Date()
    requirement.duplicateGroupId = null
    requirement.linkedRequirementIds = []
    requirement.history.push(
      createHistoryEntry({
        action: 'Archived requirement',
        actor: normalizeActor(request.body?.editedBy)
      })
    )

    const linkedRequirements = await Requirement.find({
      linkedRequirementIds: requirement.requirementId,
      isArchived: false
    })

    linkedRequirements.forEach((linkedRequirement) => {
      linkedRequirement.linkedRequirementIds = linkedRequirement.linkedRequirementIds.filter(
        (linkedRequirementId) => linkedRequirementId !== requirement.requirementId
      )
      linkedRequirement.history.push(
        createHistoryEntry({
          action: `Removed link to archived ${requirement.requirementId}`,
          details: requirement.title,
          actor: normalizeActor(request.body?.editedBy)
        })
      )
    })

    await Promise.all([
      requirement.save(),
      ...linkedRequirements.map((linkedRequirement) => linkedRequirement.save())
    ])

    return response.status(200).json({
      message: 'Requirement archived successfully.',
      removedLinkCount: linkedRequirements.length
    })
  } catch (error) {
    next(error)
  }
}

export async function addRequirementComment(request, response, next) {
  try {
    const requirement = await findActiveRequirement(request.params.id)
    if (!requirement) {
      return response.status(404).json({
        message: 'Requirement was not found.'
      })
    }

    const validationResult = validateCommentPayload(request.body)
    if (!validationResult.ok) {
      return sendValidationError(response, validationResult)
    }

    requirement.comments.push(validationResult.value)
    requirement.history.push(
      createHistoryEntry({
        action: getCommentHistoryAction(validationResult.value.kind),
        details: truncateText(validationResult.value.message),
        actor: validationResult.value.author
      })
    )
    await requirement.save()

    return response.status(201).json({
      message: 'Comment added successfully.',
      comment: requirement.comments.at(-1)
    })
  } catch (error) {
    next(error)
  }
}

export async function addAcceptanceCriteria(request, response, next) {
  try {
    const requirement = await findActiveRequirement(request.params.id)
    if (!requirement) {
      return response.status(404).json({
        message: 'Requirement was not found.'
      })
    }

    if (requirement.status === 'locked') {
      return response.status(409).json({
        message: 'Locked requirements cannot be modified.'
      })
    }

    const validationResult = validateCriteriaPayload(request.body)
    if (!validationResult.ok) {
      return sendValidationError(response, validationResult)
    }

    requirement.acceptanceCriteria.push(validationResult.value)
    requirement.versions.push(
      createVersionSnapshot(
        requirement,
        `Added acceptance criteria: ${truncateText(validationResult.value.text)}`,
        validationResult.value.createdBy
      )
    )
    requirement.history.push(
      createHistoryEntry({
        action: 'Added acceptance criteria',
        details: truncateText(validationResult.value.text),
        actor: validationResult.value.createdBy
      })
    )
    await requirement.save()

    return response.status(201).json({
      message: 'Acceptance criteria added successfully.',
      acceptanceCriteria: requirement.acceptanceCriteria.at(-1)
    })
  } catch (error) {
    next(error)
  }
}

export async function linkRequirement(request, response, next) {
  try {
    const requirement = await findActiveRequirement(request.params.id)
    if (!requirement) {
      return response.status(404).json({
        message: 'Requirement was not found.'
      })
    }

    if (requirement.status === 'locked') {
      return response.status(409).json({
        message: 'Locked requirements cannot be modified.'
      })
    }

    const validationResult = validateLinkPayload(request.body, requirement.requirementId)
    if (!validationResult.ok) {
      return sendValidationError(response, validationResult)
    }

    const { linkedRequirementId } = validationResult.value
    const linkedRequirement = await findActiveRequirement(linkedRequirementId)
    if (!linkedRequirement) {
      return response.status(404).json({
        message: 'Linked requirement was not found.'
      })
    }

    if (linkedRequirement.projectId !== requirement.projectId) {
      return response.status(409).json({
        message: 'Linked requirements must belong to the same project.'
      })
    }

    if (requirement.linkedRequirementIds.includes(linkedRequirementId)) {
      return response.status(409).json({
        message: 'Requirement is already linked.'
      })
    }

    const actor = normalizeActor(request.body.linkedBy)
    requirement.linkedRequirementIds.push(linkedRequirementId)
    requirement.versions.push(
      createVersionSnapshot(
        requirement,
        `Linked related requirement ${linkedRequirementId}`,
        actor
      )
    )
    requirement.history.push(
      createHistoryEntry({
        action: `Linked ${linkedRequirementId}`,
        details: linkedRequirement.title,
        actor
      })
    )

    if (!linkedRequirement.linkedRequirementIds.includes(requirement.requirementId)) {
      linkedRequirement.linkedRequirementIds.push(requirement.requirementId)
      linkedRequirement.versions.push(
        createVersionSnapshot(
          linkedRequirement,
          `Linked related requirement ${requirement.requirementId}`,
          actor
        )
      )
      linkedRequirement.history.push(
        createHistoryEntry({
          action: `Linked ${requirement.requirementId}`,
          details: requirement.title,
          actor
        })
      )
    }

    await Promise.all([requirement.save(), linkedRequirement.save()])

    return response.status(201).json({
      message: 'Requirement linked successfully.',
      linkedRequirementIds: requirement.linkedRequirementIds
    })
  } catch (error) {
    next(error)
  }
}

export async function unlinkRequirement(request, response, next) {
  try {
    const requirement = await findActiveRequirement(request.params.id)
    if (!requirement) {
      return response.status(404).json({
        message: 'Requirement was not found.'
      })
    }

    if (requirement.status === 'locked') {
      return response.status(409).json({
        message: 'Locked requirements cannot be modified.'
      })
    }

    const linkedRequirementId = normalizeText(request.params.linkedId).toUpperCase()
    if (!requirement.linkedRequirementIds.includes(linkedRequirementId)) {
      return response.status(404).json({
        message: 'Linked requirement relation was not found.'
      })
    }

    const linkedRequirement = await findActiveRequirement(linkedRequirementId)
    const actor = normalizeActor(request.body?.editedBy)

    requirement.linkedRequirementIds = requirement.linkedRequirementIds.filter(
      (id) => id !== linkedRequirementId
    )
    requirement.versions.push(
      createVersionSnapshot(
        requirement,
        `Unlinked related requirement ${linkedRequirementId}`,
        actor
      )
    )
    requirement.history.push(
      createHistoryEntry({
        action: `Unlinked ${linkedRequirementId}`,
        details: linkedRequirement?.title || null,
        actor
      })
    )

    if (linkedRequirement?.linkedRequirementIds.includes(requirement.requirementId)) {
      linkedRequirement.linkedRequirementIds = linkedRequirement.linkedRequirementIds.filter(
        (id) => id !== requirement.requirementId
      )
      linkedRequirement.versions.push(
        createVersionSnapshot(
          linkedRequirement,
          `Unlinked related requirement ${requirement.requirementId}`,
          actor
        )
      )
      linkedRequirement.history.push(
        createHistoryEntry({
          action: `Unlinked ${requirement.requirementId}`,
          details: requirement.title,
          actor
        })
      )
    }

    await Promise.all([
      requirement.save(),
      linkedRequirement ? linkedRequirement.save() : Promise.resolve()
    ])

    return response.status(200).json({
      message: 'Requirement unlinked successfully.',
      linkedRequirementIds: requirement.linkedRequirementIds
    })
  } catch (error) {
    next(error)
  }
}

export async function listRequirementVersions(request, response, next) {
  try {
    const requirement = await findActiveRequirement(request.params.id)
    if (!requirement) {
      return response.status(404).json({
        message: 'Requirement was not found.'
      })
    }

    return response.status(200).json({
      versions: requirement.versions
    })
  } catch (error) {
    next(error)
  }
}

export async function compareRequirementVersions(request, response, next) {
  try {
    const requirement = await findActiveRequirement(request.params.id)
    if (!requirement) {
      return response.status(404).json({
        message: 'Requirement was not found.'
      })
    }

    const fromVersion = Number(request.body.fromVersion)
    const toVersion = Number(request.body.toVersion)

    if (!Number.isInteger(fromVersion) || !Number.isInteger(toVersion)) {
      return response.status(400).json({
        message: 'fromVersion and toVersion must be integer version numbers.'
      })
    }

    const from = requirement.versions.find((version) => version.versionNumber === fromVersion)
    const to = requirement.versions.find((version) => version.versionNumber === toVersion)

    if (!from || !to) {
      return response.status(404).json({
        message: 'One or both selected versions were not found.'
      })
    }

    const fields = ['title', 'description', 'type', 'priority', 'status', 'acceptanceCriteria', 'linkedRequirementIds']
    const differences = fields
      .filter((field) => JSON.stringify(from.snapshot[field]) !== JSON.stringify(to.snapshot[field]))
      .map((field) => ({
        field,
        from: from.snapshot[field],
        to: to.snapshot[field]
      }))

    return response.status(200).json({
      fromVersion,
      toVersion,
      differences
    })
  } catch (error) {
    next(error)
  }
}
