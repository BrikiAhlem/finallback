const Question = require('../models/questionModel')
const ModelQuiz = require('../models/quizModel')
const createQuestion = (req, res) => {
    const questionData = req.body;
    Question.createQuestion(questionData, (err, result) => {
      if (err) {
        console.error('Erreur lors de la création de la question :', err);
        res.status(500).json({ error: 'Erreur lors de la création de la question' }); 
      } else {
        res.status(201).json({ message: 'Question créée avec succès', questionId: result.insertId });
      }
    });
  };
  
  // Récupérer toutes les questions d'un quiz donné
  const getQuestionsByQuizId = (req, res) => {
    const quizId = req.params.quizId;
    Question.getQuestionsByQuizId(quizId, (err, questions) => {
      if (err) {
        console.error('Erreur lors de la récupération des questions :', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des questions' });
      } else {
        res.status(200).json(questions);
      }
    });
  };
  const importQuestionData = async (req, res) => {
    try {
      const questionsData = extractQuestionsData(req.file);
  
      questionsData.forEach(async (questionData) => {
        await Question.createQuestion(questionData);
      });
  
      res.status(200).json({ message: 'Données des questions importées avec succès depuis le fichier Excel.' });
    } catch (error) {
      console.error('Erreur lors de l\'importation des données des questions :', error);
      res.status(500).json({ error: 'Erreur lors de l\'importation des données des questions.' });
    }
  };
  
  function extractQuestionsData(file) {
    return [];
  } 
   
  const getQuestionsByIdQuiz = async (req, res) => {  
    try { 
        const { id_q: id_quiz } = req.params; 
      
        const questionData = await Question.getQuestionsByIdQuiz(id_quiz);
        if (questionData.length > 0) {
            res.status(200).json({ success: true, questions: questionData });
        } else {
            res.status(404).json({ success: false, message: 'Aucune question trouvée pour ce quiz.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des questions par ID de quiz:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des questions.' });
    }
};


  // Exporter les fonctions du contrôleur
  module.exports = {
    createQuestion,
    getQuestionsByQuizId ,
    importQuestionData ,
      getQuestionsByIdQuiz
  };

