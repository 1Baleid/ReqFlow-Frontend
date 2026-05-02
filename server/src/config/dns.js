import dns from 'node:dns'
import { env } from './env.js'

export function configureDnsServers() {
  if (env.dnsServers.length === 0) {
    return
  }

  dns.setServers(env.dnsServers)
  console.log(`Using custom DNS servers: ${env.dnsServers.join(', ')}`)
}
