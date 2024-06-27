const Quiz = require('../../models/quizFinal/quizFinal');
const question = require('../../models/quizFinal/questionfinal');
const reponse = require('../../models/quizFinal/reponsefinal');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);
const { authenticateToken } = require('../../middleware/authMiddleware');
const createQuiz = async (req, res) => { 
    try {
        const { titre, description } = req.body;
  const formationId =req.params.formationId;
        const id_instructeur = req.user.id; 
                
        if (!titre || !description ) {
            return res.status(400).json({ success: false, message: 'Veuillez fournir toutes les données requises.' });
        }
     
        const QuizData = { titre, description};
        
        // Insérer la Quiz dans la base de données
        const insertedId = await Quiz.createQuiz(QuizData, id_instructeur,formationId);
        res.status(201).json({ 
            success: true, 
            message: `Quiz créé avec succès. ID du quiz : ${insertedId}`,
            id_q: insertedId, // Ajouter l'ID du quiz à la réponse
        }); 
    } catch (error) {
        console.error('Erreur lors de la création de la Quiz :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
  };

const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.getAllQuizzes();
        res.status(200).json(quizzes);
    } catch (error) {
        console.error('Erreur lors de la récupération des quiz :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des quiz' });
    }
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
  

const getLastQuizId = async (req, res) => {
  try {
      const result = await query(`
          SELECT id_q
          FROM quiz
          ORDER BY id_q DESC   
          LIMIT 1 
      `);

      // Vérifier si une formation a été trouvée
      if (result.length === 0) {
          return res.status(404).json({ success: false, message: "Aucune formation trouvée." });
      }

      // Récupérer l'ID de la dernière formation
      const lastQuizId = result[0].id_q;

      return res.status(200).json({ success: true, lastQuizId });
  } catch (err) {
      return errorHandler(res, err); 
  }
};

const getQuizWithQuestionsAndAnswers = async (req, res) => {
    try {
        const { id_Q } = req.params;

        // Récupérer le quiz
        const quiz = await Quiz.getQuizById(id_Q);
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found.' });
        }

        // Récupérer les questions pour ce quiz
        const questions = await question.getQuestionsByQuizId(id_Q); 

        // Pour chaque question, récupérer les réponses
        const questionsWithAnswers = [];
        for (const question of questions) {  
            const reponses = await reponse.getReponsesByQuestionId(question.id_question);
            questionsWithAnswers.push({ question, reponses });
        }

        res.json({ success: true, quiz, questionsWithAnswers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const getAllQuizzesWithInstructor = async (req, res) => {
    try {
        const queryText = `
            SELECT q.id_q, q.titre, q.description, u.nom, u.prenom
            FROM quizfinal q
            INNER JOIN users u ON q.id_instructeur = u.id
        `;
        const quizzes = await query(queryText);
        
        if (!quizzes || quizzes.length === 0) { 
            return res.status(404).json({ success: false, message: 'Aucun quiz trouvé avec instructeur.' }); 
        }

        res.status(200).json({ success: true, quizzes });
    } catch (error) {
        console.error('Erreur lors de la récupération des quiz avec instructeurs :', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des quiz avec instructeurs.' });
    }
};
const getAllQuizzesDetails = async (req, res) => {
    try {
        // Récupérer tous les quizzes depuis la base de données
        const quizzes = await Quiz.getAllQuizzes();
        
        // Formatter la réponse pour inclure seulement les ID, titres et descriptions
        const quizzesDetails = quizzes.map(quiz => ({
            id: quiz.id_q,
            titre: quiz.titre,
            description: quiz.description
        }));

        // Renvoyer les détails des quizzes
        res.status(200).json({ success: true, quizzes: quizzesDetails });
    } catch (error) {
        console.error('Erreur lors de la récupération des détails des quizzes :', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des détails des quizzes.' });
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
  
  const getQuizzesByFormationId = async (req, res) => {
    try {
        const { formationId } = req.params;
        const quiz = await Quiz.getQuizzesByFormationId(formationId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Aucun quiz trouvé pour cette formation.' });
        }
        res.status(200).json({ success: true, quiz });
    } catch (error) {
        console.error('Erreur lors de la récupération des quiz par ID de formation:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const getQuizDetails = async (req, res) => {
    try {
        const queryText = `
            SELECT 
                q.id_Q,
                q.titre AS titre_quiz, 
                f.titre AS titre_formation, 
                i.nom AS instructeur_nom, 
                i.prenom AS instructeur_prenom, 
                p.nom AS participant_nom, 
                p.prenom AS participant_prenom
            FROM quizfinal q
            JOIN formation_p f ON q.id_formationp = f.id_fp
            JOIN instructeur i ON q.id_instructeur = i.id
            LEFT JOIN participant p ON q.id_participant = p.id_p
        `;
        const quizzes = await query(queryText);
        
        if (!quizzes || quizzes.length === 0) { 
            return res.status(404).json({ success: false, message: 'Aucun quiz trouvé.' }); 
        }

        res.status(200).json({ success: true, quizzes });
    } catch (error) {
        console.error('Erreur lors de la récupération des quiz :', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des quiz.' });
    }
};




  // Exporter les fonctions du contrôleur
  module.exports = {
    createQuiz, getQuizDetails ,
    getAllQuizzes ,getQuizzesByFormationId ,getQuizById ,getLastQuizId , getQuizWithQuestionsAndAnswers , getAllQuizzesWithInstructor , getAllQuizzesDetails , saveParticipantScore
  };
 