const db = require('../config/db');

const createcommentairee = (commentaireC) => {
    const query = 'INSERT INTO commentaire (commentaireC) VALUES (?)';
    return db.query(query, [commentaireC]);
};

const getAllcommentairees = () => {
    const query = 'SELECT * FROM commentaire';
    return db.query(query);
};

const getcommentaireeById = (commentaireeId) => {
    const query = 'SELECT * FROM commentaire WHERE id = ?';
    return db.query(query, [commentaireeId]);
};

const updatecommentairee = (commentaireeId, commentaire) => {
    const query = 'UPDATE commentaire SET commentaire =  ?  WHERE id = ?';
    return db.query(query, [commentaire ,commentaireeId]);
};

const deletecommentairee = (commentaireeId) => {
    const query = 'DELETE FROM commentaire WHERE id = ?';
    return db.query(query, [commentaireeId]);
};

const searchcommentairees = (searchTerm) => {
    const query = `
        SELECT *
        FROM commentaire
        WHERE commentaire LIKE ? 
    `;
    const searchPattern = `%${searchTerm}%`;
    return db.query(query, [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]);
};

module.exports = {
    createcommentairee,
    getAllcommentairees,
    getcommentaireeById,
    updatecommentairee,
    deletecommentairee,
    searchcommentairees,
};
