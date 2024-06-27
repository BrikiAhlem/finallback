const PublicationModel = require('../models/PubicationModel'); 
const db = require('../config/db');

const util = require('util');
const query = util.promisify(db.query).bind(db);
const { authenticateToken } = require('../middleware/authMiddleware'); 

const errorHandler = (res, message) => {
    console.error(message);
    return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
};
const getPublicationsByInstructorId = async (req, res) => {
    try {
        const { id_instructeur } = req.params;
        const publications = await PublicationModel.getPublicationsByInstructorId(id_instructeur);

        if (publications.length > 0) {
            res.status(200).json({ success: true, publications });
        } else {
            res.status(404).json({ success: false, message: 'Aucune publication trouvée pour cet instructeur.' });
        }
    } catch (error) { 
        console.error('Erreur lors de la récupération des publications par instructeur :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }        
};  
const getPublicationsByParticipantId = async (req, res) => {
    try {
        const { id_participant } = req.params;
        const publications = await PublicationModel.getPublicationsByParticipant(id_participant);

        if (publications.length > 0) {
            res.status(200).json({ success: true, publications });
        } else {
            res.status(404).json({ success: false, message: 'Aucune publication trouvée pour cet instructeur.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des publications par instructeur :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const createPublication = async (req, res) => {
    try {
        // Utilisez authenticateToken pour vérifier le token et récupérer l'ID de l'instructeur
        authenticateToken(req, res, async () => {
            try {
                const id_instructeur = req.user.id; // Récupérez l'ID de l'instructeur à partir du token

                const { titre, description, contenu } = req.body;

                // Vérifiez si tous les champs requis sont présents
                if (!titre || !description || !contenu) {
                    return res.status(400).json({ success: false, message: 'Veuillez fournir toutes les données requises.' });
                }

                // Créez la Publication dans la base de données
                const PublicationData = { titre, description, contenu };
            
                const result = await PublicationModel.createPublication(PublicationData , id_instructeur);
                const PublicationId = result.insertId;

                res.status(201).json({
                    success: true,
                    message: 'Publication créée avec succès.',
                    PublicationId: PublicationId
                });
            } catch (error) {
                console.error('Erreur lors de la création de la publication :', error);
                res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
            }
        });
    } catch (error) {
        console.error('Erreur lors de la vérification du token :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const createPublicationParticipant = async (req, res) => {
    try {
        const { id_participant, titre, description, contenu } = req.body;

        // Vérifiez si tous les champs requis sont présents
        if (!id_participant || !titre || !description || !contenu) {
            return res.status(400).json({ success: false, message: 'Veuillez fournir toutes les données requises.' });
        }

        // Créez la Publication dans la base de données
        const result = await PublicationModel.createPublicationParticipant({ titre, description, contenu }, id_participant);
        const publicationId = result.insertId;

        res.status(201).json({
            success: true,
            message: 'Publication créée avec succès.',
            PublicationId: publicationId
        });
    } catch (error) {
        console.error('Erreur lors de la création de la publication :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const updatePublicationAdmin = async (req, res) => {
    try {
        const { id_public } = req.params;
        const { titre, description, contenu } = req.body; 

        // Vérifiez si tous les champs requis sont présents
        if (!titre || !description || !contenu) {
            return res.status(400).json({ success: false, message: 'Veuillez fournir toutes les données requises.' });
        }

        // Mettre à jour la publication dans la base de données
        const updateQuery = `
            UPDATE publication
            SET titre = ?, description = ?, contenu = ?
            WHERE id_public = ?
        `;
        await query(updateQuery, [titre, description, contenu, id_public]);

        // Sélectionnez la publication mise à jour après la mise à jour
        const selectQuery = 'SELECT * FROM publication WHERE id_public = ?';
        const updatedPublication = await query(selectQuery, [id_public]);

        // Vérifiez si la publication mise à jour existe
        if (!Array.isArray(updatedPublication) || updatedPublication.length === 0) {
            return res.status(404).json({ success: false, message: 'Publication non trouvée.' });
        }

        return res.status(200).json({ success: true, message: 'Publication mise à jour avec succès.', publication: updatedPublication[0] });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la publication :', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const updatePublicationInstructeur = async (req, res) => {
    try {
        console.log('Requête de modification de publication reçue.');
        const { id_public } = req.params;
        console.log('ID de la publication à modifier:', id_public);
        const { titre, description, contenu } = req.body;
        console.log('Nouvelles données de publication:', titre, description, contenu);
        const status = 2;

        // Vérifiez si tous les champs requis sont présents
        if (!titre || !description || !contenu) {
            return res.status(400).json({ success: false, message: 'Veuillez fournir toutes les données requises.' });
        }

        // Mettre à jour la publication dans la base de données
        const updateQuery = `
            UPDATE publication
            SET titre = ?, description = ?, contenu = ?,status = ?
            WHERE id_public = ?
        `;
        await query(updateQuery, [titre, description, contenu,status, id_public]);

        // Sélectionnez la publication mise à jour après la mise à jour
        const selectQuery = 'SELECT * FROM publication WHERE id_public = ?';
        const updatedPublication = await query(selectQuery, [id_public]);

        // Vérifiez si la publication mise à jour existe
        if (!Array.isArray(updatedPublication) || updatedPublication.length === 0) {
            return res.status(404).json({ success: false, message: 'Publication non trouvée.' });
        }

        return res.status(200).json({ success: true, message: 'Publication mise à jour avec succès.', publication: updatedPublication[0] });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la publication :', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const updatePublicationParticipant = async (req, res) => {
    try {
        console.log('Requête de modification de publication reçue.');
        const { id_public } = req.params;
        console.log('ID de la publication à modifier:', id_public);
        const { titre, description, contenu } = req.body;
        console.log('Nouvelles données de publication:', titre, description, contenu);
        const status = 2;

        // Vérifiez si tous les champs requis sont présents
        if (!titre || !description || !contenu) {
            return res.status(400).json({ success: false, message: 'Veuillez fournir toutes les données requises.' });
        }

        // Mettre à jour la publication dans la base de données
        const updateQuery = `
            UPDATE publication
            SET titre = ?, description = ?, contenu = ?,status = ?
            WHERE id_public = ?
        `;
        await query(updateQuery, [titre, description, contenu,status, id_public]);

        // Sélectionnez la publication mise à jour après la mise à jour
        const selectQuery = 'SELECT * FROM publication WHERE id_public = ?';
        const updatedPublication = await query(selectQuery, [id_public]);

        // Vérifiez si la publication mise à jour existe
        if (!Array.isArray(updatedPublication) || updatedPublication.length === 0) {
            return res.status(404).json({ success: false, message: 'Publication non trouvée.' });
        }

        return res.status(200).json({ success: true, message: 'Publication mise à jour avec succès.', publication: updatedPublication[0] });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la publication :', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const deletePublicationIns = async (req, res) => {
    try {
        const { id_public } = req.params;
        await PublicationModel.deletePublication(id_public); // Pas besoin de stocker le résultat de la requête

        res.status(200).json({ success: true, message: 'Publication supprimée avec succès.' });
    } catch (error) {
        console.error('Error in deletePublication:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const searchPublicationsByTitre = async (req, res) => {
    try {
        const { titre, instructeurId } = req.query;
        const results = await PublicationModel.searchPublicationsByTitre(titre, instructeurId);

        res.status(200).json({ success: true, publications: results });
    } catch (error) {
        console.error('Error in searchPublicationsByTitre:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};



const getAllPublications = async (req, res) => {
    try {
        const results = await query(`
        SELECT publication.*, 
               instructeur.nom AS instructeur_nom, 
               instructeur.prenom AS instructeur_prenom,  
               instructeur.Avatar AS instructeur_Avatar,
               participant.nom AS participant_nom, 
               participant.prenom AS participant_prenom, 
               participant.Avatar AS participant_Avatar
        FROM publication
        LEFT JOIN instructeur ON publication.id_instructeur = instructeur.id
        LEFT JOIN participant ON publication.id_participant = participant.id_p
        WHERE publication.status = 0
        `);

        // Convertir les résultats en une structure de données simple
        const publications = results.map(result => {
            // Calcul du temps écoulé depuis la création de la publication
            const dateCreation = new Date(result.date_creation);
            const now = new Date();
            const diff = now - dateCreation; 
            const hours = Math.floor(diff / 1000 / 3600);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const elapsedTime = `${hours} heures et ${minutes} minutes`;

            // Ajouter le temps écoulé et les informations sur le participant si disponibles
            const publication = { 
                ...result, 
                temps_ecoule: elapsedTime 
            };

            if (result.participant_nom && result.participant_prenom) {
                publication.participant = {
                    nom: result.participant_nom,
                    prenom: result.participant_prenom,
                    avatar: result.participant_Avatar
                };
            }

            // Retirer les champs redondants
            delete publication.participant_nom;
            delete publication.participant_prenom;
            delete publication.participant_Avatar;

            return publication;
        });

        return res.status(200).json({ success: true, liste: publications });
    } catch (err) {
        return errorHandler(res, err);
    }
};
const getAllPublicationsModifierAdmin = async (req, res) => {
    try {
        const results = await query(`
        SELECT publication.*, 
               instructeur.nom AS instructeur_nom, 
               instructeur.prenom AS instructeur_prenom,  
               instructeur.Avatar AS instructeur_Avatar,
               participant.nom AS participant_nom, 
               participant.prenom AS participant_prenom, 
               participant.Avatar AS participant_Avatar
        FROM publication
        LEFT JOIN instructeur ON publication.id_instructeur = instructeur.id
        LEFT JOIN participant ON publication.id_participant = participant.id_p
        WHERE publication.status = 2
        `);

        // Convertir les résultats en une structure de données simple
        const publications = results.map(result => {
            // Calcul du temps écoulé depuis la création de la publication
            const dateCreation = new Date(result.date_creation);
            const now = new Date();
            const diff = now - dateCreation; 
            const hours = Math.floor(diff / 1000 / 3600);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const elapsedTime = `${hours} heures et ${minutes} minutes`;

            // Ajouter le temps écoulé et les informations sur le participant si disponibles
            const publication = { 
                ...result, 
                temps_ecoule: elapsedTime 
            };

            if (result.participant_nom && result.participant_prenom) {
                publication.participant = {
                    nom: result.participant_nom,
                    prenom: result.participant_prenom,
                    avatar: result.participant_Avatar
                };
            }

            // Retirer les champs redondants
            delete publication.participant_nom;
            delete publication.participant_prenom;
            delete publication.participant_Avatar;

            return publication;
        });

        return res.status(200).json({ success: true, liste: publications });
    } catch (err) {
        return errorHandler(res, err);
    }
};
const deletePublicationAdmin = async (req, res) => {
    try {
        const { id_public } = req.params;
        const result = await PublicationModel.deletePublicationAdmin(id_public);

        // Extraire les informations nécessaires de l'objet result
        const rowsAffected = result.affectedRows;

        res.status(200).json({ success: true, message: 'deletePublication  avec succès.', rowsAffected });
    } catch (error) {
        console.error('Error in deletePublication:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const getPublicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const id_public=id;
        const PublicationModel1 = await PublicationModel.getPublicationById(id_public);
        if (PublicationModel1) {
            res.status(200).json({ success: true, publication: PublicationModel1 });
        } else {
            res.status(404).json({ success: false, message: 'Instructeur non trouvé.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du formation par ID:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération du formation.' });
    }
};


const acceptPublication = async (req, res) => {
    try {
        const { id_public } = req.params;
        // Mettez à jour le statut de la formation avec l'ID donné pour le marquer comme accepté
        await PublicationModel.updatePublicationtatus(id_public, 1); // 1 pour "accepté"
        res.status(200).json({ success: true, message: 'Ressources acceptée avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'acceptation de la formation :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const rejectPublication = async (req, res) => {
    try {
        const { id_public } = req.params;
        // Mettez à jour le statut de la formation avec l'ID donné pour le marquer comme refusé
        await PublicationModel.updatePublicationtatus(id_public, 3); // 0 pour "refusé"
        res.status(200).json({ success: true, message: 'Ressources refusée avec succès.' });
    } catch (error) {
        console.error('Erreur lors du refus de la cours :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const getPublicationCreationDate = async (req, res) => {
    try {
        const { id_public } = req.params;
        const selectQuery = 'SELECT date_creation FROM publication WHERE id_public = ?';
        const [result] = await db.query(selectQuery, [id_public]);

        if (result && result.length > 0) { // Vérifiez si le résultat est défini et s'il contient des données
            const { date_creation } = result[0];
            return res.status(200).json({ success: true, date_creation });
        } else {
            return res.status(404).json({ success: false, message: 'Publication non trouvée.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de la date de création de la publication :', error);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};




module.exports = {
    getPublicationCreationDate,
    createPublication,
    getAllPublications,
    updatePublicationAdmin,
    deletePublicationAdmin, deletePublicationIns ,
    searchPublicationsByTitre,
    getPublicationById , getAllPublicationsModifierAdmin,
    acceptPublication , updatePublicationParticipant ,
    rejectPublication ,getPublicationsByInstructorId , updatePublicationInstructeur , createPublicationParticipant , getPublicationsByParticipantId
};
