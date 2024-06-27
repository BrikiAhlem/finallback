




  const Quiz = require('../models/quizModel');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);
const { authenticateToken } = require('../middleware/authMiddleware');
const createQuiz = async (req, res) => { 
  try {
      const { titre, description } = req.body;
      const id_cp =req.params.id_cp;

      const id_instructeur = req.user.id; 
      if (!titre || !description ) {
          return res.status(400).json({ success: false, message: 'Veuillez fournir toutes les données requises.' });
      }
      const QuizData = { titre, description,id_cp};
      const insertedId = await Quiz.createQuiz(QuizData, id_instructeur);
      res.status(201).json({ 
          success: true, 
          message: `Quiz créé avec succès. ID du quiz : ${insertedId}`,
          id_q: insertedId, 
      }); 
  } catch (error) {
      console.error('Erreur lors de la création de la Quiz :', error);
      res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
};
  const getAllQuizzes = (req, res) => {
    Quiz.getAllQuizzes((err, quizzes) => { 
      if (err) {
        console.error('Erreur lors de la récupération des quiz :', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des quiz' });
      } else {
        res.status(200).json(quizzes);
      }
    });
  };
  const getQuizById = async (req, res) => {
    try {
        const { id_q } = req.params;
        console.log(id_q) ; 
        const QuizData = await Quiz.getQuizById(id_q);
        if (QuizData) {
            res.status(200).json({ success: true, Quiz: QuizData });
        } else {
            res.status(404).json({ success: false, message: 'quiz non trouvé.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du quiz par ID:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération du quiz.' });
    }
};
const getQuizByCourseId = async (req, res) => {
  try {
      const { id_course } = req.params;
      const QuizData = await Quiz.getQuizByCourseId(id_course);
      if (QuizData) {
          res.status(200).json({ success: true, Quiz: QuizData });
      } else {
          res.status(404).json({ success: false, message: 'Aucun quiz trouvé pour ce cours.' });
      }
  } catch (error) {
      console.error('Erreur lors de la récupération du quiz par ID de cours:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération du quiz.' });
  }
};

const getLastQuizId = async (req, res) => {
  try {
      const result = await query(`
          SELECT id_q
          FROM quiz
          ORDER BY id_q DESC   
          LIMIT 1
      `);

      if (result.length === 0) {
          return res.status(404).json({ success: false, message: "Aucune formation trouvée." });
      }
      const lastQuizId = result[0].id_q;
      return res.status(200).json({ success: true, lastQuizId });
  } catch (err) {
      return errorHandler(res, err); 
  }
};
const saveParticipantScore = async (req, res) => {
  try {
    const { id_q, score, participantId } = req.body; // Retrieve participantId from the body

    // Check if all required fields are present
    if (!id_q || score === undefined || !participantId) {
      return res.status(400).json({ success: false, message: 'Veuillez fournir toutes les données requises.' });
    }

    // Update the quiz with the participant ID and score
    const result = await Quiz.updateQuizWithParticipant(id_q, participantId, score);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Quiz non trouvé ou mise à jour échouée.' });
    }

    res.status(200).json({ success: true, message: 'Score enregistré avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du score du participant :', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
};
const saveQuizScore = async (req, res) => {
  try {
    const { id_q } = req.params;
    const { score, id_participant } = req.body; // Récupérer l'ID du participant depuis le corps de la requête
    
    // Mettre à jour le score du quiz dans la base de données avec l'ID du participant
    await Quiz.updateQuizScore(id_q, score, id_participant);

    res.status(200).json({ success: true, message: 'Score du quiz enregistré avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du score du quiz:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'enregistrement du score du quiz.' });
  }
};
const getQuizListAdmin = async (req, res) => {
  try {
    const quizListQuery = `
      SELECT 
        quiz.id_q, 
        quiz.titre AS quiz_titre, 
        participant.nom AS participant_nom, 
        participant.prenom AS participant_prenom, 
        instructeur.nom AS instructeur_nom, 
        instructeur.prenom AS instructeur_prenom, 
        courpayant.titre AS cours_titre 
      FROM 
        quiz 
      LEFT JOIN participant ON quiz.id_participant = participant.id_p 
      LEFT JOIN instructeur ON quiz.id_instructeur = instructeur.id 
      LEFT JOIN courpayant ON quiz.id_CourspayentQ = courpayant.id_cp
    `;
    
    const quizList = await query(quizListQuery);

    // Log the raw result for debugging
    console.log('Raw quiz list result:', quizList);

    if (!quizList || quizList.length === 0) {
      return res.status(404).json({ success: false, message: 'Aucun quiz trouvé.' });
    }

    res.status(200).json({ success: true, quizList });
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste des quiz:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
};


  module.exports = {
    createQuiz,
    getAllQuizzes,
    getQuizByCourseId,
    getQuizListAdmin ,
    getQuizById ,
    getLastQuizId , saveParticipantScore , saveQuizScore
  };
