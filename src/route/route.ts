import http from "http"
import { parse as parseUrl } from "url"
import { readJsonBody, sendJson } from "../lib/utils.lib.js"
import {
  authorSchema,
  bookSchema,
  bookAuthorSchema,
} from "../schemas/schemas.js"
import {
  createAuthor,
  getAuthorById,
  getAllAuthors,
  updateAuthor,
  deleteAuthor,
  createBook,
  getBookById,
  getAllBooks,
  updateBook,
  deleteBook,
  getBookWithAuthors,
  addAuthorToBook,
} from "../lib/sql.lib.js"

import fs from "fs"
import path from "path"
import swaggerUiDist from "swagger-ui-dist"
import { z } from "zod"
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi"

// Créer le registry OpenAPI
const registry = new OpenAPIRegistry()

// Enregistrer les routes avec registry.registerPath()
registry.registerPath({
  method: "get",
  path: "/authors",
  summary: "Get all authors",
  responses: {
    200: {
      description: "List of all authors",
      content: {
        "application/json": {
          schema: z.array(authorSchema.extend({ id: z.number() })),
        },
      },
    },
  },
})

registry.registerPath({
  method: "post",
  path: "/authors",
  summary: "Create a new author",
  request: {
    body: {
      content: {
        "application/json": {
          schema: authorSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Author created successfully",
      content: {
        "application/json": {
          schema: z.object({ id: z.number() }),
        },
      },
    },
    400: {
      description: "Invalid request payload",
    },
  },
})

registry.registerPath({
  method: "get",
  path: "/authors/{id}",
  summary: "Get author by ID",
  request: {
    params: z.object({
      id: z.string().openapi({ param: { name: "id", in: "path" } }),
    }),
  },
  responses: {
    200: {
      description: "Author found",
      content: {
        "application/json": {
          schema: authorSchema,
        },
      },
    },
    404: {
      description: "Author not found",
    },
  },
})

registry.registerPath({
  method: "put",
  path: "/authors/{id}",
  summary: "Update author",
  request: {
    params: z.object({
      id: z.string().openapi({ param: { name: "id", in: "path" } }),
    }),
    body: {
      content: {
        "application/json": {
          schema: authorSchema,
        },
      },
    },
  },
  responses: {
    204: {
      description: "Author updated successfully",
    },
    400: {
      description: "Invalid request payload",
    },
  },
})

registry.registerPath({
  method: "delete",
  path: "/authors/{id}",
  summary: "Delete author",
  request: {
    params: z.object({
      id: z.string().openapi({ param: { name: "id", in: "path" } }),
    }),
  },
  responses: {
    204: {
      description: "Author deleted successfully",
    },
  },
})

registry.registerPath({
  method: "get",
  path: "/books",
  summary: "Get all books",
  responses: {
    200: {
      description: "List of all books",
      content: {
        "application/json": {
          schema: z.array(bookSchema.extend({ id: z.number() })),
        },
      },
    },
  },
})

registry.registerPath({
  method: "post",
  path: "/books",
  summary: "Create a new book",
  request: {
    body: {
      content: {
        "application/json": {
          schema: bookSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Book created successfully",
      content: {
        "application/json": {
          schema: z.object({ id: z.number() }),
        },
      },
    },
    400: {
      description: "Invalid request payload",
    },
  },
})

registry.registerPath({
  method: "get",
  path: "/books/{id}",
  summary: "Get book by ID",
  request: {
    params: z.object({
      id: z.string().openapi({ param: { name: "id", in: "path" } }),
    }),
  },
  responses: {
    200: {
      description: "Book found",
      content: {
        "application/json": {
          schema: bookSchema,
        },
      },
    },
    404: {
      description: "Book not found",
    },
  },
})

registry.registerPath({
  method: "put",
  path: "/books/{id}",
  summary: "Update book",
  request: {
    params: z.object({
      id: z.string().openapi({ param: { name: "id", in: "path" } }),
    }),
    body: {
      content: {
        "application/json": {
          schema: bookSchema,
        },
      },
    },
  },
  responses: {
    204: {
      description: "Book updated successfully",
    },
    400: {
      description: "Invalid request payload",
    },
  },
})

registry.registerPath({
  method: "delete",
  path: "/books/{id}",
  summary: "Delete book",
  request: {
    params: z.object({
      id: z.string().openapi({ param: { name: "id", in: "path" } }),
    }),
  },
  responses: {
    204: {
      description: "Book deleted successfully",
    },
  },
})

registry.registerPath({
  method: "get",
  path: "/books/{id}/authors",
  summary: "Get book with its authors",
  request: {
    params: z.object({
      id: z.string().openapi({ param: { name: "id", in: "path" } }),
    }),
  },
  responses: {
    200: {
      description: "Book with authors",
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              bookId: z.number(),
              title: z.string(),
              genre: z.string(),
              published: z.string(),
              state: z.string().nullable(),
              authorId: z.number(),
              firstName: z.string(),
              lastName: z.string(),
            }),
          ),
        },
      },
    },
  },
})

