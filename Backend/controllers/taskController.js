const Task = require('../models/Task');

async function getTasks(req, res, next) {
  try {
    const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Le titre est obligatoire.' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      owner: req.user.id,
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tache introuvable.' });
    }

    if (task.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Acces refuse : vous n'etes pas le proprietaire de cette tache." });
    }

    const { title, description, status } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    await task.save();

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tache introuvable.' });
    }

    if (task.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Acces refuse : vous n'etes pas le proprietaire de cette tache." });
    }

    await task.deleteOne();

    res.status(200).json({ message: 'Tache supprimee.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTasks, createTask, updateTask, deleteTask };
