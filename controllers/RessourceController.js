const RessourceModel = require('../models/RessourceModel');
const db = require('../config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require("../middleware/fileapp")

const errorHandler = (res, message) => {
    console.error(message);
    return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
};
const createRessource = async (req, res) => {
    try {
        // Utilisez authenticateToken pour vérifier le token et récupérer l'ID de l'instructeur
        authenticateToken(req, res, async () => {
            try {
                const id_inst = req.user.id; // Récupérez l'ID de l'instructeur à partir du token

                const { titre, description } = req.body;

                // Vérifiez si tous les champs requis sont présents
                if (!titre || !description) {
                    return res.status(400).json({ success: false, message: 'Veuillez fournir toutes les données requises.' });
                }

                // Récupérez le contenu de la ressource
                const contenu = req.Fnameup;

                // Créez la ressource dans la base de données avec l'ID de l'instructeur*
             
                const RessourceData = { titre, description, contenu };
                const result = await RessourceModel.createRessource(RessourceData , id_inst);
                const RessourceId = result.insertId;
                req.Fnameup = undefined;
                res.status(201).json({
                    success: true,
                    message: 'Ressource créée avec succès.',
                    RessourceId: RessourceId
                });
            } catch (error) {
                console.error('Erreur lors de la création de la ressource :', error);
                res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
            }
        });
    } catch (error) {
        console.error('Erreur lors de la vérification du token :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
}

  const updateRessource = async (req, res) => {
    try { 
        const { id_r } = req.params;
        const { titre, description } = req.body;
        const contenu = req.Fnameup; // Utiliser req.Fnameup pour récupérer le contenu

        // Mettre à jour le Ressource dans la base de données
        await RessourceModel.updateRessource(id_r, titre, description, contenu);

        res.status(200).json({ success: true, message: 'Ressource modifié avec succès.' });
    } catch (error) {
        console.error('Error in updateRessource:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const updateRessourceInstructeur = async (req, res) => {
    try { 
        const { id_r } = req.params;
        const { titre, description } = req.body;
        const contenu = req.Fnameup; // Utiliser req.Fnameup pour récupérer le contenu

        // Mettre à jour le Ressource dans la base de données
        await RessourceModel.updateRessourceInstructeur(id_r, titre, description, contenu);

        res.status(200).json({ success: true, message: 'Ressource modifié avec succès.' });
    } catch (error) {
        console.error('Error in updateRessource:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const getAllRessources = async (req, res) => {
    try {
      // Exécute la requête SQL pour récupérer les ressources pédagogiques dont le statut est 0
      const results = await query(`
        SELECT 
          ressource_pedagogique.*, 
          instructeur.id AS instructeur_id, 
          instructeur.nom AS instructeur_nom, 
          instructeur.prenom AS instructeur_prenom, 
          instructeur.Avatar AS instructeur_Avatar
        FROM ressource_pedagogique
        INNER JOIN instructeur 
          ON ressource_pedagogique.id_inst = instructeur.id 
        WHERE ressource_pedagogique.status = 0
      `);
  
      // Convertir les résultats en une structure de données simple
      const formations = results.map(result => ({ ...result }));
  
      // Retourner la liste des formations avec un statut de réussite
      return res.status(200).json({ success: true, liste: formations });
    } catch (err) {
      // Gestion des erreurs en renvoyant une réponse d'erreur
      return errorHandler(res, err);
    }
  };
  const getAllRessourcesAdminModifier = async (req, res) => {
    try {
      // Exécute la requête SQL pour récupérer les ressources pédagogiques dont le statut est 0
      const results = await query(`
        SELECT 
          ressource_pedagogique.*, 
          instructeur.id AS instructeur_id, 
          instructeur.nom AS instructeur_nom, 
          instructeur.prenom AS instructeur_prenom, 
          instructeur.Avatar AS instructeur_Avatar
        FROM ressource_pedagogique
        INNER JOIN instructeur 
          ON ressource_pedagogique.id_inst = instructeur.id 
        WHERE ressource_pedagogique.status = 2
      `);
  
      // Convertir les résultats en une structure de données simple
      const formations = results.map(result => ({ ...result }));
  
      // Retourner la liste des formations avec un statut de réussite
      return res.status(200).json({ success: true, liste: formations });
    } catch (err) {
      // Gestion des erreurs en renvoyant une réponse d'erreur
      return errorHandler(res, err);
    }
  };
  const getAllRessourcesParticipant = async (req, res) => {
    try {
      // Exécute la requête SQL pour récupérer les ressources pédagogiques dont le statut est 1
      const results = await query(`
        SELECT 
          ressource_pedagogique.*, 
          instructeur.id AS instructeur_id, 
          instructeur.nom AS instructeur_nom, 
          instructeur.prenom AS instructeur_prenom, 
          instructeur.Avatar AS instructeur_Avatar
        FROM ressource_pedagogique
        INNER JOIN instructeur 
          ON ressource_pedagogique.id_inst = instructeur.id 
        WHERE ressource_pedagogique.status = 1
      `);
  
      // Vérifie si des résultats ont été trouvés
      if (!results || results.length === 0) {
        return res.status(404).json({ success: false, message: 'Aucune ressource trouvée avec le statut 1' });
      }
  
      // Convertir les résultats en une structure de données simple
      const Ressource = results.map(result => ({ ...result }));
  
      // Retourner la liste des ressources avec un statut de réussite
      return res.status(200).json({ success: true, liste: Ressource });
    } catch (err) {
      // Gestion des erreurs en renvoyant une réponse d'erreur
      return errorHandler(res, err);
    }
  };
  
  
const getRessources = async (req, res) => {
    try {
        const results = await query(`
        SELECT * FROM ressource_pedagogique  WHERE status = 0
        `);

        // Convertir les résultats en une structure de données simple  id_InsctructeurC
        const formations = results.map(result => ({ ...result }));

        return res.status(200).json({ success: true, liste: formations });
    } catch (err) {
        return errorHandler(res, err);
    }
};

const getRessourceByInstructorId = async (req, res) => {
    try {
        const { id } = req.params;
        const Ressource = await RessourceModel.getRessourceByInstructorId(id);
        res.status(200).json({ success: true, Ressource });
    } catch (error) {
        console.error('Erreur lors de la récupération des Ressource par ID d\'instructeur :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};



const deleteRessource = async (req, res) => {
    try {
        const { id_r } = req.params;
        const result = await RessourceModel.deleteRessource(id_r);

        // Extraire les informations nécessaires de l'objet result
        const rowsAffected = result.affectedRows;

        res.status(200).json({ success: true, message: 'Ressource supprimée avec succès.', rowsAffected });
    } catch (error) {
        console.error('Error in deleteRessource:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const searchRessourcesByTitre = async (req, res) => {
    try {
        const { titre, id_instructeur } = req.query;
        const results = await query('SELECT * FROM ressource_pedagogique WHERE titre LIKE ? AND status = 1 AND id_inst = ?', [`%${titre}%`, id_instructeur]);
        const Ressources = results.map(result => ({ ...result }));

        res.status(200).json({ success: true, Ressources });
    } catch (error) {
        console.error('Error in searchRessourcesByTitre:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const searchRessourcesByTitreAdmin = async (req, res) => {
    try {
        const { titre } = req.query;
        const results = await query('SELECT * FROM ressource_pedagogique WHERE titre LIKE ? AND status = 0 ', [`%${titre}%`]);
        const Ressources = results.map(result => ({ ...result }));

        res.status(200).json({ success: true, Ressources });
    } catch (error) {
        console.error('Error in searchRessourcesByTitre:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

    



const getRessourceById = async (req, res) => {
    try {
        const { id } = req.params;
        const id_r=id;
        const RessourceModel1 = await RessourceModel.getRessourceById(id_r);
        if (RessourceModel1) {
            res.status(200).json({ success: true, Ressource: RessourceModel1 });
        } else {
            res.status(404).json({ success: false, message: 'resss non trouvé.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du ress par ID:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération du ress.' });
    }
};


const getFreeRessourceeCount = async (req, res) => {
    try {
        const count = await RessourceModel.countRessource();
        res.json({ total: count });
    } catch (error) {
        console.error('Erreur lors de la récupération du nombre de Ressource gratuis :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const acceptRessource = async (req, res) => {
    try {
        const { id_r } = req.params;
        // Mettez à jour le statut de la formation avec l'ID donné pour le marquer comme accepté
        await RessourceModel.updateRessourcetatus(id_r, 1); // 1 pour "accepté"
        res.status(200).json({ success: true, message: 'Formation acceptée avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'acceptation de la formation :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const rejectRessource = async (req, res) => {
    try {
        const { id_r } = req.params;
        // Mettez à jour le statut de la formation avec l'ID donné pour le marquer comme refusé
        await RessourceModel.updateRessourcetatus(id_r, 3); // 0 pour "refusé"
        res.status(200).json({ success: true, message: 'Ressources refusée avec succès.' });
    } catch (error) {
        console.error('Erreur lors du refus de la cours :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

module.exports = {
    getFreeRessourceeCount,
    createRessource,
    getAllRessources,
    updateRessource,
    deleteRessource,
    searchRessourcesByTitre,
    getRessourceById ,
    getRessourceByInstructorId,
    acceptRessource ,
    rejectRessource ,
    getRessources ,
    getAllRessourcesParticipant , updateRessourceInstructeur , getAllRessourcesAdminModifier , searchRessourcesByTitreAdmin
};
