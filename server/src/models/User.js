import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['client', 'manager', 'member'],
      default: 'client'
    }
  },
  {
    timestamps: true
  }
)

export const User = mongoose.models.User || mongoose.model('User', userSchema)
