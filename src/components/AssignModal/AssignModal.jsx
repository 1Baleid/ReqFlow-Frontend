import { useState } from 'react'
import Modal from '../Modal'
import Button from '../Button'
import './AssignModal.css'

// Mock team members data
const teamMembers = [
  {
    id: 'user-1',
    name: 'Sarah Jenkins',
    role: 'Senior Backend Developer',
    activeTasks: 5,
    capacity: 85,
    isOnline: true
  },
  {
    id: 'user-2',
    name: 'Alex Rivera',
    role: 'UI Lead',
    activeTasks: 2,
    capacity: 30,
    isOnline: true
  },
  {
    id: 'user-3',
    name: 'Marcus Chen',
    role: 'DevOps Engineer',
    activeTasks: 9,
    capacity: 100,
    isOverloaded: true,
    isOnline: false
  },
  {
    id: 'user-4',
    name: 'Elena Rodriguez',
    role: 'Full Stack Developer',
    activeTasks: 4,
    capacity: 60,
    isOnline: true
  }
]

function AssignModal({ isOpen, onClose, requirementId, currentAssignee, onAssign }) {
  const [selectedMember, setSelectedMember] = useState(currentAssignee || null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = () => {
    if (selectedMember) {
      onAssign(selectedMember)
      onClose()
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reassign Requirement"
      subtitle={`Update the owner for ${requirementId}`}
      size="medium"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!selectedMember}>
            Confirm Assignment
          </Button>
        </>
      }
    >
      <div className="assign-modal__content">
        {/* Search */}
        <div className="assign-modal__search">
          <span className="material-symbols-outlined assign-modal__search-icon">search</span>
          <input
            type="text"
            className="assign-modal__search-input"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Team Members List */}
        <div className="assign-modal__list">
          {filteredMembers.map((member) => (
            <button
              key={member.id}
              className={`assign-modal__member ${selectedMember === member.id ? 'assign-modal__member--selected' : ''}`}
              onClick={() => setSelectedMember(member.id)}
            >
              <div className="assign-modal__member-left">
                <div className="assign-modal__member-avatar">
                  {member.name.split(' ').map(n => n[0]).join('')}
                  {member.isOnline && (
                    <span className="assign-modal__member-status" />
                  )}
                </div>
                <div className="assign-modal__member-info">
                  <p className="assign-modal__member-name">{member.name}</p>
                  <p className="assign-modal__member-role">{member.role}</p>
                </div>
              </div>
              <div className="assign-modal__member-right">
                <span className={`assign-modal__member-tasks ${member.isOverloaded ? 'assign-modal__member-tasks--overloaded' : ''}`}>
                  {member.activeTasks} active tasks
                </span>
                <span className={`assign-modal__member-capacity ${member.isOverloaded ? 'assign-modal__member-capacity--overloaded' : ''}`}>
                  {member.isOverloaded ? 'Overloaded' : `${member.capacity}% Capacity`}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default AssignModal
