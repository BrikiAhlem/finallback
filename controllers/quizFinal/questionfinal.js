const Question = require('../../models/quizFinal/questionfinal'); // Importez le modèle pour la gestion des questions
const Quiz = require('../../models/quizFinal/quizFinal'); // Importez le modèle pour la gestion des quiz
const db = require('../../config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);
const { authenticateToken } = require('../../middleware/authMiddleware');
const createQuestion = async (req, res) => {
    try {
        // Récupérer l'ID du dernier quiz
        const lastQuizId = await Quiz.getLastQuizId();

        // Créer la question avec l'ID du dernier quiz
        const questionData = { ...req.body, id_quiz: lastQuizId }; 
        const questionId = await Question.createQuestion(questionData);

        res.status(201).json({ success: true, message: 'Question créée avec succès', questionId });
    } catch (error) {
        console.error('Erreur lors de la création de la question :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const getLastQuizId = async () => {
  try {
    const result = await query(`
      SELECT id_q
      FROM quizfinal
      ORDER BY id_q DESC
      LIMIT 1
    `);

    // Vérifier si un quiz a été trouvé
    if (result.length === 0) {
      return { success: false, message: "Aucun quiz trouvé." };
    }

    // Récupérer l'ID du dernier quiz
    const lastQuizId = result[0].id_q;

    return { success: true, lastQuizId };
  } catch (error) {
    throw error;
  }
};
const getLastQuestionId = async (req, res) => {
    try {
        const lastQuestionId = await Question.getLastQuestionId();
        res.status(200).json({ success: true, lastQuestionId });
    } catch (error) {
        console.error('Erreur lors de la récupération du dernier ID de question :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const getQuestionsByQuizId = async (req, res, next) => {
    const { id_quiz } = req.params;
    try {
        const questions = await Question.getQuestionsByQuizId(id_quiz); 
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
  createQuestion , getLastQuestionId , getQuestionsByQuizId
};
