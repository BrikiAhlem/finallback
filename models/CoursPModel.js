// coursPModel.js
const db = require('../config/db');
const express = require('express');

const app = express();
const util = require('util');

const query = util.promisify(db.query).bind(db);
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const createcoursP = async (CoursPData, id_InsctructeurCP,formationId) => {
    try {
        const { titre, description, contenu,  } = CoursPData;
        
        // Insérez la formation dans la base de données avec l'ID de l'instructeur
        const insertQuery = `
            INSERT INTO courpayant (titre, description ,contenu,formation_id,id_InsctructeurCP)
            VALUES (?, ?, ?,?, ?)
        `;
        const result = await db.query(insertQuery, [titre, description, contenu,formationId,id_InsctructeurCP]);
     
        
        return result;  
    } catch (error) {
        throw error;
    }
};
const getcoursById = async (id_cp) => {
    try {
        const results = await query('SELECT * FROM courpayant WHERE id_cp = ? WHERE status=1 ', [id_cp]);
        return results;
    } catch (error) {
        throw error;
    }
};


const getAllcourss = () => {
    const query = 'SELECT * FROM courpayant WHERE status=1 ';
    return db.query(query);
};

const updatecours = async (id_cp, titre, description, contenu) => {
    try {
        // Vérifiez si le contenu est fourni, s'il est fourni, mettez à jour le contenu aussi
        let query = '';
        let queryParams = [];
        if (contenu) {
            query = 'UPDATE courpayant SET titre = ?, description = ?, contenu = ? WHERE id_cp = ?';
            queryParams = [titre, description, contenu, id_cp];
        } else {
            query = 'UPDATE courpayant SET titre = ?, description = ? WHERE id_cp = ?';
            queryParams = [titre, description, id_cp];
        }
        const result = await db.query(query, queryParams);
        return result;
    } catch (error) {
        throw error;
    }
};



const deletecours = (id_cp) => {
    const query = 'DELETE FROM courpayant WHERE id_cp = ?';
    return db.query(query, [id_cp]);
};

const searchcourssByTitre = (titre) => {
    const query = 'SELECT * FROM courpayant WHERE titre LIKE ?';
    const searchPattern = `%${titre}%`;
    return db.query(query, [searchPattern]);
};
const getCoursByFormationId = async (formationId) => {
    try {
        const results = await query('SELECT * FROM courpayant WHERE formation_id = ?', [formationId]);
        return results;
    } catch (error) {
        console.error('Error in getCoursByFormationId:', error);
        throw error;
    }
};
const updateCoursStatus = async (id_cp, status) => {
    try {
        const updateQuery = 'UPDATE courpayant SET status = ? WHERE id_cp = ?';
        await db.query(updateQuery, [status, id_cp]);
    } catch (error) {
        throw error;
    }
};
const getcoursByIdins = async (id_cp) => {
    try {
        const results = await query('SELECT * FROM courpayant WHERE id_cp = ?', [id_cp]);
        return results;
    } catch (error) {
        throw error;
    }
};
const getcoursByIdA = async (id_cp) => {
    try {
        const results = await query('SELECT * FROM courpayant WHERE id_cp = ?', [id_cp]);
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        throw error;
    }
};
const getCourseNumberForFormation = async (formationId, courseId) => {
    try {
        const courses = await query(`
            SELECT id_cp
            FROM courpayant
            WHERE formation_id = ?
            ORDER BY id_cp ASC
        `, [formationId]);

        const courseIds = courses.map(course => course.id_cp);
        const courseIndex = courseIds.indexOf(courseId);

        // Ajoutez 1 car les indices commencent à partir de 0
        return courseIndex !== -1 ? courseIndex + 1 : null;
    } catch (error) {
        console.error('Error in getCourseNumberForFormation:', error);
        throw error;
    }
};
const getPaidCoursesWithNumberAndStatusByFormation = async (formationId) => {
    try {
        const moyenne = 3; // Moyenne de score
        const courses = await query(`
            SELECT courpayant.*, quiz.score
            FROM courpayant
            LEFT JOIN quiz ON courpayant.id_cp = quiz.id_CourspayentQ 
            WHERE courpayant.formation_id = ?
        `, [formationId]);

        const numberedCourses = await Promise.all(courses.map(async (course) => {
            const courseNumber = await getCourseNumberForFormation(formationId, course.id_cp); // Correction ici
            const status = course.score >= moyenne ? 'Réussi' : 'Non réussi';
            return { ...course, number: courseNumber, status };
        }));

        return numberedCourses;
    } catch (error) {
        console.error('Error in getPaidCoursesWithNumberAndStatusByFormation:', error);
        throw error;
    }
};


module.exports = {
    getCoursByFormationId, updateCoursStatus , getcoursByIdA , getPaidCoursesWithNumberAndStatusByFormation ,
    createcoursP,
    getAllcourss,
    updatecours,
    deletecours,
    searchcourssByTitre,
    getcoursById , getcoursByIdins , getCourseNumberForFormation
};
