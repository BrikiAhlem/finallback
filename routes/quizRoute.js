const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const upload = require("../middleware/fileapp");

const { authenticateToken, generateToken } = require("../middleware/authMiddleware");
router.post('/Add/:id_cp',authenticateToken , quizController.createQuiz);
router.get('/lister', quizController.getAllQuizzes); 
router.get('/getQuizById/:id_q', quizController.getQuizById); 
router.get('/getLastQuizId', quizController.getLastQuizId);
router.get('/getQuizByCourseId/:id_course', quizController.getQuizByCourseId); 
router.get('/getQuizListAdmin', quizController.getQuizListAdmin);
router.post('/saveQuizScore/:id_q', quizController.saveQuizScore); 

module.exports = router; 