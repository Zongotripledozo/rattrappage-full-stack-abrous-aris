# To-Do List securisee

Application de gestion de taches avec authentification JWT. Chaque utilisateur ne voit, ne modifie et ne supprime que ses propres taches.

## Stack

- Backend : Node.js, Express, MongoDB (Mongoose), JWT, bcrypt
- Frontend : React (Create React App), React Router, Context API, Axios, CSS simple
- Documentation API : Swagger (OpenAPI) sur `/api-docs`
- Tests : Jest + Supertest + mongodb-memory-server
- Deploiement local : Docker Compose (MongoDB + backend + frontend)
- Deploiement en ligne : Render, 100% Docker (MongoDB, backend et frontend tournent chacun dans leur propre conteneur, voir `render.yaml`)

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

Les 3 composants (MongoDB, backend, frontend) tournent chacun dans leur propre conteneur Docker sur Render, sans service externe (pas de MongoDB Atlas).

> **A savoir** : MongoDB tourne ici sur un service Render **gratuit**, donc **sans disque persistant**. Toutes les donnees (comptes, taches) sont perdues a chaque redeploiement et a chaque reveil du service apres une mise en veille pour inactivite. C'est un choix assume pour rester 100% gratuit ; pour des donnees qui survivent, il faudrait un disque persistant Render (payant) ou une base managee externe (MongoDB Atlas).

### Option A - Deploiement automatique via Blueprint (recommande)

Le fichier `render.yaml` a la racine du projet decrit les 3 services :
- `todo-mongo` : service prive (`pserv`), image officielle `mongo:7`, aucun build necessaire.
- `todo-backend` : Web Service, `runtime: docker`, utilise `Backend/Dockerfile`, deja configure avec `MONGO_URI=mongodb://todo-mongo:27017/todo-app` (nom d'hote interne Render, resolu automatiquement entre services du meme projet).
- `todo-frontend` : Web Service, `runtime: docker`, utilise `Frontend/Dockerfile`.

Etapes :
1. Sur https://dashboard.render.com : "New +" > "Blueprint", selectionner le repo `rattrappage-full-stack-abrous-aris`.
2. Render propose de creer les 3 services. Il demandera `CLIENT_URL` (sur le backend) et `REACT_APP_API_URL` (sur le frontend) : laisser vide pour l'instant, ces deux services n'ayant pas encore d'URL.
3. Lancer le deploiement. Une fois les 3 services up, noter les URLs generees pour `todo-backend` et `todo-frontend` (ex. `https://todo-backend-xxxx.onrender.com`, `https://todo-frontend-xxxx.onrender.com`).
4. Mettre a jour les variables (etape "Relier le backend au frontend" ci-dessous) puis redeployer.

Si "free" n'est pas propose pour le type de service "Private Service" sur ton compte, cree `todo-mongo` manuellement en "Web Service" avec la meme image (`docker.io/library/mongo:7`) et le plan gratuit : ca fonctionne aussi, Mongo n'etant joignable en pratique que via le reseau interne Render pour les autres services.

### Option B - Creation manuelle des 3 services

1. **MongoDB** : "New +" > "Private Service" (ou "Web Service" si "Private Service" n'a pas de plan gratuit chez toi) > "Deploy an existing image" > image `docker.io/library/mongo:7` > plan Free. Nommer le service `todo-mongo`.
2. **Backend** : "New +" > "Web Service", connecter le repo GitHub. Root Directory `Backend`, Runtime Docker (utilise `Backend/Dockerfile`). Variables d'environnement :
   - `MONGO_URI` = `mongodb://todo-mongo:27017/todo-app` (le nom du service Mongo sert de nom d'hote interne)
   - `JWT_SECRET` = une chaine aleatoire longue (Render peut la generer)
   - `JWT_EXPIRES_IN` = `7d`
   - `CLIENT_URL` = laisser vide pour l'instant
   - Ne pas definir `PORT` : Render l'injecte automatiquement et `server.js` le lit deja via `process.env.PORT`.
   Deployer, puis verifier `https://todo-backend-xxxx.onrender.com/api/health` -> `{"status":"ok"}`, et `/api-docs` pour Swagger.
3. **Frontend** : "New +" > "Web Service" (pas "Static Site"), meme repo. Root Directory `Frontend`, Runtime Docker (utilise `Frontend/Dockerfile`). Variable d'environnement `REACT_APP_API_URL` = `https://todo-backend-xxxx.onrender.com/api`.
   Important : Render fournit automatiquement les variables d'environnement du service comme build-arg Docker pour tout `ARG` du meme nom dans le Dockerfile (voir `ARG REACT_APP_API_URL` dans `Frontend/Dockerfile`) : la valeur est donc figee dans le bundle au moment du build. Tout changement necessite un redeploiement complet (pas juste un restart).
   Pas besoin de regle de reecriture separee pour le routing : le flag `-s` de `serve` (voir `CMD` du Dockerfile) renvoie deja `index.html` pour toute route inconnue, ce qui fait fonctionner React Router apres un rafraichissement.

### Relier le backend au frontend (CORS)

1. Sur le service `todo-backend` > "Environment".
2. Mettre a jour `CLIENT_URL` avec l'URL du frontend (ex. `https://todo-frontend-xxxx.onrender.com`, sans slash final).
3. Sauvegarder : Render redeploie automatiquement le backend.
4. Tester l'application complete depuis l'URL du frontend : inscription, connexion, creation/modification/suppression de taches.

### Erreurs frequentes ("connexion" qui echoue)

- **CORS bloque les requetes** : `CLIENT_URL` sur le backend ne correspond pas exactement a l'URL du frontend (http vs https, avec ou sans slash final). Il doit s'agir de l'origine exacte, sans slash a la fin.
- **Le frontend appelle `localhost`** : `REACT_APP_API_URL` n'a pas ete defini (ou etait faux) au moment du build Docker sur Render (il est fige dans le bundle a la compilation, via l'`ARG` du Dockerfile) -> corriger la variable puis relancer un deploiement complet du service frontend (pas juste un restart).
- **Le backend ne demarre pas / boucle au demarrage** : normal lors du tout premier deploiement si `todo-mongo` n'est pas encore pret (le backend quitte immediatement si la connexion Mongo initiale echoue) -> Render le redemarre automatiquement, attendre 1-2 cycles. Si ca persiste, verifier que `MONGO_URI` correspond exactement au nom du service Mongo (`mongodb://todo-mongo:27017/todo-app`).
- **Toutes mes taches/comptes ont disparu** : comportement attendu avec Mongo sans disque persistant (voir encadre plus haut) -> le service Mongo a redemarre (redeploiement ou reveil apres mise en veille) et est reparti d'une base vide.
- **401 sur toutes les routes taches** : verifier que le frontend envoie bien `Authorization: Bearer <token>` (voir `src/api/axios.js`) et que `JWT_SECRET` est identique entre les requetes (ne pas le regenerer apres coup, sinon les anciens tokens deviennent invalides).
- **Le frontend Docker ne demarre pas sur Render** : verifier les logs de build -> si `npm run build` echoue, c'est generalement une erreur de compilation React ; si le conteneur demarre puis Render le juge "unhealthy", verifier que rien ne force un port fixe (le `Dockerfile` utilise deja `${PORT:-3000}`, fourni automatiquement par Render).

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
