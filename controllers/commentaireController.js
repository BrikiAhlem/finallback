const commentaireModel = require('../models/commentaireModel')
const db = require('../config/db');
const util = require('util');

const query = util.promisify(db.query).bind(db);

const errorHandler = (res, message) => {
  console.error(message);
  return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' }); 
};

const createcommentairee = async (req, res) => {
    try {
      const { commentaireC } = req.body;
  
      // Vérifiez si commentaireC est présent et non vide
      if (!commentaireC) {
        return res.status(400).json({ success: false, message: "Le champ 'commentaireC' est requis." });
      }
  
      const userId = 1; // Assuming a default user ID for demonstration
  
      const result = await commentaireModel.createcommentairee(commentaireC, userId);
      const commentaireeId = result.insertId;
  
      res.status(201).json({
        success: true,
        message: 'commentaire créé avec succès.',
        commentaireeId: commentaireeId
      });
    } catch (error) {
      console.error('Error in createcommentairee:', error);
      res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
  };
  


const getAllcommentairees = async (req, res) => {
  try {
    const results = await query('SELECT * FROM commentaire'); 
    return res.status(200).json({ success: true, liste: results });
  } catch (err) {
    return errorHandler(res, err); 
  }
};


const updatecommentairee = async (req, res) => {
  try {
    const { id } = req.params;
    const { commentaire } = req.body;

    const result = await commentaireModel.updatecommentairee(id, commentaire );
    res.status(200).json({ success: true, message: 'commentaire modifié avec succès.', result });
  } catch (error) {
    console.error('Error in updatecommentairee:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
};

const deletecommentairee = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await commentaireModel.deletecommentairee(id);

    res.status(200).json({ success: true, message: 'commentaire supprimé avec succès.', result });
  } catch (error) {
    console.error('Error in deletecommentairee:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
};


module.exports = {
  createcommentairee,
  getAllcommentairees,
  updatecommentairee,
  deletecommentairee,
  
};