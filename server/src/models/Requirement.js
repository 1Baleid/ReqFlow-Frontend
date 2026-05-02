import mongoose from 'mongoose'

const userRefSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['client', 'manager', 'member', 'system'],
      default: 'system'
    }
  },
  { _id: false }
)

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: userRefSchema,
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    kind: {
      type: String,
      enum: ['comment', 'clarification-request', 'clarification-response'],
      default: 'comment'
    }
  },
  {
    timestamps: true
  }
)

const acceptanceCriteriaSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    createdBy: {
      type: userRefSchema,
      required: true
    }
  },
  {
    timestamps: true
  }
)

const versionSchema = new mongoose.Schema(
  {
    versionNumber: {
      type: Number,
      required: true,
      min: 1
    },
    snapshot: {
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        required: true,
        trim: true
      },
      type: {
        type: String,
        enum: ['functional', 'non-functional'],
        required: true
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
      },
      status: {
        type: String,
        enum: ['draft', 'review', 'approved', 'rejected', 'locked'],
        required: true
      },
      acceptanceCriteria: {
        type: [String],
        default: []
      },
      linkedRequirementIds: {
        type: [String],
        default: []
      }
    },
    changeSummary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    editedBy: {
      type: userRefSchema,
      required: true
    }
  },
  {
    timestamps: true
  }
)

const historySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    details: {
      type: String,
      trim: true,
      default: null,
      maxlength: 500
    },
    actor: {
      type: userRefSchema,
      required: true
    }
  },
  {
    timestamps: true
  }
)

const requirementSchema = new mongoose.Schema(
  {
    requirementId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    projectId: {
      type: String,
      required: true,
      trim: true,
      default: 'proj-1'
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 160
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000
    },
    originalDescription: {
      type: String,
      trim: true,
      minlength: 10,
      maxlength: 5000,
      default: function defaultOriginalDescription() {
        return this.description
      }
    },
    type: {
      type: String,
      enum: ['functional', 'non-functional'],
      default: 'functional'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['draft', 'review', 'approved', 'rejected', 'locked'],
      default: 'draft'
    },
    deadline: {
      type: Date,
      default: null
    },
    assignee: {
      type: userRefSchema,
      default: null
    },
    createdBy: {
      type: userRefSchema,
      required: true
    },
    acceptanceCriteria: {
      type: [acceptanceCriteriaSchema],
      default: []
    },
    linkedRequirementIds: {
      type: [String],
      default: []
    },
    duplicateGroupId: {
      type: String,
      trim: true,
      default: null
    },
    mergedFromIds: {
      type: [String],
      default: []
    },
    mergedIntoRequirementId: {
      type: String,
      trim: true,
      default: null
    },
    archivedAt: {
      type: Date,
      default: null
    },
    comments: {
      type: [commentSchema],
      default: []
    },
    versions: {
      type: [versionSchema],
      default: []
    },
    history: {
      type: [historySchema],
      default: []
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

requirementSchema.index({ projectId: 1, status: 1, priority: 1 })
requirementSchema.index({ projectId: 1, duplicateGroupId: 1 })
requirementSchema.index({ title: 'text', description: 'text' })

requirementSchema.pre('validate', function setRequirementId(next) {
  if (!this.requirementId) {
    const suffix = Date.now().toString().slice(-6)
    this.requirementId = `REQ-${suffix}`
  }

  next()
})

export const Requirement =
  mongoose.models.Requirement || mongoose.model('Requirement', requirementSchema)
