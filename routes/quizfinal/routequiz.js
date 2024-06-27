const express = require('express');
const router = express.Router();
const quizController = require('../../controllers/quizFinal/quizController');
const upload = require("../../middleware/fileapp");

const { authenticateToken, generateToken } = require("../../middleware/authMiddleware");
router.post('/Add/:formationId' ,authenticateToken, quizController.createQuiz);
router.get('/lister', quizController.getAllQuizzes); 
router.get('/getQuizById/:id_q', quizController.getQuizById); 
router.get('/getLastQuizId', quizController.getLastQuizId);
router.get('/tableAdmin', quizController.getQuizDetails);
router.get('/:id_Q', quizController.getQuizWithQuestionsAndAnswers); 
router.get('/donner', quizController.getAllQuizzesWithInstructor);   
router.get('/quizzes', quizController.getAllQuizzesDetails);
router.post('/save-score', authenticateToken, quizController.saveParticipantScore); 
router.get('/quizze/:formationId', quizController.getQuizzesByFormationId);

module.exports = router;   
 