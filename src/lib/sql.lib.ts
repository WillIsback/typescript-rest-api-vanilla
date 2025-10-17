import { getDB } from "../services/sqLite.service.js";


const db = getDB()

const validateString = (string : string) : string => {
    if(!string.length){
        throw new Error("la chaine de caractere est vide")
    } else {

        return string
    }
}

const cleanString = (string : string) : string => {
    return string.toLowerCase().replace(/\s+/g, ' ');
}

const insertBookAuthor = (firstName : string, lastName: string, title: string) : void => {
    const cleanFirstName = cleanString(validateString(firstName))
    const cleanLastName = cleanString(validateString(lastName))
    const cleanTitle = cleanString(validateString(title))
    console.log("cleanFirstName cleanLastName  cleanTitle", cleanFirstName, cleanLastName, cleanTitle)
    const stmt = db.prepare(`
            INSERT INTO book_author (bookId, authorId)  
            SELECT 
                (SELECT id FROM book WHERE lower(title) = ? ),
                (SELECT id FROM author WHERE lower(firstName) = ? AND lower(lastName) = ? )
        `);
    stmt.run(cleanTitle, cleanFirstName, cleanLastName)
}

function initDB(){
    const query = db.prepare('SELECT COUNT(*) as total FROM book, author').get()
    if (query == null || query['total'] == null) {
        console.warn('la requete BDD renvois un résultat nul ou undefined :', query)
        return null
    } else {
        const isEmpty = Number(query['total']) === 0
        console.log('isEmpty :', isEmpty)

        if(isEmpty)
        {
            db.exec(`
                INSERT INTO author VALUES
                    (NULL, 'Pierre','Palamos'),
                    (NULL, 'Jean','Deslpiero'),
                    (NULL, 'Elise','Porgia');
                `);
            db.exec(`
                INSERT INTO book VALUES
                    (NULL,'Le temps d''un instant', 'roman','2005-05-01', NULL),
                    (NULL, 'Le chevalier Noir', 'fantasy','2015-09-12', 'to-read'),
                    (NULL, 'Le petit poussé', 'roman', '2001-02-25', 'finished'),
                    (NULL, 'Albert Schuman', 'biographie','2012-11-14', 'reading')
                `);
            insertBookAuthor('Pierre','Palamos',"Le temps d'un instant")
            insertBookAuthor('Pierre','Palamos',"Le chevalier Noir")
            insertBookAuthor('Jean','Deslpiero',"Le temps d'un instant")
            insertBookAuthor('Jean','Deslpiero',"Albert Schuman")
            insertBookAuthor('Elise','Porgia',"Le petit poussé")
            insertBookAuthor('Elise','Porgia',"Le chevalier Noir")
        }
    }
} 

const createAuthor = (firstName: string, lastName: string): number => {
    const f = cleanString(validateString(firstName))
    const l = cleanString(validateString(lastName))
    const stmt = db.prepare('INSERT INTO author (firstName, lastName) VALUES (?, ?)')
    const info = stmt.run(f, l) // returns { changes, lastInsertRowid } avec better-sqlite3
    return Number(info.lastInsertRowid)
}

const getAuthorById = (id: number) => {
    return db.prepare('SELECT id, firstName, lastName FROM author WHERE id = ?').get(id)
}

const getAllAuthors = () => {
    return db.prepare('SELECT id, firstName, lastName FROM author ORDER BY lastName, firstName').all()
}

const updateAuthor = (id: number, firstName: string, lastName: string) => {
    const f = cleanString(validateString(firstName))
    const l = cleanString(validateString(lastName))
    return db.prepare('UPDATE author SET firstName = ?, lastName = ? WHERE id = ?').run(f, l, id)
}

const deleteAuthor = (id: number) => {
    // supprimer relations avant si contrainte FK en cascade non activée
    db.prepare('DELETE FROM book_author WHERE authorId = ?').run(id)
    return db.prepare('DELETE FROM author WHERE id = ?').run(id)
}

// Book CRUD (handling state nullable, published as ISO string)
const createBook = (title: string, genre: string, published: string, state?: string): number => {
    const t = cleanString(validateString(title))
    const g = cleanString(validateString(genre))
    const p = cleanString(validateString(published)) // ou validate date format avant
    const stmt = db.prepare('INSERT INTO book (title, genre, published, state) VALUES (?, ?, ?, ?)')
    const info = stmt.run(t, g, p, state ?? null)
    return Number(info.lastInsertRowid)
}

const getBookById = (id: number) => {
    return db.prepare('SELECT id, title, genre, published, state FROM book WHERE id = ?').get(id)
}

const getAllBooks = () => {
    return db.prepare('SELECT id, title, genre, published, state FROM book ORDER BY title').all()
}

const updateBook = (id: number, title: string, genre: string, published: string, state?: string) => {
    const t = cleanString(validateString(title))
    const g = cleanString(validateString(genre))
    const p = cleanString(validateString(published))
    return db.prepare('UPDATE book SET title = ?, genre = ?, published = ?, state = ? WHERE id = ?')
             .run(t, g, p, state ?? null, id)
}

const deleteBook = (id: number) => {
    db.prepare('DELETE FROM book_author WHERE bookId = ?').run(id)
    return db.prepare('DELETE FROM book WHERE id = ?').run(id)
}

// Jointure : lister un livre avec ses auteurs
const getBookWithAuthors = (bookId: number) => {
    return db.prepare(`
        SELECT b.id AS bookId, b.title, b.genre, b.published, b.state,
               a.id AS authorId, a.firstName, a.lastName
        FROM book b
        LEFT JOIN book_author ba ON ba.bookId = b.id
        LEFT JOIN author a ON a.id = ba.authorId
        WHERE b.id = ?
    `).all(bookId) // .all() renvoie plusieurs lignes
}

// Ajouter une relation (sécurisé, évite doublons)
const addAuthorToBook = (firstName: string, lastName: string, title: string) => {
    const f = cleanString(validateString(firstName))
    const l = cleanString(validateString(lastName))
    const t = cleanString(validateString(title))

    const bookRow = db.prepare('SELECT id FROM book WHERE lower(title) = ?').get(t)
    const authorRow = db.prepare('SELECT id FROM author WHERE lower(firstName) = ? AND lower(lastName) = ?').get(f, l)

    if (!bookRow || !authorRow) {
        throw new Error('book or author not found')
    }
    const bookId = Number(bookRow.id)
    const authorId = Number(authorRow.id)
    // unique (bookId, authorId) -> on ignore si déjà présent
    db.prepare('INSERT OR IGNORE INTO book_author (bookId, authorId) VALUES (?, ?)').run(bookId, authorId)
}
export { initDB, createAuthor, createBook, getAuthorById, getAllAuthors, updateAuthor, deleteAuthor, getBookById, getAllBooks, updateBook, deleteBook, getBookWithAuthors, addAuthorToBook }