require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todo-app';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connecte a MongoDB');
    app.listen(PORT, () => console.log(`Serveur demarre sur le port ${PORT}`));
  })
  .catch((err) => {
    console.error('Erreur de connexion a MongoDB :', err.message);
    process.exit(1);
  });
