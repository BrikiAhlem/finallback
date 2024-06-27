const db = require('../config/db');

const createContacte = (nom, email, message) => {
    const query = 'INSERT INTO contact (nom, email, message) VALUES (?, ?, ?)';
    return db.query(query, [nom, email, message]);
};

const getAllContactes = () => {
    const query = 'SELECT * FROM contact';
    return db.query(query);
};

const getContacteById = (ContacteId) => {
    const query = 'SELECT * FROM contact WHERE id = ?';
    return db.query(query, [ContacteId]);
};

const updateContacte = (ContacteId, titre, contenu, description) => {
    const query = 'UPDATE contact SET nom = ?, email = ?, message = ? WHERE id = ?';
    return db.query(query, [titre, contenu, description, ContacteId]);
};

const deleteContacte = (ContacteId) => {
    const query = 'DELETE FROM contact WHERE id = ?';
    return db.query(query, [ContacteId]);
};

const searchContactes = (searchTerm) => {
    const query = `
        SELECT *
        FROM contact
        WHERE nom LIKE ? OR email LIKE ? 
    `;
    const searchPattern = `%${searchTerm}%`;
    return db.query(query, [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]);
};

module.exports = {
    createContacte,
    getAllContactes,
    getContacteById,
    updateContacte,
    deleteContacte,
    searchContactes,
};
