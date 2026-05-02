import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['approval', 'rejection', 'comment', 'assignment', 'deadline', 'mention', 'status_change'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    relatedType: {
      type: String,
      enum: ['requirement', 'project', 'comment'],
      default: 'requirement'
    },
    relatedId: {
      type: String,
      default: null
    },
    read: {
      type: Boolean,
      default: false
    },
    actorId: {
      type: String,
      default: null
    },
    actorName: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
)

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 })

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema)
