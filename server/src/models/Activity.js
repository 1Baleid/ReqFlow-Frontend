import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['created', 'updated', 'approved', 'rejected', 'commented', 'assigned', 'status_changed', 'deadline_set'],
      required: true
    },
    actor: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, default: 'member' }
    },
    targetType: {
      type: String,
      enum: ['requirement', 'project', 'user'],
      required: true
    },
    targetId: {
      type: String,
      required: true
    },
    targetTitle: {
      type: String,
      trim: true
    },
    projectId: {
      type: String,
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
)

activitySchema.index({ projectId: 1, createdAt: -1 })
activitySchema.index({ actor: 1, createdAt: -1 })

export const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema)
