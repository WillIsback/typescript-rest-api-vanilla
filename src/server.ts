import http from 'http'
import { initDB } from './lib/sql.lib.js'
import requestHandler from './route/route.js'

const port = Number(process.env.PORT ?? 3000)

try { initDB() } catch (e) { console.warn('initDB failed:', (e as Error).message) }

const server = http.createServer(requestHandler)

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`)
})

export default server