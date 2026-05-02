import app from './app.js'
import { connectToDatabase } from './config/database.js'
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

async function startServer() {
  try {
    await connectToDatabase()
    app.listen(env.port, () => {
      console.log(`ReqFlow API listening on http://localhost:${env.port}`)
    })
  } catch (error) {
    logStartupError(error)
    process.exit(1)
  }
}

startServer()
