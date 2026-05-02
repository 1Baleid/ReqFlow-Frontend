import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectToDatabase() {
  await mongoose.connect(env.mongodbUri)
}

export async function disconnectFromDatabase() {
  await mongoose.disconnect()
}
