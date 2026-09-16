function notFound(req, res, next) {
  res.status(404).json({ message: 'Route introuvable.' });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (err.code === 11000) {
    return res.status(400).json({ message: 'Cet email est deja utilise.' });
  }

  res.status(err.status || 500).json({ message: err.message || 'Erreur serveur.' });
}

module.exports = { notFound, errorHandler };
