const express = require('express');
const router = express.Router();

const questionController = require('../controllers/questionController');

const upload = require("../middleware/fileapp");


router.post('/add', questionController.createQuestion);


router.get('/gestionQuiz/:id_q', questionController.getQuestionsByIdQuiz);

module.exports = router;