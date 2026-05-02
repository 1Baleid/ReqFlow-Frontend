import app from './app.js'
import { connectToDatabase } from './config/database.js'
import { configureDnsServers } from './config/dns.js'
import { env } from './config/env.js'

function logStartupError(error) {
  console.error('Failed to start server')

  if (error?.code === 'ENOTFOUND' && String(error?.hostname || '').startsWith('_mongodb._tcp.')) {
    console.error(
      'MongoDB SRV lookup failed. Check that MONGODB_URI is complete and URL-encode special characters in the database password.'
    )
  }

  console.error(error)
}

// Connect to database for serverless
let isConnected = false

async function connectDB() {
  if (isConnected) return
  try {
    configureDnsServers()
    await connectToDatabase()
    isConnected = true
  } catch (error) {
    logStartupError(error)
    throw error
  }
}

// For Vercel serverless
export default async function handler(req, res) {
  await connectDB()
  return app(req, res)
}

// For local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  async function startServer() {
    try {
      await connectDB()
      app.listen(env.port, () => {
        console.log(`ReqFlow API listening on http://localhost:${env.port}`)
      })
    } catch (error) {
      logStartupError(error)
      process.exit(1)
    }
  }

  startServer()
}
