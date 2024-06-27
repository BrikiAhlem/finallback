const db = require('../../config/db');
const util = require('util');

const query = util.promisify(db.query).bind(db);

const createReponse = async (reponseData) => {
    const { correct, incorect1, incorect2, incorect3, id_question } = reponseData;
    const queryText = 'INSERT INTO reponsefinal (correct, incorect1, incorect2, incorect3, id_question) VALUES (?, ?, ?, ?, ?)';
    const result = await query(queryText, [correct, incorect1, incorect2, incorect3, id_question]);
    return result.insertId;
};


const getReponsesByQuestionId = async (id_question) => {
    try {
        const queryText = 'SELECT * FROM reponsefinal WHERE id_question = ?';
        const results = await query(queryText, [id_question]);
        return results;
    } catch (error) {
        throw error;
    }
}; 
 
module.exports = {
    createReponse, 
    getReponsesByQuestionId
};
