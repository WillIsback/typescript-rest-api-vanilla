# Library API - REST API from Scratch

> Une API REST complète construite **sans framework** en TypeScript avec Node.js et SQLite, suivant les principes SOLID et les bonnes pratiques.

## 📋 Table des matières

- [À propos](#à-propos)
- [Caractéristiques](#caractéristiques)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Documentation](#documentation)
- [Sécurité](#sécurité)
- [Technologies](#technologies)

## 🎯 À propos

Ce projet est une **API REST construite from scratch** pour gérer une bibliothèque (livres et auteurs). L'objectif pédagogique est de comprendre les fondamentaux du développement backend en TypeScript sans s'appuyer sur des frameworks lourds comme Express ou Fastify.

### Pourquoi "from scratch" ?

- 🧠 **Apprentissage approfondi** : Comprendre le protocole HTTP, le routage, la validation
- 🔒 **Sécurité maîtrisée** : Injection SQL, validation des entrées, prepared statements
- ⚡ **Performance** : Contrôle total sur chaque aspect de l'application
- 📚 **Base solide** : Facilite l'apprentissage de frameworks plus tard

## ✨ Caractéristiques

- ✅ **API REST complète** avec CRUD sur Authors et Books
- ✅ **Base de données SQLite** avec relations many-to-many
- ✅ **Validation Zod** à l'entrée de chaque endpoint
- ✅ **Documentation Swagger** générée automatiquement depuis les schémas
- ✅ **TypeScript strict** pour la sécurité des types
- ✅ **Sécurité renforcée** : prepared statements, sanitization des inputs
- ✅ **Hot reload** avec nodemon pendant le développement
- ✅ **Linting moderne** avec Oxc (plus rapide qu'ESLint)
- ✅ **Code formaté** avec Prettier

## 🔧 Prérequis

- **Node.js** >= 22.20.0 (avec support expérimental de TypeScript natif)
- **pnpm** >= 10.18.0
- **TypeScript** 5.9.3

## 📦 Installation

```bash
# Cloner le projet
git clone <url-du-repo>
cd backend

# Installer les dépendances
pnpm install

# Initialiser la base de données (automatique au premier démarrage)
pnpm dev
```

## 🚀 Utilisation

### Développement

```bash
# Démarrer en mode développement (hot reload)
pnpm dev
```

Le serveur démarre sur **http://localhost:3000**

### Production

```bash
# Compiler le TypeScript
pnpm build

# Lancer le serveur
node dist/server.js
```

### Autres commandes

```bash
# Linter le code
pnpm lint

# Formater le code
pnpm format
```

## 🏗️ Architecture

Le projet suit une architecture en **couches séparées** pour faciliter la maintenance et les tests :

```
backend/
├── src/
│   ├── server.ts              # Point d'entrée, crée le serveur HTTP
│   ├── route/
│   │   └── route.ts           # Routeur principal, handlers HTTP
│   ├── lib/
│   │   ├── sql.lib.ts         # Fonctions CRUD pour SQLite
│   │   └── utils.lib.ts       # Utilitaires (JSON parsing, response)
│   ├── schemas/
│   │   └── schemas.ts         # Schémas Zod avec métadonnées OpenAPI
│   ├── services/
│   │   └── sqLite.service.ts  # Singleton de connexion DB
│   └── types/
│       └── library.type.ts    # Types TypeScript pour les entités
├── data/
│   └── library_db             # Base de données SQLite
├── dist/                      # Code compilé (ignoré par Git)
├── package.json
├── tsconfig.json
└── README.md
```

### Principes de conception

- **Séparation des responsabilités** : Routage, logique métier, accès données
- **Validation à l'entrée** : Schémas Zod vérifient chaque requête
- **Sécurité SQL** : Tous les queries utilisent des prepared statements
- **Types stricts** : TypeScript en mode strict pour éviter les erreurs runtime

## 🌐 API Endpoints

### Authors

| Méthode | Endpoint        | Description              |
|---------|-----------------|--------------------------|
| GET     | `/authors`      | Liste tous les auteurs   |
| GET     | `/authors/:id`  | Récupère un auteur par ID|
| POST    | `/authors`      | Crée un nouvel auteur    |
| PUT     | `/authors/:id`  | Met à jour un auteur     |
| DELETE  | `/authors/:id`  | Supprime un auteur       |

### Books

| Méthode | Endpoint              | Description                    |
|---------|-----------------------|--------------------------------|
| GET     | `/books`              | Liste tous les livres          |
| GET     | `/books/:id`          | Récupère un livre par ID       |
| GET     | `/books/:id/authors`  | Liste les auteurs d'un livre   |
| POST    | `/books`              | Crée un nouveau livre          |
| PUT     | `/books/:id`          | Met à jour un livre            |
| DELETE  | `/books/:id`          | Supprime un livre              |

### Associations

| Méthode | Endpoint        | Description                       |
|---------|-----------------|-----------------------------------|
| POST    | `/book-author`  | Associe un auteur à un livre      |

### Utilitaires

| Méthode | Endpoint          | Description                  |
|---------|-------------------|------------------------------|
| GET     | `/health`         | Santé du serveur             |
| GET     | `/docs`           | Documentation Swagger UI     |
| GET     | `/openapi.json`   | Spécification OpenAPI 3.0    |

## 📖 Documentation

### Swagger UI

La documentation interactive est disponible à **http://localhost:3000/docs**

Elle est **générée automatiquement** depuis les schémas Zod, garantissant la synchronisation entre code et documentation.

### Exemples de requêtes

#### Créer un auteur

```bash
curl -X POST http://localhost:3000/authors \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe"}'
```

#### Lister tous les livres

```bash
curl http://localhost:3000/books
```

#### Associer un auteur à un livre

```bash
curl -X POST http://localhost:3000/book-author \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe","title":"1984"}'
```

## 🔒 Sécurité

Le projet implémente plusieurs couches de sécurité :

### Protection contre l'injection SQL

✅ **Tous les queries utilisent des prepared statements**

```typescript
// ❌ DANGEREUX (injection SQL)
db.exec(`SELECT * FROM author WHERE name = '${userInput}'`)

// ✅ SÉCURISÉ (prepared statement)
db.prepare('SELECT * FROM author WHERE name = ?').get(userInput)
```

### Validation des entrées

✅ **Schémas Zod valident chaque requête**

```typescript
const authorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1)
})

const parsed = authorSchema.safeParse(body)
if (!parsed.success) {
  return sendJson(res, 400, { error: 'invalid payload' })
}
```

### Sanitization

✅ **Nettoyage des chaînes de caractères**

```typescript
const cleanString = (str: string): string => {
  return str.toLowerCase().replace(/\s+/g, ' ')
}
```

## 🛠️ Technologies

### Runtime & Langages

- **Node.js v22.20.0** - Runtime JavaScript avec support TypeScript expérimental
- **TypeScript 5.9.3** - Langage typé statiquement

### Base de données

- **SQLite (node:sqlite)** - Base de données embarquée, module natif Node.js

### Validation & Documentation

- **Zod** - Validation de schémas avec inférence de types TypeScript
- **@asteasolutions/zod-to-openapi** - Génération de specs OpenAPI depuis Zod
- **Swagger UI** - Interface de documentation interactive

### Développement

- **nodemon** - Hot reload pendant le développement
- **Oxc (oxlint)** - Linter ultra-rapide écrit en Rust
- **Prettier** - Formateur de code

### Gestionnaire de paquets

- **pnpm** - Gestionnaire de dépendances rapide et efficace

---

## 📝 Licence

Ce projet est à but pédagogique. Libre d'utilisation et de modification.

## 🤝 Contribution

Les contributions sont bienvenues ! N'hésite pas à ouvrir une issue ou une pull request.

---

**Construit avec ❤️ en TypeScript, sans framework, pour apprendre les fondamentaux**
