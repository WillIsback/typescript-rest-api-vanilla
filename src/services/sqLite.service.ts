import { DatabaseSync } from "node:sqlite"

/**
 * @brief tentative d'interace global persitente pour ne pas crée une nouvelle session a chaque hot reload
 */

declare global {
  var client: DatabaseSync | undefined
}

function getDB(): DatabaseSync {
  if (!global.client) {
    global.client = new DatabaseSync("data/library_db")
  }
  return global.client
}

export { getDB }