registry.registerPath({
  method: "post",
  path: "/book-author",
  summary: "Associate author with book",
  request: {
    body: {
      content: {
        "application/json": {
          schema: bookAuthorSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Association created successfully",
    },
    400: {
      description: "Invalid request payload",
    },
  },
})

// Générer le document OpenAPI avec OpenApiGeneratorV3
const generator = new OpenApiGeneratorV3(registry.definitions)
const openapi = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Library API",
    description: "REST API for managing books and authors with SQLite",
  },
  servers: [{ url: "http://localhost:3000" }],
})

// Créer notre propre swagger-initializer.js avec l'URL de notre API
const swaggerInitializer = `
window.onload = function() {
  window.ui = SwaggerUIBundle({
    url: "/openapi.json",
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  });
};
`

// request handler exporté pour être utilisé par server.ts
export const requestHandler = async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) => {
  const { pathname } = parseUrl(req.url || "", true)
  const method = (req.method || "GET").toUpperCase()

  try {
    // serve OpenAPI spec and Swagger UI before API routes
    if (method === "GET" && pathname === "/openapi.json") {
      return sendJson(res, 200, openapi)
    }
    // Servir la page Swagger UI (on redirige vers /docs/ avec trailing slash pour les chemins relatifs)
    if (method === "GET" && pathname === "/docs") {
      res.writeHead(302, { Location: "/docs/" })
      return res.end()
    }
    // Servir tous les assets Swagger UI sous /docs/
    if (method === "GET" && pathname && pathname.startsWith("/docs/")) {
      // Cas spécial : swagger-initializer.js avec notre configuration
      if (pathname === "/docs/swagger-initializer.js") {
        res.writeHead(200, { "Content-Type": "application/javascript" })
        return res.end(swaggerInitializer)
      }
      // Pour /docs/, servir index.html
      const file =
        pathname === "/docs/" ? "index.html" : pathname.replace("/docs/", "")
      const abs = path.join(swaggerUiDist.getAbsoluteFSPath(), file)
      if (!fs.existsSync(abs)) return sendJson(res, 404, { error: "not found" })
      const ext = path.extname(abs).slice(1)
      const map: Record<string, string> = {
        js: "application/javascript",
        css: "text/css",
        html: "text/html",
        png: "image/png",
        svg: "image/svg+xml",
      }
      res.writeHead(200, {
        "Content-Type": map[ext] ?? "application/octet-stream",
      })
      return fs.createReadStream(abs).pipe(res)
    }

    // health
    if (method === "GET" && pathname === "/health") {
      return sendJson(res, 200, { ok: true })
    }

    // AUTHORS
    if (pathname === "/authors" && method === "GET") {
      const authors = getAllAuthors()
      return sendJson(res, 200, authors)
    }

    if (pathname === "/authors" && method === "POST") {
      const body = await readJsonBody(req)
      const parsed = authorSchema.safeParse(body)
      if (!parsed.success)
        return sendJson(res, 400, {
          error: "invalid payload",
          issues: parsed.error.issues,
        })
      const id = createAuthor(parsed.data.firstName, parsed.data.lastName)
      return sendJson(res, 201, { id })
    }

    if (pathname && pathname.startsWith("/authors/") && method === "GET") {
      const id = Number(pathname.split("/")[2])
      const author = getAuthorById(id)
      return sendJson(res, author ? 200 : 404, author ?? { error: "not found" })
    }

    if (pathname && pathname.startsWith("/authors/") && method === "PUT") {
      const id = Number(pathname.split("/")[2])
      const body = await readJsonBody(req)
      const parsed = authorSchema.safeParse(body)
      if (!parsed.success)
        return sendJson(res, 400, {
          error: "invalid payload",
          issues: parsed.error.issues,
        })
      updateAuthor(id, parsed.data.firstName, parsed.data.lastName)
      return sendJson(res, 204)
    }

    if (pathname && pathname.startsWith("/authors/") && method === "DELETE") {
      const id = Number(pathname.split("/")[2])
      deleteAuthor(id)
      return sendJson(res, 204)
    }

    // BOOKS
    if (pathname === "/books" && method === "GET") {
      const books = getAllBooks()
      return sendJson(res, 200, books)
    }

    if (pathname === "/books" && method === "POST") {
      const body = await readJsonBody(req)
      const parsed = bookSchema.safeParse(body)
      if (!parsed.success)
        return sendJson(res, 400, {
          error: "invalid payload",
          issues: parsed.error.issues,
        })
      const id = createBook(
        parsed.data.title,
        parsed.data.genre,
        parsed.data.published,
        parsed.data.state ?? undefined,
      )
      return sendJson(res, 201, { id })
    }

    if (pathname && pathname.startsWith("/books/") && method === "GET") {
      const id = Number(pathname.split("/")[2])
      const book = getBookById(id)
      return sendJson(res, book ? 200 : 404, book ?? { error: "not found" })
    }

    if (pathname && pathname.startsWith("/books/") && method === "PUT") {
      const id = Number(pathname.split("/")[2])
      const body = await readJsonBody(req)
      const parsed = bookSchema.safeParse(body)
      if (!parsed.success)
        return sendJson(res, 400, {
          error: "invalid payload",
          issues: parsed.error.issues,
        })
      updateBook(
        id,
        parsed.data.title,
        parsed.data.genre,
        parsed.data.published,
        parsed.data.state ?? undefined,
      )
      return sendJson(res, 204)
    }

    if (pathname && pathname.startsWith("/books/") && method === "DELETE") {
      const id = Number(pathname.split("/")[2])
      deleteBook(id)
      return sendJson(res, 204)
    }

    // Book with authors
    if (
      pathname &&
      pathname.startsWith("/books/") &&
      pathname.endsWith("/authors") &&
      method === "GET"
    ) {
      const id = Number(pathname.split("/")[2])
      const rows = getBookWithAuthors(id)
      return sendJson(res, 200, rows)
    }

    // association endpoint (simple): POST /book-author { firstName, lastName, title }
    if (pathname === "/book-author" && method === "POST") {
      const body = await readJsonBody(req)
      const parsed = bookAuthorSchema.safeParse(body)
      if (!parsed.success)
        return sendJson(res, 400, {
          error: "invalid payload",
          issues: parsed.error.issues,
        })
      addAuthorToBook(
        parsed.data.firstName,
        parsed.data.lastName,
        parsed.data.title,
      )
      return sendJson(res, 201, { ok: true })
    }

    // fallback
    sendJson(res, 404, { error: "endpoint not found" })
  } catch (err) {
    const message = (err as Error).message || "server error"
    sendJson(res, 500, { error: message })
  }
}

export default requestHandler
