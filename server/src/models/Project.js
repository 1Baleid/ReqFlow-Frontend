import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    color: {
      type: String,
      default: '#1353d8'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        role: {
          type: String,
          enum: ['manager', 'member', 'client'],
          default: 'member'
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    status: {
      type: String,
      enum: ['active', 'archived', 'completed'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
)

export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema)
