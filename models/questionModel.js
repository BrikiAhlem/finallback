const { DataTypes } = require('sequelize');

const db = require('../config/db');
const express = require('express');

const app = express();
const util = require('util');

const query = util.promisify(db.query).bind(db);

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Créer une nouvelle question pour un quiz donné
const createQuestion = (questionData, callback) => {
    const { question ,reponse_incorect  , reponse_correct ,id_quiz } = questionData;
    const query = 'INSERT INTO question_quiz ( question ,reponse_incorect , reponse_correct ,id_quiz) VALUES ( ?, ?, ?, ?)';
    db.query(query, [question ,reponse_incorect , reponse_correct ,id_quiz], (err, result) => {
      if (err) {
        callback(err, null); 
      } else {
        callback(null, result); 
      }
    });
  };
  
  // Récupérer toutes les questions d'un quiz donné
  const getQuestionsByQuizId = (quizId, callback) => {
    const query = 'SELECT * FROM question_quiz ';
    db.query(query, [quizId], (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  };
  const getQuestionsByIdQuiz = async (id_quiz) => {
    try {
        const results = await query('SELECT * FROM question_quiz WHERE id_quiz = ?', [id_quiz]);
        return results;
    } catch (error) {
        throw error;
    }
};
 
  
  // Exporter les fonctions du modèle
  module.exports = {
    createQuestion,
    getQuestionsByQuizId ,getQuestionsByIdQuiz
  };