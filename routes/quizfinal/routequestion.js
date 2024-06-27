const express = require('express');
const router = express.Router();

const questionController = require('../../controllers/quizFinal/questionfinal');

const upload = require("../../middleware/fileapp");


router.post('/Add', questionController.createQuestion); 
router.get('/liste/questions/:id_quiz', questionController.getQuestionsByQuizId); 



module.exports = router;  
