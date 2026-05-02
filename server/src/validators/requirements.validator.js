const allowedTypes = ['functional', 'non-functional']
const allowedPriorities = ['low', 'medium', 'high', 'critical']
const allowedStatuses = ['draft', 'review', 'approved', 'rejected', 'locked']
const allowedCommentKinds = ['comment', 'clarification-request', 'clarification-response']

export function normalizeText(value) {
  return String(value || '').trim()
}

export function normalizeActor(actor = {}) {
  return {
    id: normalizeText(actor.id) || 'anonymous',
    name: normalizeText(actor.name) || 'Anonymous User',
    role: ['client', 'manager', 'member', 'system'].includes(actor.role) ? actor.role : 'system'
  }
}

export function validateCreateRequirementPayload(body) {
  const title = normalizeText(body.title)
  const description = normalizeText(body.description)
  const projectId = normalizeText(body.projectId) || 'proj-1'
  const type = normalizeText(body.type) || 'functional'
  const priority = normalizeText(body.priority) || 'medium'
  const status = normalizeText(body.status) || 'draft'

  if (title.length < 3) {
    return { ok: false, status: 400, message: 'Title must be at least 3 characters long.' }
  }

  if (description.length < 10) {
    return { ok: false, status: 400, message: 'Description must be at least 10 characters long.' }
  }

  if (!allowedTypes.includes(type)) {
    return { ok: false, status: 400, message: 'Requirement type must be functional or non-functional.' }
  }

  if (!allowedPriorities.includes(priority)) {
    return { ok: false, status: 400, message: 'Priority must be low, medium, high, or critical.' }
  }

  if (!allowedStatuses.includes(status)) {
    return { ok: false, status: 400, message: 'Status is not supported.' }
  }

  return {
    ok: true,
    value: {
      title,
      description,
      originalDescription: description,
      projectId,
      type,
      priority,
      status,
      deadline: body.deadline || null,
      assignee: body.assignee || null,
      createdBy: normalizeActor(body.createdBy)
    }
  }
}

export function validateUpdateRequirementPayload(body) {
  const relationshipFields = [
    'acceptanceCriteria',
    'linkedRequirementIds',
    'comments',
    'versions',
    'assignee',
    'deadline',
    'status',
    'rejectionReason',
    'originalDescription'
  ]
  const submittedRelationshipField = relationshipFields.find((field) => body[field] !== undefined)
  if (submittedRelationshipField) {
    return {
      ok: false,
      status: 400,
      message: `${submittedRelationshipField} must be changed through its dedicated endpoint.`
    }
  }

  const update = {}

  if (body.title !== undefined) {
    const title = normalizeText(body.title)
    if (title.length < 3) {
      return { ok: false, status: 400, message: 'Title must be at least 3 characters long.' }
    }
    update.title = title
  }

  if (body.description !== undefined) {
    const description = normalizeText(body.description)
    if (description.length < 10) {
      return { ok: false, status: 400, message: 'Description must be at least 10 characters long.' }
    }
    update.description = description
  }

  if (body.type !== undefined) {
    const type = normalizeText(body.type)
    if (!allowedTypes.includes(type)) {
      return { ok: false, status: 400, message: 'Requirement type must be functional or non-functional.' }
    }
    update.type = type
  }

  if (body.priority !== undefined) {
    const priority = normalizeText(body.priority)
    if (!allowedPriorities.includes(priority)) {
      return { ok: false, status: 400, message: 'Priority must be low, medium, high, or critical.' }
    }
    update.priority = priority
  }

  if (Object.keys(update).length === 0) {
    return { ok: false, status: 400, message: 'At least one editable field is required.' }
  }

  const editedBy = normalizeActor(body.editedBy)
  const changeSummary = normalizeText(body.changeSummary)

  if (editedBy.role === 'member' && !changeSummary) {
    return {
      ok: false,
      status: 400,
      message: 'Team Members must provide a non-empty refinement justification.'
    }
  }

  return {
    ok: true,
    value: {
      update,
      changeSummary: changeSummary || 'Requirement updated',
      editedBy
    }
  }
}

