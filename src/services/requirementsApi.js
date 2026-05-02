const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'

function createError(message, status = 500) {
  const error = new Error(message)
  error.status = status
  return error
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw createError(data.message || 'Request failed.', response.status)
  }

  return data
}

function formatDate(value) {
  if (!value) {
    return 'Just now'
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return String(value)
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function normalizeComment(comment) {
  return {
    id: comment._id || comment.id,
    author: comment.author?.name || 'Unknown',
    role: comment.author?.role || 'member',
    kind: comment.kind || 'comment',
    timestampLabel: formatDate(comment.createdAt),
    message: comment.message
  }
}

function normalizeHistory(version) {
  return {
    id: version._id || `version-${version.versionNumber}`,
    type: 'version',
    description: version.changeSummary,
    actorName: version.editedBy?.name || 'Unknown',
    timestamp: version.createdAt
  }
}

function normalizeActivityHistory(historyItem) {
  return {
    id: historyItem._id || historyItem.id,
    type: 'activity',
    description: historyItem.details
      ? `${historyItem.action}: ${historyItem.details}`
      : historyItem.action,
    actorName: historyItem.actor?.name || 'Unknown',
    timestamp: historyItem.createdAt
  }
}

function normalizeVersion(version) {
  return {
    id: version._id || `version-${version.versionNumber}`,
    label: `V${version.versionNumber}`,
    versionNumber: version.versionNumber,
    actorName: version.editedBy?.name || 'Unknown',
    createdAt: version.createdAt,
    summary: version.changeSummary || 'Requirement updated',
    snapshot: version.snapshot || {}
  }
}

export function normalizeRequirement(requirement) {
  const id = requirement.requirementId || requirement.id

  return {
    ...requirement,
    id,
    status: requirement.status || 'draft',
    updatedAt: formatDate(requirement.updatedAt),
    version: String(requirement.versions?.length || 1),
    originalDescription:
      requirement.originalDescription ||
      requirement.versions?.[0]?.snapshot?.description ||
      requirement.description,
    assigneeId: requirement.assignee?.id || null,
    assignee: requirement.assignee || null,
    createdBy: requirement.createdBy || null,
    acceptanceCriteria: (requirement.acceptanceCriteria || []).map((criteria) =>
      typeof criteria === 'string' ? criteria : criteria.text
    ),
    linkedRequirementIds: requirement.linkedRequirementIds || [],
    duplicateGroupId: requirement.duplicateGroupId || null,
    mergedFromIds: requirement.mergedFromIds || [],
    mergedIntoRequirementId: requirement.mergedIntoRequirementId || null,
    archivedAt: requirement.archivedAt || null,
    comments: (requirement.comments || []).map(normalizeComment),
    history: (requirement.history && requirement.history.length > 0
      ? requirement.history.map(normalizeActivityHistory)
      : (requirement.versions || []).map(normalizeHistory)),
    versions: (requirement.versions || []).map(normalizeVersion)
  }
}

export async function listRequirements(query = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Handle arrays (for multi-select filters)
      if (Array.isArray(value)) {
        if (value.length > 0) {
          searchParams.set(key, value.join(','))
        }
      } else {
        searchParams.set(key, value)
      }
    }
  })

  const queryString = searchParams.toString()
  const data = await request(`/requirements${queryString ? `?${queryString}` : ''}`)

  return {
    requirements: (data.requirements || []).map(normalizeRequirement)
  }
}

export async function createRequirement(payload) {
  const data = await request('/requirements', {
    method: 'POST',
    body: JSON.stringify(payload)
  })

  return {
    ...data,
    requirement: normalizeRequirement(data.requirement)
  }
}

export async function getRequirement(requirementId) {
  const data = await request(`/requirements/${requirementId}`)

  return {
    requirement: normalizeRequirement(data.requirement)
  }
}

export async function updateRequirement(requirementId, payload) {
  const data = await request(`/requirements/${requirementId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })

  return {
    ...data,
    requirement: normalizeRequirement(data.requirement)
  }
}

export async function archiveRequirement(requirementId, editedBy) {
  return request(`/requirements/${requirementId}`, {
    method: 'DELETE',
    body: JSON.stringify({ editedBy })
  })
}

export async function assignRequirement(requirementId, payload) {
  const data = await request(`/requirements/${requirementId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })

  return {
    ...data,
    requirement: normalizeRequirement(data.requirement)
  }
}

export async function setRequirementDeadline(requirementId, payload) {
  const data = await request(`/requirements/${requirementId}/deadline`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })

  return {
    ...data,
    requirement: normalizeRequirement(data.requirement)
  }
}

export async function setRequirementStatus(requirementId, payload) {
  const data = await request(`/requirements/${requirementId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })

  return {
    ...data,
    requirement: normalizeRequirement(data.requirement)
  }
}

export async function addRequirementComment(requirementId, payload) {
  return request(`/requirements/${requirementId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function addAcceptanceCriteria(requirementId, payload) {
  return request(`/requirements/${requirementId}/acceptance-criteria`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function linkRequirement(requirementId, payload) {
  return request(`/requirements/${requirementId}/links`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function unlinkRequirement(requirementId, linkedRequirementId, editedBy) {
  return request(`/requirements/${requirementId}/links/${linkedRequirementId}`, {
    method: 'DELETE',
    body: JSON.stringify({ editedBy })
  })
}

export async function markRequirementsAsDuplicates(payload) {
  return request('/requirements/duplicates', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function mergeDuplicateRequirements(payload) {
  const data = await request('/requirements/duplicates/merge', {
    method: 'POST',
    body: JSON.stringify(payload)
  })

  return {
    ...data,
    primaryRequirement: data.primaryRequirement
      ? normalizeRequirement(data.primaryRequirement)
      : null
  }
}

export async function listRequirementVersions(requirementId) {
  const data = await request(`/requirements/${requirementId}/versions`)

  return {
    versions: (data.versions || []).map(normalizeVersion)
  }
}

export async function compareRequirementVersions(requirementId, payload) {
  return request(`/requirements/${requirementId}/versions/compare`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}
