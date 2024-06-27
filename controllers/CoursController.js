const CoursModel = require('../models/CoursPModel');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');
const util = require('util');

const query = util.promisify(db.query).bind(db);

const errorHandler = (res, message) => {
    console.error(message);
    return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
};

const createCourse = async (req, res) => {
    try {
        authenticateToken(req, res, async () => {
            const { titre, contenu, description } = req.body;
            const userId = req.user.id;

            const result = await CoursModel.createCourse(titre, contenu, description, userId);
            const courseId = result.insertId;

            res.status(201).json({
                success: true,
                message: 'Cours créé avec succès.',
                courseId: courseId
            });
        });
    } catch (error) {
        console.error('Error in createCourse:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};


const getAllCourses = async (req, res) => {
  try {
      const results = await query('SELECT * FROM courpayant');
      return res.status(200).json({ success: true, liste: results });
  } catch (err) {
      return errorHandler(res, err);
  }
};


const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { titre, contenu, description } = req.body;

        const result = await CoursModel.updateCourse(id, titre, contenu, description);
        res.status(200).json({ success: true, message: 'Cours modifié avec succès.', result });
    } catch (error) {
        console.error('Error in updateCourse:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await CoursModel.deleteCourse(id);

        res.status(200).json({ success: true, message: 'Cours supprimé avec succès.', result });
    } catch (error) {
        console.error('Error in deleteCourse:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const searchCourses = async (req, res) => {
    try {
        const { searchTerm } = req.query;
        const results = await CoursModel.searchCourses(searchTerm);

        res.status(200).json({ success: true, courses: results });
    } catch (error) {
        console.error('Error in searchCourses:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

module.exports = {
    createCourse,
    getAllCourses,
    updateCourse,
    deleteCourse,
    searchCourses
};
