// RessourcePModel.js
const db = require('../config/db');
const express = require('express');

const app = express();
const util = require('util');

const query = util.promisify(db.query).bind(db);

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const createRessource = async (RessourceData, id_inst) => {
    try {
        const { titre, description, contenu,  } = RessourceData;
        
        // Insérez la formation dans la base de données avec l'ID de l'instructeur
        const insertQuery = `
            INSERT INTO ressource_pedagogique (titre, description ,contenu, id_inst)
            VALUES (?, ?, ?, ?)
        `;
        const result = await db.query(insertQuery, [titre, description, contenu, id_inst]);
     
        
        return result;   
    } catch (error) {
        throw error; 
    }
};

const getRessourceByInstructorId = async (instructorId) => {
    try {
        const queryString = `
            SELECT *
            FROM ressource_pedagogique
            WHERE id_inst = ? AND status = 1
        `;
        const results = await query(queryString, [instructorId]);
        return results;
    } catch (error) {
        throw error;
    }
};

const getRessourceById = async (id_r) => {
    try {
        const results = await query('SELECT * FROM ressource_pedagogique WHERE id_r = ?', [id_r]);
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        throw error;
    }
};




const getAllRessources = () => {
    const query = 'SELECT * FROM ressource_pedagogique'; 
    return db.query(query);
};
const getAllRessourcesAdminModifier = () => {
    const query = 'SELECT * FROM ressource_pedagogique'; 
    return db.query(query);
};

const updateRessource = (id_r, titre, description, contenu) => {
    const query = 'UPDATE ressource_pedagogique SET titre = ?, description = ?, contenu = ? WHERE id_r = ?';
    return db.query(query, [titre, description, contenu, id_r]);
};
const updateRessourceInstructeur = (id_r, titre, description, contenu) => {
    const query = 'UPDATE ressource_pedagogique SET titre = ?, description = ?, contenu = ? , status = 2 WHERE id_r = ?';
    return db.query(query, [titre, description, contenu, id_r]);
};
const deleteRessource = (id_r) => {
    const query = 'DELETE FROM ressource_pedagogique WHERE id_r= ?';
    return db.query(query, [id_r]);
};
const searchRessourcesByTitre = (titre,id_InsctructeurC) => {
    const query = 'SELECT * FROM ressource_pedagogique WHERE titre LIKE ? AND status = 1';
    const searchPattern = `%${titre}%`;
    return db.query(query, [searchPattern]);
};

const countRessource = async () => {
    try {
        const results = await query('SELECT COUNT(*) AS total FROM ressource_pedagogique');
        return results[0].total;
    } catch (error) {
        throw error;
    }
};


const updateRessourcetatus = async (id_r, status) => {
    try {
        const updateQuery = 'UPDATE ressource_pedagogique SET status = ? WHERE id_r = ?';
        await db.query(updateQuery, [status, id_r]);
    } catch (error) {
        throw error;
    }
};

module.exports = {
    updateRessourcetatus,
    createRessource,
    getAllRessources,
    updateRessource,
    deleteRessource,
    searchRessourcesByTitre,
    getRessourceById , 
    countRessource ,
    getRessourceByInstructorId , updateRessourceInstructeur , getAllRessourcesAdminModifier
};
