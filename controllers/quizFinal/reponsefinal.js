const Reponse = require('../../models/quizFinal/reponsefinal');
const Question = require('../../models/quizFinal/questionfinal');

const createReponse = async (req, res) => {
    try {
        // Récupérer l'ID de la dernière question
        const lastQuestionId = await Question.getLastQuestionId();
        if (!lastQuestionId) {
            return res.status(404).json({ success: false, message: 'Aucune question trouvée.' });
        }
        
        // Créer la réponse avec l'ID de la dernière question
        const { correct, incorect1, incorect2, incorect3 } = req.body;
        const reponseData = { correct, incorect1, incorect2, incorect3, id_question: lastQuestionId };
        const reponseId = await Reponse.createReponse(reponseData);

        res.status(201).json({ success: true, message: 'Réponse créée avec succès', reponseId });
    } catch (error) {
        console.error('Erreur lors de la création de la réponse :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const getReponsesByQuestionId = async (req, res) => {
    try {
        const questionId = req.params.id_question;
        const reponses = await Reponse.getReponsesByQuestionId(questionId);
        res.status(200).json(reponses);
    } catch (error) {
        console.error('Erreur lors de la récupération des réponses :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des réponses' });
    }
};

module.exports = {
    createReponse,
    getReponsesByQuestionId
};