export function validateCommentPayload(body) {
  const message = normalizeText(body.message)
  const kind = normalizeText(body.kind) || 'comment'
  const author = normalizeActor(body.author)

  if (!message) {
    return { ok: false, status: 400, message: 'Comment message is required.' }
  }

  if (!allowedCommentKinds.includes(kind)) {
    return { ok: false, status: 400, message: 'Comment kind is not supported.' }
  }

  if (kind === 'clarification-request' && author.role !== 'member') {
    return { ok: false, status: 403, message: 'Only Team Members can request clarification.' }
  }

  if (kind === 'clarification-response' && author.role !== 'client') {
    return { ok: false, status: 403, message: 'Only Clients can submit clarification responses.' }
  }

  return {
    ok: true,
    value: {
      message,
      kind,
      author
    }
  }
}

export function validateCriteriaPayload(body) {
  const text = normalizeText(body.text)

  if (!text) {
    return { ok: false, status: 400, message: 'Acceptance criteria text is required.' }
  }

  return {
    ok: true,
    value: {
      text,
      createdBy: normalizeActor(body.createdBy)
    }
  }
}

export function validateLinkPayload(body, currentRequirementId) {
  const linkedRequirementId = normalizeText(body.linkedRequirementId).toUpperCase()

  if (!linkedRequirementId) {
    return { ok: false, status: 400, message: 'Linked requirement ID is required.' }
  }

  if (linkedRequirementId === currentRequirementId.toUpperCase()) {
    return { ok: false, status: 409, message: 'A requirement cannot be linked to itself.' }
  }

  return { ok: true, value: { linkedRequirementId } }
}

export function validateDuplicatePayload(body) {
  const requirementIds = Array.isArray(body.requirementIds)
    ? [...new Set(
      body.requirementIds
        .map((requirementId) => normalizeText(requirementId).toUpperCase())
        .filter(Boolean)
    )]
    : []
  const actor = normalizeActor(body.actor)

  if (actor.role !== 'manager') {
    return { ok: false, status: 403, message: 'Only Managers can mark duplicate requirements.' }
  }

  if (requirementIds.length < 2) {
    return { ok: false, status: 400, message: 'At least two requirements must be selected.' }
  }

  return {
    ok: true,
    value: {
      requirementIds,
      actor
    }
  }
}

export function validateMergePayload(body) {
  const duplicateGroupId = normalizeText(body.duplicateGroupId)
  const primaryRequirementId = normalizeText(body.primaryRequirementId).toUpperCase()
  const actor = normalizeActor(body.actor)

  if (actor.role !== 'manager') {
    return { ok: false, status: 403, message: 'Only Managers can merge duplicate requirements.' }
  }

  if (!duplicateGroupId) {
    return { ok: false, status: 400, message: 'Duplicate group ID is required.' }
  }

  if (!primaryRequirementId) {
    return { ok: false, status: 400, message: 'Primary requirement ID is required.' }
  }

  return {
    ok: true,
    value: {
      duplicateGroupId,
      primaryRequirementId,
      actor
    }
  }
}

export function validateAssignPayload(body) {
  const member = body.member || {}
  const assignee = normalizeActor({
    id: member.id,
    name: member.name,
    role: member.role || 'member'
  })

  if (!assignee.id || assignee.id === 'anonymous') {
    return { ok: false, status: 400, message: 'Assigned member ID is required.' }
  }

  if (!assignee.name || assignee.name === 'Anonymous User') {
    return { ok: false, status: 400, message: 'Assigned member name is required.' }
  }

  if (assignee.role !== 'member') {
    return { ok: false, status: 400, message: 'Requirement can only be assigned to a Team Member.' }
  }

  return {
    ok: true,
    value: {
      assignee,
      actor: normalizeActor(body.actor)
    }
  }
}

export function validateDeadlinePayload(body) {
  const deadline = normalizeText(body.deadline)

  if (!deadline) {
    return { ok: false, status: 400, message: 'Deadline date is required.' }
  }

  const parsedDate = new Date(deadline)
  if (Number.isNaN(parsedDate.getTime())) {
    return { ok: false, status: 400, message: 'Deadline date is invalid.' }
  }

  return {
    ok: true,
    value: {
      deadline,
      actor: normalizeActor(body.actor)
    }
  }
}

export function validateStatusPayload(body) {
  const status = normalizeText(body.status)

  if (!allowedStatuses.includes(status)) {
    return { ok: false, status: 400, message: 'Status is not supported.' }
  }

  const reason = normalizeText(body.reason)
  if (status === 'rejected' && !reason) {
    return { ok: false, status: 400, message: 'Rejection reason is required.' }
  }

  return {
    ok: true,
    value: {
      status,
      reason: reason || null,
      actor: normalizeActor(body.actor)
    }
  }
}
