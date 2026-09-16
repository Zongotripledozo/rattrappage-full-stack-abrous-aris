const express = require('express');
const auth = require('../middlewares/auth');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

const router = express.Router();

router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Gestion des taches de l'utilisateur connecte (routes protegees par JWT)
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Recuperer les taches de l'utilisateur connecte (route protegee)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des taches de l'utilisateur
 *       401:
 *         description: Non authentifie
 *   post:
 *     summary: Creer une nouvelle tache liee a l'utilisateur connecte (route protegee)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [a faire, en cours, termine]
 *     responses:
 *       201:
 *         description: Tache creee
 *       400:
 *         description: Titre manquant
 *       401:
 *         description: Non authentifie
 */
router.get('/', getTasks);
router.post('/', createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Modifier une tache (uniquement si l'utilisateur en est le proprietaire)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [a faire, en cours, termine]
 *     responses:
 *       200:
 *         description: Tache mise a jour
 *       403:
 *         description: L'utilisateur n'est pas le proprietaire de la tache
 *       404:
 *         description: Tache introuvable
 *   delete:
 *     summary: Supprimer une tache (uniquement si l'utilisateur en est le proprietaire)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tache supprimee
 *       403:
 *         description: L'utilisateur n'est pas le proprietaire de la tache
 *       404:
 *         description: Tache introuvable
 */
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
