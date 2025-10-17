type Author = {
  id: number
  firstName: string
  lastName: string
}

type Book = {
  id: number
  title: string
  genre: string
  published: Date
  state: "to-read" | "reading" | "finished" | undefined
}

type Authors = Author[]

type Books = Book[]

type BookWithAuthors = {
  book: Book
  authors: Author[]
}

type AuthorWithBooks = {
  author: Author
  books: Book[]
}

export type { Author, Book, Books, Authors, BookWithAuthors, AuthorWithBooks }
