const participant = require('../models/participantModel');
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
    const {avatar, nom, prenom, emailP, domaine, categorie, mots_de_passeP , tel} = req.body;
    if (  !avatar ||!nom || !nom || !prenom || !emailP || !domaine || !categorie || !mots_de_passeP || !tel)  {
        return res.status(400).json({ message: 'Tous les champs sont requis pour ajouter un Participant.' });
    }
    return true;
};









// const modifierParticipant = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { avatar ,nom, prenom, emailP, domaine, categorie, mots_de_passeP, role , tel } = req.body;

//         // Check for the presence of the authorization header
//         authenticateToken(req, res, async () => {
//             // Now you can access the user information from req.user
//             const userId = req.user.id;
//             const userRole = req.user.role;  // Assuming you have the role in the user object

//             // Ensure the user has the required role
//             if (userRole !== 'Participant' ) {
//                 return res.status(403).json({ message: 'Permission denied. Insufficient role.' });
//             }

//             if (!id || !validateFields(req, res)) {
//                 return res.status(400).json({ message: 'ID et tous les champs sont requis pour modifier un Participant.' });
//             }

//             const hashedmots_de_passeP = await bcrypt.hash(mots_de_passeP, saltRounds);

//             const updateQuery = `
//                 UPDATE Participant
//                 SET avatar = ?, nom = ?, prenom = ?, emailP = ?, domaine = ?, categorie = ?, mots_de_passeP = ?, role = ? , tel = ? 
//                 WHERE id = ?
//             `;

//             const result = await query(updateQuery, [avatar,nom, prenom, emailP, domaine, categorie, hashedmots_de_passeP, role,  tel ,id]);

//             return res.status(200).json({
//                 message: 'Instructeur modifié avec succès.',
//                 instructeur: result
//             });
//         });
//     } catch (err) {
//         return errorHandler(res, err);
//     }
// };



const updatePassword = async (req, res) => {
    try {
        const { id_p } = req.params;
        const { ancienMotDePasse, nouveauMotDePasse } = req.body;

        // Récupérer le participant depuis la base de données
        const participant = await query('SELECT * FROM Participant WHERE id_p = ?', [id_p]);
        if (!participant || participant.length === 0) {
            return res.status(404).json({ message: 'Participant non trouvé.' });
        }

        // Extraire le mot de passe haché de l'utilisateur de la base de données
        const mots_de_passeP = participant[0].mots_de_passeP;

        // Vérifier si l'ancien mot de passe correspond au mot de passe haché stocké dans la base de données
        const motDePasseMatch = await bcrypt.compare(ancienMotDePasse, mots_de_passeP);
        if (!motDePasseMatch) {
            return res.status(401).json({ message: 'Le mot de passe actuel est incorrect.' });
        }

        // Hasher le nouveau mot de passe
        const hashedNouveauMotDePasse = await bcrypt.hash(nouveauMotDePasse, saltRounds);

        // Mettre à jour le mot de passe dans la base de données avec le nouveau mot de passe haché
        const updateQuery = 'UPDATE Participant SET mots_de_passeP = ? WHERE id_p = ?';
        const result = await query(updateQuery, [hashedNouveauMotDePasse, id_p]);

        return res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
    } catch (err) {
        return errorHandler(res, err);
    }
};

