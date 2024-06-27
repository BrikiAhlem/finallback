const express = require('express');
const router = express.Router();
const reponseController = require('../../controllers/quizFinal/reponsefinal');

// Créer une nouvelle réponse
router.post('/add', reponseController.createReponse);

// Récupérer les réponses d'une question donnée
router.get('/reponse/question/:id_question', reponseController.getReponsesByQuestionId);

module.exports = router;