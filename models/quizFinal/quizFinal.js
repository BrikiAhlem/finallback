const db = require('../../config/db');
const util = require('util');
const Question = require('../quizFinal/questionfinal'); // Importez la bonne classe
const query = util.promisify(db.query).bind(db);

const createQuiz = async (quizData, id_instructeur,formationId) => {
    try {
        const { titre, description } = quizData;
        
        const insertQuery = `
            INSERT INTO quizfinal (titre, description, id_instructeur,id_formationp  )
            VALUES (?, ?, ?,?)
        `;
        const result = await db.query(insertQuery, [titre, description, id_instructeur,formationId]);

        return result.insertId;
    } catch (error) {
        throw error; 
    }    
};

const getAllQuizzes = async () => {
    try {
        const queryText = 'SELECT * FROM quizfinal';
        const results = await query(queryText);
        return results;
    } catch (error) {
        throw error; 
    }
};


const getQuizById = async (id_q) => {
    try {
        const queryText = 'SELECT * FROM quizfinal WHERE id_q = ?';
        const results = await query(queryText, [id_q]);
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        throw error;
    }
};

const getLastQuizId = async () => {
    try {
        const queryText = 'SELECT id_q FROM quizfinal ORDER BY id_q DESC LIMIT 1';
        const result = await query(queryText);
        if (result.length === 0) {
            throw new Error("Aucun quiz trouvé.");
        }
        return result[0].id_q;
    } catch (error) {
        throw error;
    }
};

const getAllQuizzesWithQuestionsAndAnswers = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await Question.getQuizById(id);

        if (!quiz) { 
            return res.status(404).json({ success: false, message: 'Quiz not found.' }); 
        }

        const questions = await Question.getQuestionsByQuizId(id);

        const questionsWithAnswers = [];
        for (const question of questions) {
            const answers = await Question.getReponsesByQuestionId(question.id_question);
            questionsWithAnswers.push({ question, answers });
        }

        res.status(200).json({ success: true, quiz, questionsWithAnswers });
    } catch (error) {
        console.error('Error getting questions and answers for quiz:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};
const updateQuizWithParticipant = async (id_q, id_p, score) => {
    return await query('UPDATE quizfinal SET id_participant = ?, score = ? WHERE id_q = ?', [id_p, score, id_q]);
  }; 
  const getQuizzesByFormationId = async (formationId) => {
    try {
        const queryText = 'SELECT * FROM quizfinal WHERE id_formationp = ? LIMIT 1'; // Ajoutez "LIMIT 1" pour retourner un seul quiz
        const results = await query(queryText, [formationId]);
        return results;
    } catch (error) {
        throw error;
    }
};

module.exports = { 
    getQuizzesByFormationId ,
    createQuiz,  
    getAllQuizzes,
    getQuizById, 
    getLastQuizId,
    getAllQuizzesWithQuestionsAndAnswers , updateQuizWithParticipant
};