const updateAvatar = async (req, res) => {
    try {
        const { id } = req.params;

        const existingParticipant = await participant.getparticipantById(id);


        if (!existingParticipant) {
            return res.status(404).json({ success: false, message: 'Participant non trouvé.' });
        }
        const avatar = req.Fnameup;
        const updatedAvatar = await participant.updateAvatar(id, avatar);
        req.Fnameup = undefined; 
        const updateddata = await participant.getparticipantById(id);


        res.status(200).json({ success: true, message: 'Avatar mis à jour avec succès.', participant: updateddata });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'avatar de l\'participant :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};


const register = async (req, res) => {
    const participantData = req.body;

    try {
        const result = await participant.register(participantData);
        res.status(201).json({ success: true, message: 'Inscription réussie.', result });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes('email')) {
            // Si l'erreur est due à une entrée email en double
            res.status(409).json({ success: false, message: 'Erreur lors de l\'inscription: Adresse e-mail déjà utilisée.' });
        } else {
            errorHandler(res, 'Erreur lors de l\'inscription: ' + error.message);
        }
    }
}; 





const modifierParticipant = async (req, res) => {
    try {
        const { id } = req.params;
     

        const {nom, prenom, domaine, categorie, emailP, tel} = req.body;

        if (!nom || !prenom || !domaine || !emailP || !categorie || !tel ) {
            return res.status(400).json({ success: false, message: 'Veuillez fournir toutes les données requises.' });
        }

        const existingParticipant = await participant.getparticipantById(id);
        if (!existingParticipant) {
            return res.status(404).json({ success: false, message: 'participant non trouvée.' });
        }

        const updatedParticipant = await participant.updateparticipant(id, req.body);

        res.status(200).json({ success: true, message: 'participant mise à jour avec succès.', Participant: updatedParticipant });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la participant :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};



const login = async (req, res) => {
    const { email, mots_de_passe } = req.body; 
    const emailP=email ; 
    const mots_de_passeP = mots_de_passe ; 

    try {
        const user = await participant.login(emailP, mots_de_passeP);

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

const supprimerParticipant = async (req, res) => {
    try {
        const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'ID requis pour supprimer un Participant.' });
            }

            const deleteQuery = 'DELETE FROM instructeur WHERE id = ?';

            const result = await query(deleteQuery, [id]);

            return res.status(200).json({ message: 'Instructeur supprimé avec succès.', result });
    } catch (err) {
        return errorHandler(res, err);
    }
};

const getParticipantById = async (req, res) => {
    try {
        const { id } = req.params;
      
        const participantData = await participant.getparticipantById(id);
        if (participantData) {
            res.status(200).json({ success: true, participant: participantData });
        } else {
            res.status(404).json({ success: false, message: 'Participant non trouvé.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du participant par ID:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération du participant.' });
    }
};

const getAllParticipants = async (req, res) => {
    try {
        const participants = await participant.getAllParticipants();
        res.status(200).json({ success: true, participants });
    } catch (error) {
        console.error('Erreur lors de la récupération de tous les participants:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const archiverParticipant = async (req, res) => {
    try {
        const { id_p } = req.params; // Utilisation de id_p au lieu de id

        // Vérifiez d'abord si le participant existe
        const existingParticipant = await participant.getparticipantById(id_p); // Utilisation de id_p au lieu de id
        if (!existingParticipant) {
            return res.status(404).json({ success: false, message: 'Participant non trouvé.' });
        }

        // Mettez à jour le statut du participant pour l'archiver
        const updateQuery = 'UPDATE participant SET status = 1 WHERE id_p = ?'; // Utilisation de id_p au lieu de id
        await query(updateQuery, [id_p]);

        res.status(200).json({ success: true, message: 'Participant archivé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'archivage du participant :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};


const desarchiverParticipant = async (req, res) => {
    try {
        const { id_p } = req.params; // Utilisation de id_p au lieu de id

        // Vérifiez d'abord si le participant existe
        const existingParticipant = await participant.getparticipantById(id_p); // Utilisation de id_p au lieu de id
        if (!existingParticipant) {
            return res.status(404).json({ success: false, message: 'Participant non trouvé.' });
        }

        // Mettez à jour le statut du participant pour le restaurer
        const updateQuery = 'UPDATE participant SET status = 0 WHERE id_p = ?'; // Utilisation de id_p au lieu de id
        await query(updateQuery, [id_p]);

        res.status(200).json({ success: true, message: 'Participant restauré avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la restauration du participant :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const countTotal = async (req, res) => {
    try {
        const total = await participant.countParticipant();
        res.status(200).json({ success: true, totalFormations: total });
    } catch (error) {
        console.error('Erreur lors de la récupération du total des formations :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const resetPasswordRequest = async (req, res) => {
    const { email } = req.body;
    const emailP = email;

    try {
        await participant.resetPasswordRequest(emailP);
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
    const { email, resetCode, nouveauMotDePasse } = req.body;
    const emailP = email;

    try {

        await participant.resetPassword(emailP, resetCode, nouveauMotDePasse); // Utiliser le mot de passe haché lors de la réinitialisation

        res.status(200).json({ message: 'Le mot de passe a été réinitialisé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe.' });
    }
};



module.exports = {
    countTotal,
    getAllParticipants,
    modifierParticipant,
    supprimerParticipant,
    register,
    login ,
    updatePassword,
    resetPassword ,
    resetPasswordRequest , getParticipantById , updateAvatar, archiverParticipant , desarchiverParticipant
    
};
