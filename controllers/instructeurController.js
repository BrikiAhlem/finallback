const Instructeur = require('../models/instructeurModel');
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
    const { nom, prenom, email, tel, specialite, mots_de_passe } = req.body;
    if (!nom || !prenom || !email || !tel || !specialite || !mots_de_passe) {
        return res.status(400).json({ message: 'Tous les champs sont requis pour ajouter un instructeur.' });
    }
    return true;
};
const modifierInstructeur = async (req, res) => {
    try {
        const { id } = req.params;
      
        const { nom, prenom, email, specialite, tel } = req.body;

        if (!nom || !prenom || !email || !specialite || !tel ) {
            return res.status(400).json({ success: false, message: 'Veuillez fournir toutes les données requises.' });
        }

        const existingInstructeur = await Instructeur.getInstructeurById(id);
        if (!existingInstructeur) {
            return res.status(404).json({ success: false, message: 'Instructeur non trouvée.' });
        }

        const updatedInstructeur = await Instructeur.updateInstructeur(id, req.body);

        res.status(200).json({ success: true, message: 'Instructeur mise à jour avec succès.', instructeur: updatedInstructeur });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la Instructeur :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const register = async (req, res) => {
    const instructeurData = req.body;

    try {
        const result = await Instructeur.register(instructeurData);
        res.status(201).json({ success: true, message: 'Inscription réussie.', result });
    }      catch (error) {
        if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes('email')) {
            // Si l'erreur est due à une entrée email en double
            res.status(409).json({ success: false, message: 'Erreur lors de l\'inscription: Adresse e-mail déjà utilisée.' });
        } else {
            errorHandler(res, 'Erreur lors de l\'inscription: ' + error.message);
        }  
    }
};


const updateAvatar = async (req, res) => {
    try {
        const { id } = req.params;

    

        const existingInstructeur = await Instructeur.getInstructeurById(id);
        if (!existingInstructeur) {
            return res.status(404).json({ success: false, message: 'Instructeur non trouvé.' });
        }
        const avatar = req.Fnameup;
        const updatedAvatar = await Instructeur.updateAvatar(id, avatar);
        req.Fnameup = undefined; 
        const updateddata = await Instructeur.getInstructeurById(id);


        res.status(200).json({ success: true, message: 'Avatar mis à jour avec succès.', Instructeur: updateddata });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'avatar de l\'instructeur :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};


const listerInstructeurs = async (req, res) => {
    try {
        const results = await query('SELECT * FROM instructeur');
        return res.status(200).json({ success: true, liste: results });
    } catch (err) {
        return errorHandler(res, err);
    }
};

const listerInstructeursB = async (req, res) => {
    try {
        const results = await query(`
        SELECT 
        i.id AS idInstructeur,
        i.nom AS nomInstructeur,
        i.prenom AS prenomInstructeur,
        c.titre AS titreCours,
        f.titre AS titreFormation,
        r.titre AS titreRessource
    FROM instructeur i
    LEFT JOIN courgratuits c ON i.id = c.id_InsctructeurC
    LEFT JOIN formation_p f ON i.id = f.instructeurfp_id
    LEFT JOIN ressource_pedagogique r ON i.id = r.id_inst  
     

        `);
        return res.status(200).json({ success: true, liste: results });
    } catch (err) {
        return errorHandler(res, err);
    }
};



const login = async (req, res) => {
    const { email, mots_de_passe } = req.body;

    try {
        const user = await Instructeur.login(email, mots_de_passe);

        if (user) {
            const token = generateToken(user.id); // Utilisez la fonction importée d'authMiddleware

            // Envoyez le token JWT dans l'en-tête de la réponse HTTP
            res.header('Authorization', `Bearer ${token}`);

            res.status(200).json({ success: true, message: 'Connexion réussie.', user, token });
        } else {
            res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect. participant ' });
        }
    } catch (error) {
        errorHandler(res, 'Erreur lors de la connexion: ' + error.message);
    }
};





const supprimerInstructeur = async (req, res) => {
    try {
        const { id } = req.params; 

            if (!id) {
                return res.status(400).json({ message: 'ID requis pour supprimer un instructeur.' });
            }

            const deleteQuery = 'DELETE FROM instructeur WHERE id = ?';

            const result = await query(deleteQuery, [id]);

            return res.status(200).json({ message: 'Instructeur supprimé avec succès.', result });
    } catch (err) {
        return errorHandler(res, err);
    }
};
    

const getInstructeurById = async (req, res) => {
    try {
        const { instructeur_id } = req.params;
        const instructeurData = await Instructeur.getInstructeurById(instructeur_id);
        if (instructeurData) {
            res.status(200).json({ success: true, Instructeur: instructeurData });
        } else {
            res.status(404).json({ success: false, message: 'Instructeur non trouvé.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du participant par ID:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération du participant.' });
    }
};
const countStatsForInstructeur = async (req, res) => {
    try {
        const { id } = req.params;
        const formationsCount = await Instructeur.countFormationsForInstructeur(id);
        const coursGratuitsCount = await Instructeur.countCoursGratuitsForInstructeur(id);
        res.status(200).json({ success: true, formationsCount, coursGratuitsCount });
    } catch (error) {
        console.error('Erreur lors du comptage des statistiques pour l\'instructeur:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const countInstructeurs= async (req, res) => {
    try {
      const count = await Instructeur.countInstructeurs();
      res.json({ success: true, count: count });
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre d\'instructeurs :', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
  const archiverInstructeur = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifiez d'abord si l'instructeur existe
        const existingInstructeur = await Instructeur.getInstructeurById(id);
        if (!existingInstructeur) {
            return res.status(404).json({ success: false, message: 'Instructeur non trouvé.' });
        }

        // Mettez à jour le statut de l'instructeur pour l'archiver
        const updateQuery = 'UPDATE instructeur SET status = 1 WHERE id = ?';
        await query(updateQuery, [id]);

        res.status(200).json({ success: true, message: 'Instructeur archivé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'archivage de l\'instructeur :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const desarchiverInstructeur = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifiez d'abord si l'instructeur existe
        const existingInstructeur = await Instructeur.getInstructeurById(id);
        if (!existingInstructeur) {
            return res.status(404).json({ success: false, message: 'Instructeur non trouvé.' });
        }

        // Mettez à jour le statut de l'instructeur pour le restaurer
        const updateQuery = 'UPDATE instructeur SET status = 0 WHERE id = ?';
        await query(updateQuery, [id]);

        res.status(200).json({ success: true, message: 'Instructeur restauré avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la restauration de l\'instructeur :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const resetPasswordRequest = async (req, res) => {
    const { email } = req.body;

    try {
        await Instructeur.resetPasswordRequest(email);
        res.status(200).json({ message: 'Un e-mail de réinitialisation de mot de passe a été envoyé.' });
    } catch (error) {
        console.error("Erreur lors de la demande de réinitialisation de mot de passe:", error);
        if (error.code === 'EAUTH') {
            // Erreur d'authentification SMTP
            res.status(500).json({ message: "Erreur d'authentification SMTP. Veuillez vérifier les informations d'identification SMTP." });
        } else {
            // Autre erreur SMTP
            res.status(500).json({ message: 'Erreur lors de la demande de réinitialisation de mot de passe.' });
        }
    }
};

const resetPassword = async (req, res) => {
    const {email, resetCode, nouveauMotDePasse } = req.body;

    try {

        await Instructeur.resetPassword(email, resetCode, nouveauMotDePasse); // Utiliser le mot de passe haché lors de la réinitialisation

        res.status(200).json({ message: 'Le mot de passe a été réinitialisé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe.' });
    }
};
const calculerRevenuInstructeur = async (req, res) => {
    try {
        const { id } = req.params;  // Récupérer l'ID de l'instructeur depuis les paramètres de la requête

        const formations = await Instructeur.getFormationsByInstructeurRevenu(id);

        if (!formations || formations.length === 0) {
            return res.status(404).json({ success: false, message: 'Aucune formation trouvée pour cet instructeur.' });
        }

        let revenuTotal = 0;
        const details = formations.map(formation => {
            const revenuFormation = formation.prix * formation.nombreParticipants * 0.70;
            revenuTotal += revenuFormation;
            return {
                formationId: formation.id_fp,
                prix: formation.prix,
                nombreParticipants: formation.nombreParticipants,
                revenu: revenuFormation
            };
        });

        res.status(200).json({ 
            success: true, 
            revenu: revenuTotal, 
            nombreFormations: formations.length,
            details 
        });
    } catch (error) {
        console.error('Erreur lors du calcul du revenu de l\'instructeur :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};



module.exports = {
    resetPassword,
    listerInstructeurs, 
    getInstructeurById,
    modifierInstructeur,
    supprimerInstructeur,
    register,
    login,
    countStatsForInstructeur,
    countInstructeurs , 
    listerInstructeursB ,
    updateAvatar ,
    archiverInstructeur ,
    desarchiverInstructeur ,
    resetPasswordRequest , calculerRevenuInstructeur
};
