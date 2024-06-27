
const db = require('../config/db');
const express = require('express');
const { DataTypes } = require('sequelize');


const app = express();
const util = require('util');

const query = util.promisify(db.query).bind(db);

const bodyParser = require('body-parser');




const createQuiz = async (QuizData, id_instructeur) => {
  try {
      const { titre, description,id_cp } = QuizData;
      
      // Insérez la formation dans la base de données avec l'ID de l'instructeur
      const insertQuery = `
          INSERT INTO quiz (titre, description, id_instructeur,id_CourspayentQ)
          VALUES (?, ?, ?,?)
      `;
      const result = await db.query(insertQuery, [titre, description, id_instructeur,id_cp]);
       
      // Récupérer l'ID de l'insertion directement depuis la réponse de la base de données
      const insertedId = result.insertId;

      return insertedId;  
  } catch (error) {
      throw error;
  }
};


// Récupérer tous les quiz
const getAllQuizzes = (callback) => {
  const query = 'SELECT * FROM Quiz';
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};
const getQuizById = async (id_q) => {
  try {
      const results = await query('SELECT * FROM quiz WHERE id_q = ?', [id_q]);
      return results.length > 0 ? results[0] : null;
  } catch (error) {
      throw error;
  }
};
const getQuizByCourseId = async (id_course) => {
  try {
      const results = await query('SELECT * FROM quiz WHERE id_CourspayentQ = ?', [id_course]);
      return results;
  } catch (error) {
      throw error;
  }
};



const updateQuizWithParticipant = async (id_q, id_p, score) => {
  return await query('UPDATE quiz SET id_participant = ?, score = ? WHERE id_q = ?', [id_p, score, id_q]);
}; 
const updateQuizScore = async (id_q, score, id_participant) => {
  try {
    const updateQuery = `
      UPDATE quiz
      SET score = ?,
          id_participant = ?
      WHERE id_q = ? 
    `;
    await db.query(updateQuery, [score, id_participant, id_q]);
  } catch (error) {
    throw error;
  }
};

// Exporter les fonctions du modèle
module.exports = {
  createQuiz, updateQuizWithParticipant,
  getQuizByCourseId,
  getAllQuizzes , getQuizById , updateQuizScore
};
