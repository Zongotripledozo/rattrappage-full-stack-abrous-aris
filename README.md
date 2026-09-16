# To-Do List securisee

Application de gestion de taches avec authentification JWT. Chaque utilisateur ne voit, ne modifie et ne supprime que ses propres taches.

## Stack

- Backend : Node.js, Express, MongoDB (Mongoose), JWT, bcrypt
- Frontend : React (Create React App), React Router, Context API, Axios, CSS simple
- Documentation API : Swagger (OpenAPI) sur `/api-docs`
- Tests : Jest + Supertest + mongodb-memory-server
- Deploiement local : Docker Compose (MongoDB + backend + frontend)
- Deploiement en ligne : Render, 100% Docker (MongoDB, backend et frontend tournent chacun dans leur propre conteneur, voir `render.yaml`). MongoDB est sur une instance payante avec disque persistant (obligatoire pour recevoir du trafic reseau prive sur Render) ; backend et frontend restent gratuits.

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

> **A savoir** : les services **gratuits** de Render ne peuvent jamais **recevoir** de trafic sur le reseau interne (ils peuvent seulement en envoyer) - c'est une limite du plan gratuit, pas un probleme de configuration. Comme `todo-backend` doit se connecter a `todo-mongo`, **`todo-mongo` doit etre sur une instance payante** (la moins chere : `0.5c-512mb`, quelques dollars/mois - le prix exact est affiche dans le dashboard Render au moment de choisir le plan). `todo-backend` et `todo-frontend`, eux, restent gratuits. Un disque persistant de 1 Go est attache a `todo-mongo` pour que les donnees (comptes, taches) survivent aux redeploiements.

### Option A - Deploiement automatique via Blueprint (recommande)

