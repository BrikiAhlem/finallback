const ContactModel = require('../models/ContactModel')
const db = require('../config/db');
const util = require('util');

const query = util.promisify(db.query).bind(db);

const errorHandler = (res, message) => {
  console.error(message);
  return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
};

const createContacte = async (req, res) => {
  try {
    const { nom, email, message } = req.body;
    const userId = 1; // Assuming a default user ID for demonstration

    const result = await ContactModel.createContacte(nom, email, message, userId);
    const ContacteId = result.insertId;

    res.status(201).json({
      success: true,
      message: 'Contact créé avec succès.',
      ContacteId: ContacteId
    });
  } catch (error) {
    console.error('Error in createContacte:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
};


const getAllContactes = async (req, res) => {
  try {
    const results = await query('SELECT * FROM contact');
    return res.status(200).json({ success: true, liste: results });
  } catch (err) {
    return errorHandler(res, err);
  }
};


const updateContacte = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, email, message } = req.body;

    const result = await ContactModel.updateContacte(id, nom, email, message);
    res.status(200).json({ success: true, message: 'Contact modifié avec succès.', result });
  } catch (error) {
    console.error('Error in updateContacte:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
};

const deleteContacte = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ContactModel.deleteContacte(id);

    res.status(200).json({ success: true, message: 'Contact supprimé avec succès.', result });
  } catch (error) {
    console.error('Error in deleteContacte:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
};

const searchContactes = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const results = await ContactModel.searchContactes(searchTerm);

    res.status(200).json({ success: true, Contactes: results });
  } catch (error) {
    console.error('Error in searchContactes:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
};

module.exports = {
  createContacte,
  getAllContactes,
  updateContacte,
  deleteContacte,
  searchContactes
};