# To-Do List securisee

Application de gestion de taches avec authentification JWT. Chaque utilisateur ne voit, ne modifie et ne supprime que ses propres taches.

## Stack

- Backend : Node.js, Express, MongoDB (Mongoose), JWT, bcrypt
- Frontend : React (Create React App), React Router, Context API, Axios, CSS simple
- Documentation API : Swagger (OpenAPI) sur `/api-docs`
- Tests : Jest + Supertest + mongodb-memory-server
- Deploiement : Docker Compose (MongoDB + backend + frontend)

## Lancer le projet avec Docker

Pre-requis : Docker + Docker Compose.

```bash
docker compose up --build
```

- Frontend : http://localhost:3000
- Backend API : http://localhost:5000/api
- Documentation Swagger : http://localhost:5000/api-docs
- MongoDB : mongodb://localhost:27017/todo-app

## Lancer sans Docker

### Backend

```bash
cd Backend
cp .env.example .env
npm install
npm run dev
```

Necessite une instance MongoDB accessible via `MONGO_URI` (par defaut `mongodb://localhost:27017/todo-app`).

### Frontend

```bash
cd Frontend
npm install
npm start
```

## Tests backend

```bash
cd Backend
npm test
```

Le test `tests/auth.test.js` verifie qu'une inscription avec un email deja existant renvoie une erreur 400.

## Deploiement (Render)

- Backend : https://<a-completer>.onrender.com
- Frontend : https://<a-completer>.onrender.com

## Structure du projet

```
Backend/
  controllers/    # logique metier (auth, tasks)
  middlewares/    # auth JWT, gestion des erreurs
  models/         # User, Task
  routes/         # routes Express + doc Swagger
  tests/          # tests Jest
  app.js          # config Express
  server.js       # point d'entree

Frontend/
  src/
    api/          # client axios
    context/      # AuthContext (token JWT)
    components/   # PrivateRoute, TaskForm, TaskList, TaskItem
    pages/        # Login, Register, Dashboard
```
