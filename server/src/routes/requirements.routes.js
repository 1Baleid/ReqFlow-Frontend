import { Router } from 'express'
import {
  addAcceptanceCriteria,
  addRequirementComment,
  archiveRequirement,
  assignRequirement,
  compareRequirementVersions,
  createRequirement,
  getRequirement,
  linkRequirement,
  listRequirementVersions,
  listRequirements,
  markRequirementsAsDuplicates,
  mergeDuplicateRequirements,
  setRequirementDeadline,
  setRequirementStatus,
  unlinkRequirement,
  updateRequirement
} from '../controllers/requirements.controller.js'

const router = Router()

router.get('/', listRequirements)
router.post('/', createRequirement)
router.post('/duplicates', markRequirementsAsDuplicates)
router.post('/duplicates/merge', mergeDuplicateRequirements)
router.get('/:id', getRequirement)
router.patch('/:id', updateRequirement)
router.delete('/:id', archiveRequirement)
router.patch('/:id/assign', assignRequirement)
router.patch('/:id/deadline', setRequirementDeadline)
router.patch('/:id/status', setRequirementStatus)
router.post('/:id/comments', addRequirementComment)
router.post('/:id/acceptance-criteria', addAcceptanceCriteria)
router.post('/:id/links', linkRequirement)
router.delete('/:id/links/:linkedId', unlinkRequirement)
router.get('/:id/versions', listRequirementVersions)
router.post('/:id/versions/compare', compareRequirementVersions)

export default router
