import { StringDecoder } from 'string_decoder'
import http from 'http'

// helper: lire body JSON
const readJsonBody = (req: http.IncomingMessage): Promise<any> =>
  new Promise((resolve, reject) => {
    const decoder = new StringDecoder('utf8')
    let buffer = ''
    req.on('data', (chunk) => (buffer += decoder.write(chunk)))
    req.on('end', () => {
      buffer += decoder.end()
      if (!buffer) return resolve(null)
      try { resolve(JSON.parse(buffer)) }
      catch (err) { reject(new Error(err ? `Invalid JSON : ${err}` : 'Invalid JSON')) }
    })
    req.on('error', reject)
  })

// helper: envoyer réponse JSON
const sendJson = (res: http.ServerResponse, status = 200, payload: any = {}) => {
  const body = JSON.stringify(payload)
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(body)
}


export { readJsonBody, sendJson }