import { z } from "zod"
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"

// Extend Zod with OpenAPI metadata support (appeler une fois au démarrage)
extendZodWithOpenApi(z)

// schemas Zod (validation "à la porte") enrichis avec .openapi()
const authorSchema = z
  .object({
    firstName: z.string().min(1).openapi({ example: "Jane" }),
    lastName: z.string().min(1).openapi({ example: "Doe" }),
  })
  .openapi("Author")

const bookSchema = z
  .object({
    title: z.string().min(1).openapi({ example: "1984" }),
    genre: z.string().min(1).openapi({ example: "Fiction" }),
    published: z.string().min(1).openapi({ example: "2024-01-15" }), // ici on accepte la chaîne ISO
    state: z
      .enum(["to-read", "reading", "finished"])
      .nullable()
      .optional()
      .openapi({ example: "to-read" }),
  })
  .openapi("Book")

const bookAuthorSchema = z
  .object({
    firstName: z.string().min(1).openapi({ example: "George" }),
    lastName: z.string().min(1).openapi({ example: "Orwell" }),
    title: z.string().min(1).openapi({ example: "1984" }),
  })
  .openapi("BookAuthor")

export { authorSchema, bookSchema, bookAuthorSchema }
