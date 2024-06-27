const Admin = require('../models/AdminModel');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('util');
const dbConnection = require('../config/db');
const { generateToken, authenticateToken } = require('../middleware/authMiddleware'); // Ajout des importations



const saltRounds = 10;
const query = util.promisify(dbConnection.query).bind(dbConnection);

const errorHandler = (res, message) => {
    console.error(message);
    return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
};

const validateFields = (req, res) => {
    const {  email, mots_de_passe } = req.body;
    if ( !email  || !mots_de_passe) {
        return res.status(400).json({ message: 'Tous les champs sont requis pour ajouter un Admin.' });
    }
    return true;
};

const register = async (req, res) => {
    const AdminData = req.body;

    try {
        const result = await Admin.register(AdminData);
        res.status(201).json({ success: true, message: 'Inscription réussie.', result });
    } catch (error) {
        errorHandler(res, 'Erreur lors de l\'inscription: ' + error.message);
    }
};

const login = async (req, res) => {
    const { email, mots_de_passe } = req.body;

    try {
        const user = await Admin.login(email, mots_de_passe);

        if (user) {
            const token = generateToken(user.id); // Utilisez la fonction importée d'authMiddleware
            res.status(200).json({ success: true, message: 'Connexion réussie.', user, token });
        } else {
            res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
        }
    } catch (error) {
        errorHandler(res, 'Erreur lors de la connexion: ' + error.message);
    }
};

const getAllInstructeurs = async (req, res) => {
    try {
        const instructeurs = await AdminModel.getAllInstructeurs();
        res.status(200).json({ success: true, data: instructeurs });
    } catch (error) {
        console.error('Erreur lors de la récupération des instructeurs :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};


const getTotalCounts = async (req, res) => {
    try {
        const instructeurCount = await Admin.getAllInstructeurCount();
        const participantCount = await Admin.getAllParticipantCount();
        const formationCount = await Admin.getAllFormationCount();

        res.status(200).json({
            success: true,
            counts: [
                { name: 'Instructeurs', value: instructeurCount },
                { name: 'Participants', value: participantCount },
                { name: 'Formations', value: formationCount }
            ]
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des totaux :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};


const getInstructorCountByWeek = async (req, res) => {
    try {
      const instructorCounts = await Admin.getInstructorCountByWeek();
      res.status(200).json({ success: true, data: instructorCounts });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'augmentation des comptes d\'instructeurs par semaine :', error);
      res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
  };
  const getParticipantCountByWeek = async (req, res) => {
    try {
      const participantCounts = await Admin.getParticipantCountByWeek();
      res.status(200).json({ success: true, data: participantCounts });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'augmentation des comptes de participants par semaine :', error);
      res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
  };
  const getTotalP = async (req, res) => {
    try {
        const coursCount = await Admin.getAllCoursCount();
        const formationCount = await Admin.getAllFormationCount();
        const ressourceCount = await Admin.getAllRessourceCount();

        res.status(200).json({
            success: true,
            counts: [
                { name: 'Cours', value: coursCount },
                { name: 'Formations', value: formationCount },
                { name: 'Ressources', value: ressourceCount }
            ]
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des totaux :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const updateAdmin = async (req, res) => {
    const { id_A } = req.params;
    const newData = req.body;

    try {
        await Admin.updateAdmin(id_A, newData);
        res.status(200).json({ success: true, message: 'Administrateur mis à jour avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'administrateur :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const getDomaineStats = (req, res) => {
    const sqlQuery = 'SELECT domaine, COUNT(*) as nombreDeFormations FROM formation_p GROUP BY domaine';
  
    // Exécutez la requête SQL
    dbConnection.query(sqlQuery, (err, results) => {
      if (err) {
        console.error('Erreur lors de l\'exécution de la requête SQL:', err);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
        return;
      }
  
      // Formattez les résultats dans un tableau d'objets JSON
      const statistiquesDomaines = results.map(row => ({
        domaine: row.domaine,
        nombreDeFormations: row.nombreDeFormations
      }));
  
      // Envoyez les données en tant que réponse
      res.json(statistiquesDomaines);
    });
  };

module.exports = {
    getDomaineStats ,
    getParticipantCountByWeek,
    getInstructorCountByWeek,
    register,
    login ,
    getAllInstructeurs ,
    getTotalCounts ,
    getTotalP ,
    updateAdmin
};
