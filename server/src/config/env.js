import dotenv from 'dotenv'

dotenv.config()

// On Vercel, PORT is not required
const isVercel = process.env.VERCEL === '1'
const requiredVariables = isVercel
  ? ['MONGODB_URI', 'JWT_SECRET']
  : ['PORT', 'MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL']

for (const variableName of requiredVariables) {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`)
  }
}

export const env = {
  port: Number.parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL || '*',
  isVercel,
  dnsServers: process.env.DNS_SERVERS
    ? process.env.DNS_SERVERS.split(',').map((server) => server.trim()).filter(Boolean)
    : []
}