Le fichier `render.yaml` a la racine du projet decrit les 3 services, **tous en type "Web Service"** (sur le plan gratuit, "Private Service" et "Background Worker" ne sont pas disponibles : seuls Web Service, Static Site, Render Postgres et Render Key Value le sont) :
- `todo-mongo` : Web Service **payant** (`plan: 0.5c-512mb`), image officielle `mongo:7` (aucun build necessaire), disque persistant de 1 Go monte sur `/data/db`, avec `PORT=27017` pour que Render sache sur quel port sonder le conteneur (mongod ecoute sur son port par defaut, 27017). Cote securite : ce service a bien une URL publique `https://todo-mongo-xxxx.onrender.com`, mais elle ne sert a rien pour un client MongoDB (Render n'y route que du HTTP(S) en entree publique) ; seul le reseau interne Render permet une vraie connexion Mongo - et seule une instance payante peut recevoir ce trafic interne.
- `todo-backend` : Web Service **gratuit**, `runtime: docker`, utilise `Backend/Dockerfile`, `PORT=5000`, deja configure avec `MONGO_URI` pointant vers l'adresse interne de `todo-mongo`.
- `todo-frontend` : Web Service **gratuit**, `runtime: docker`, utilise `Frontend/Dockerfile`, `PORT=3000`.

> **Important sur le nom d'hote interne** : ce n'est **pas** simplement le `name` du service. Render ajoute un suffixe aleatoire propre a chaque service cree (ex. `todo-mongo-3bdj`, visible sur la page du service > bouton "Connect" > onglet "Internal") - c'est ce qui causait l'erreur `getaddrinfo ENOTFOUND todo-mongo` lors du premier essai. Le `render.yaml` actuel utilise deja le suffixe reel de ce deploiement. **Si le service `todo-mongo` est un jour supprime et recree, ce suffixe changera** et il faudra remettre a jour `MONGO_URI` avec la nouvelle valeur (visible dans le meme onglet "Internal").

Etapes :
1. Sur https://dashboard.render.com : "New +" > "Blueprint", selectionner le repo `rattrappage-full-stack-abrous-aris`.
2. Render propose de creer les 3 services et va demander une confirmation de paiement pour `todo-mongo` (instance payante + disque). Il demandera aussi `CLIENT_URL` (sur le backend) et `REACT_APP_API_URL` (sur le frontend) : laisser vide pour l'instant, ces deux services n'ayant pas encore d'URL.
3. Lancer le deploiement. Une fois les 3 services up, noter les URLs generees pour `todo-backend` et `todo-frontend` (ex. `https://todo-backend-xxxx.onrender.com`, `https://todo-frontend-xxxx.onrender.com`).
4. Verifier l'adresse interne exacte de `todo-mongo` : sur sa page de service > bouton "Connect" > onglet "Internal". Si elle differe de celle deja dans `render.yaml`, mettre a jour `MONGO_URI` sur `todo-backend` en consequence.
5. Mettre a jour les variables (etape "Relier le backend au frontend" ci-dessous) puis redeployer.

### Option B - Creation manuelle des 3 services

1. **MongoDB** : "New +" > "Web Service" > "Deploy an existing image" > image `docker.io/library/mongo:7`. Choisir un plan **payant** (le moins cher disponible, ex. "Starter"/`0.5c-512mb`) - le plan Free ne peut pas recevoir de trafic prive et le backend ne pourra jamais s'y connecter. Ajouter un disque persistant (ex. 1 Go, mount path `/data/db`). Nommer le service `todo-mongo`. Variable d'environnement `PORT` = `27017`.
2. **Backend** : "New +" > "Web Service", connecter le repo GitHub. Root Directory `Backend`, Runtime Docker (utilise `Backend/Dockerfile`), plan Free. Variables d'environnement :
   - `PORT` = `5000`
   - `MONGO_URI` = `mongodb://<adresse-interne-de-todo-mongo>:27017/todo-app` -> recuperer l'adresse exacte (avec son suffixe aleatoire, ex. `todo-mongo-3bdj`) via "Connect" > "Internal" sur la page de `todo-mongo`. Ne pas utiliser le simple nom `todo-mongo` : ca ne resout pas (`getaddrinfo ENOTFOUND`).
   - `JWT_SECRET` = une chaine aleatoire longue (Render peut la generer)
   - `JWT_EXPIRES_IN` = `7d`
   - `CLIENT_URL` = laisser vide pour l'instant
   Deployer, puis verifier `https://todo-backend-xxxx.onrender.com/api/health` -> `{"status":"ok"}`, et `/api-docs` pour Swagger.
3. **Frontend** : "New +" > "Web Service" (pas "Static Site"), meme repo, plan Free. Root Directory `Frontend`, Runtime Docker (utilise `Frontend/Dockerfile`). Variables d'environnement : `PORT` = `3000` et `REACT_APP_API_URL` = `https://todo-backend-xxxx.onrender.com/api`.
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
- **Le backend "Failed deploy" / ne demarre pas** : le cas le plus frequent est que `todo-mongo` est encore sur le plan **Free** -> un service gratuit ne peut jamais recevoir de trafic reseau prive (confirme par la doc Render), la connexion echoue systematiquement et `server.js` fait `process.exit(1)` immediatement, ce que Render interprete comme un echec de deploiement (pas un simple redemarrage a retenter). Solution : passer `todo-mongo` sur un plan payant (`0.5c-512mb` minimum). Si `todo-mongo` est deja payant et que ca persiste, verifier l'adresse interne exacte via "Connect" > "Internal" sur sa page de service, et comparer avec `MONGO_URI` sur le backend.
- **Toutes mes taches/comptes ont disparu** : verifier qu'un disque persistant est bien attache a `todo-mongo` (page du service > onglet "Disks"). Sans disque, meme une instance payante repart d'une base vide a chaque redeploiement/redemarrage.
- **401 sur toutes les routes taches** : verifier que le frontend envoie bien `Authorization: Bearer <token>` (voir `src/api/axios.js`) et que `JWT_SECRET` est identique entre les requetes (ne pas le regenerer apres coup, sinon les anciens tokens deviennent invalides).
- **Le frontend Docker ne demarre pas sur Render** : verifier les logs de build -> si `npm run build` echoue, c'est generalement une erreur de compilation React ; si le conteneur demarre puis Render le juge "unhealthy", verifier que rien ne force un port fixe (le `Dockerfile` utilise deja `${PORT:-3000}`, fourni automatiquement par Render).
- **"service type is not available for this plan" lors du sync du Blueprint** : le plan gratuit de Render n'autorise pas les types "Private Service" ni "Background Worker" (seuls Web Service, Static Site, Render Postgres et Render Key Value sont gratuits). C'est pourquoi `todo-mongo` est declare en `type: web` dans `render.yaml` avec `PORT=27017` -> si l'erreur persiste, verifie que les 3 services du `render.yaml` sont bien tous en `type: web`.
- **`getaddrinfo ENOTFOUND todo-mongo` dans les logs du backend** : le nom d'hote interne n'est pas le simple `name` du service, Render y ajoute un suffixe aleatoire propre a chaque service (ex. `todo-mongo-3bdj`) -> va chercher la vraie valeur via "Connect" > "Internal" sur la page de `todo-mongo` et mets a jour `MONGO_URI` sur le backend avec cette valeur exacte.

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
