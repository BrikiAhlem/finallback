const FormationModel = require('../models/FormationPModel');
const db = require('../config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);
const { authenticateToken } = require('../middleware/authMiddleware');

const errorHandler = (res, message) => {
    console.error(message);
    return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' }); 
};



const getDureeFormation = async (req, res) => {
    try {
        const { id } = req.params;
        const formation = await FormationModel.getFormationById(id);

        // Vérifiez si la formation est vide ou non définie
        if (!formation || !formation.length) {
            return res.status(404).json({ success: false, message: 'Formation non trouvée.' });
        }

        // Extraction de la date de création de la formation
        const dateCreationFormation = formation[0].created_at;
        const dateActuelle = new Date();
        const differenceTemps = dateActuelle - dateCreationFormation;
        const minutes = Math.floor(differenceTemps / (1000 * 60));
        const heures = Math.floor(minutes / 60);

        res.status(200).json({ success: true, duree: { minutes, heures } });
    } catch (error) {
        console.error('Erreur lors du calcul de la durée de la formation :', error);
        res.status(500).json({ success: false, message: 'Erreur lors du calcul de la durée de la formation.' });
    }
};


const modifierFormation = async (req, res) => {
    try {
        const { id_fp } = req.params;
        const { titre, description, domaine, niveaux, prix, certeficat } = req.body;
        let plant = req.Fnameup; // Utiliser req.Fnameup pour récupérer le contenu

        // Vérifiez si le fichier a été téléchargé pour mise à jour du contenu
        if (req.file) {
            plant = req.file.path; // Mettez à jour le contenu avec le nouveau fichier téléchargé
        }

        // Mettre à jour le cours dans la base de données
        await FormationModel.modifierFormation(id_fp, titre, description, plant, domaine, niveaux, prix, certeficat);

        res.status(200).json({ success: true, message: 'Cours modifié avec succès.' });
    } catch (error) {
        console.error('Error in updatecours:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const modifierFormationAdmin = async (req, res) => {
    try {
        const { id_fp } = req.params;
        const { titre, description, domaine, niveaux, prix, certeficat } = req.body;
        let plant = req.Fnameup; // Utiliser req.Fnameup pour récupérer le contenu

        // Vérifiez si le fichier a été téléchargé pour mise à jour du contenu
        if (req.file) {
            plant = req.file.path; // Mettez à jour le contenu avec le nouveau fichier téléchargé
        }

        // Mettre à jour le cours dans la base de données
        await FormationModel.modifierFormationAdmin(id_fp, titre, description, plant, domaine, niveaux, prix, certeficat);

        res.status(200).json({ success: true, message: 'Cours modifié avec succès.' });
    } catch (error) {
        console.error('Error in updatecours:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const createFormation = async (req, res) => {
    try {
        const { titre, description, domaine, niveaux, prix, certeficat } = req.body;
        const { id_coursp } = req.body; // Tableau d'identifiants de cours 
        const instructeurfp_id = req.user.id; // Récupérez l'ID de l'instructeur à partir du token

        if (!titre || !description || !domaine || !niveaux || !prix || !certeficat) {
            return res.status(400).json({ success: false, message: 'Veuillez fournir toutes les données requises.' });
        }
        const plant = req.Fnameup;
        const formationData = { titre, description, domaine, niveaux, prix, certeficat, plant, status: 0 };

        const insertedResult = await FormationModel.createFormation(formationData, id_coursp, instructeurfp_id);

        res.status(201).json({
            success: true,
            message: `Formation créée avec succès. .`,

        });
    } catch (error) {
        console.error('Erreur lors de la création de la formation :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};


const getLastFormationId = async (req, res) => {
    try {
        const result = await query(`
            SELECT id_fp
            FROM formation_p
            ORDER BY id_fp DESC
            LIMIT 1
        `);

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "Aucune formation trouvée." });
        }

        // Récupérer l'ID de la dernière formation
        const lastFormationId = result[0].id_fp + 1;

        return res.status(200).json({ success: true, lastFormationId });
    } catch (err) {
        return errorHandler(res, err);
    }
};
const acceptFormation = async (req, res) => {
    try {
        const { id_fp } = req.params;
        // Mettez à jour le statut de la formation avec l'ID donné pour le marquer comme accepté
        await FormationModel.updateFormationStatus(id_fp, 1); // 1 pour "accepté"
        res.status(200).json({ success: true, message: 'Formation acceptée avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'acceptation de la formation :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const rejectFormation = async (req, res) => {
    try {
        const { id_fp } = req.params;
        // Mettez à jour le statut de la formation avec l'ID donné pour le marquer comme refusé
        await FormationModel.updateFormationStatus(id_fp, 3); // 3 pour "refusé"
        res.status(200).json({ success: true, message: 'Formation refusée avec succès.' }); 
    } catch (error) {
        console.error('Erreur lors du refus de la formation :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const searchFormationsByDomaine = async (req, res) => {
    try {
        const { domaine } = req.query;
        const { id } = req.params;

        const results = await FormationModel.searchFormationsByDomaine(domaine,id);

        res.status(200).json({ success: true, formations: results });
    } catch (error) {
        console.error('Error in searchFormationsByDomaine:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' }); 
    }
};
const searchFormationsByDomaineAdmin = async (req, res) => {
    try {
        const { domaine } = req.query;

        const results = await FormationModel.searchFormationsByDomaineAdmin(domaine);

        res.status(200).json({ success: true, formations: results });
    } catch (error) {
        console.error('Error in searchFormationsByDomaineAdmin:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const searchFormationsByDomaineAdminmodifer = async (req, res) => { 
    try {
        const { domaine } = req.query;

        const results = await FormationModel.searchFormationsByDomaineAdminmodifier(domaine);
        res.status(200).json({ success: true, formations: results });
    } catch (error) {
        console.error('Error in searchFormationsByDomaineAdmin:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};




const getAllFormations = async (req, res) => { 
    try {
        const results = await query(`
            SELECT 
                formation_p.*, 
                instructeur.id AS instructeur_id, 
                instructeur.nom AS instructeur_nom, 
                instructeur.prenom AS instructeur_prenom, 
                instructeur.Avatar AS instructeur_Avatar
            FROM 
                formation_p
            INNER JOIN 
                instructeur ON formation_p.instructeurfp_id = instructeur.id
      
            WHERE 
            formation_p.status = 0
        `);
 
        // Convertir les résultats en une structure de données simple
        const formations = results.map(result => ({ ...result }));

        return res.status(200).json({ success: true, liste: formations });
    } catch (err) {
        return errorHandler(res, err);
    }
};
const getAllFormationsPartAdmin = async (req, res) => { 
    try {
        const results = await query(`
            SELECT 
                formation_p.*, 
                instructeur.id AS instructeur_id, 
                instructeur.nom AS instructeur_nom, 
                instructeur.prenom AS instructeur_prenom, 
                instructeur.Avatar AS instructeur_Avatar
            FROM 
                formation_p
            INNER JOIN 
                instructeur ON formation_p.instructeurfp_id = instructeur.id
      
            WHERE 
            formation_p.status = 1
        `);
 
        // Convertir les résultats en une structure de données simple
        const formations = results.map(result => ({ ...result }));

        return res.status(200).json({ success: true, liste: formations });
    } catch (err) {
        return errorHandler(res, err);
    }
};
const getAllFormationsParticipant = async (req, res) => { 
    try {
        const results = await query(`
            SELECT 
                formation_p.*, 
                instructeur.id AS instructeur_id, 
                instructeur.nom AS instructeur_nom, 
                instructeur.prenom AS instructeur_prenom, 
                instructeur.Avatar AS instructeur_Avatar
            FROM 
                formation_p
            INNER JOIN 
                instructeur ON formation_p.instructeurfp_id = instructeur.id
            INNER JOIN 
                courpayant ON formation_p.id_fp = courpayant.formation_id
            WHERE 
            formation_p.status = 1
        `);
 
        // Convertir les résultats en une structure de données simple
        const formations = results.map(result => ({ ...result }));

        return res.status(200).json({ success: true, liste: formations });
    } catch (err) {
        return errorHandler(res, err);
    }
};

const getAllFormationsModiferAdmin = async (req, res) => { 
    try {
        const results = await query(`
            SELECT formation_p.*, instructeur.id AS instructeur_id, instructeur.nom AS instructeur_nom, instructeur.prenom AS instructeur_prenom, instructeur.Avatar AS instructeur_Avatar
            FROM formation_p
            INNER JOIN instructeur ON formation_p.instructeurfp_id = instructeur.id
            WHERE formation_p.status = 2
        `);

        const formations = results.map(result => ({ ...result }));

        return res.status(200).json({ success: true, liste: formations });
    } catch (err) {
        return errorHandler(res, err);
    }
};





const deleteFormation = async (req, res) => {
    try {
        // Utilisez authenticateToken pour vérifier le token et récupérer l'ID de l'utilisateur
        authenticateToken(req, res, async () => {
            try {
                // Récupérer l'identifiant de la formation à supprimer depuis les paramètres de la requête
                const { id_fp } = req.params;
                console.log('ID de la formation à supprimer :', id_fp);

                // Récupérer l'identifiant de l'utilisateur à partir du token d'authentification
                const userId = req.user.id;

                // Récupérer la formation à supprimer
                const formation = await FormationModel.getFormationById(id_fp);
                console.log('Formation récupérée :', formation);

                // Vérifier si la formation existe
                if (!formation) {
                    return res.status(404).json({ success: false, message: 'Formation non trouvée.' });
                }

                // Comparer l'identifiant de l'utilisateur avec l'identifiant de l'instructeur associé à la formation




                res.status(200).json({ success: true, message: 'Formation supprimée avec succès.' });
            } catch (error) {
                console.error('Erreur lors de la suppression de la formation :', error);
                res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
            }
        });
    } catch (error) {
        console.error('Erreur lors de la vérification du token :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};


const searchFormationsByTitre = async (req, res) => {
    try {
        const { titre } = req.query;
        const results = await FormationModel.searchFormationsByTitre(titre);

        res.status(200).json({ success: true, formations: results });
    } catch (error) {
        console.error('Error in searchFormationsByTitre:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });  
    }
};
// const getFormationById = async (req, res) => {
//     try {
//         const { id_fp } = req.params;
//         const formation = await FormationModel.getFormationById(id_fp);

//         if (!formation) {
//             return res.status(404).json({ success: false, message: 'Formation non trouvée.' });
//         }

//         res.status(200).json({ success: true, formation });
//     } catch (error) {
//         console.error('Error in getFormationById:', error);
//         res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
//     }
// };
const getFormationById = async (req, res) => {  
    try {
        const { id } = req.params;
        const results = await query(`
            SELECT formation_p.*, instructeur.id AS instructeur_id, instructeur.nom AS instructeur_nom, instructeur.prenom AS instructeur_prenom, instructeur.Avatar AS instructeur_Avatar
            FROM formation_p
            INNER JOIN instructeur ON formation_p.instructeurfp_id = instructeur.id
            WHERE formation_p.id_fp = ?
        `, [id]);

        if (results.length > 0) {
            const formation = results[0]; // Il ne devrait y avoir qu'une seule formation avec cet ID
            return res.status(200).json({ success: true, formation });
        } else {
            return res.status(404).json({ success: false, message: 'Formation non trouvée.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de la formation par ID:', error);
        return res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la formation.' });
    }
};

const getFormationCount = async (req, res) => {
    try {
        const count = await FormationModel.countFormations();
        res.json({ total: count });
    } catch (error) {
        console.error('Erreur lors de la récupération du nombre de formations :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const countDistinctDomains = async (req, res) => {
    try {
        const count = await FormationModel.countDistinctDomains();
        res.json({ totalDistinctDomains: count });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du nombre de domaines.' });
    }
};

// Contrôleur pour récupérer le nombre de formations par domaine
const countFormationsByDomain = async (req, res) => {
    try {
        const formationsByDomain = await FormationModel.countFormationsByDomain();
        res.json(formationsByDomain);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du nombre de formations par domaine.' });
    }
};
const getNumberOfCertificats = async (req, res) => {
    try {
        const count = await FormationModel.countCertificats();
        res.status(200).json({ success: true, totalCertificats: count });
    } catch (error) {
        console.error('Erreur lors de la récupération du nombre de certificats :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};
const getFormationsByInstructorId = async (req, res) => {
    try {
        const { id } = req.params;
        const formations = await FormationModel.getFormationsByInstructorId(id);
        res.status(200).json({ success: true, formations });
    } catch (error) {
        console.error('Erreur lors de la récupération des formations par ID d\'instructeur :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};

const countTotalFormations = async (req, res) => {
    try {
        const total = await FormationModel.countFormations();
        res.status(200).json({ success: true, totalFormations: total });
    } catch (error) {
        console.error('Erreur lors de la récupération du total des formations :', error); 
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' }); 
    }
};
const getParticipantFormations = async (req, res)=> {
    const participantId = req.params.participantId;
    try {
        const formations = await FormationModel.getParticipantFormations(participantId);
        res.json(formations);
    } catch (error) {
        console.error('Error fetching participant formations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const getFormationsPayees = async (req, res) => {
    try {
        const formationsPayees = await query(`
            SELECT formation_p.id_fp, formation_p.titre, formation_p.prix,
                   participant.id_p AS participant_id, participant.nom AS participant_nom, participant.prenom AS participant_prenom,
                   instructeur.id AS instructeur_id, instructeur.nom AS instructeur_nom, instructeur.prenom AS instructeur_prenom
            FROM formation_p
            LEFT JOIN participant ON formation_p.participantfp_id = participant.id_p
            INNER JOIN instructeur ON formation_p.instructeurfp_id = instructeur.id
            WHERE formation_p.participantfp_id IS NOT NULL
        `);

        res.status(200).json({ success: true, formations: formationsPayees });
    } catch (error) {
        console.error('Erreur lors de la récupération des formations payées :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
};


module.exports = { 
    getFormationsPayees,
    getParticipantFormations ,
    countTotalFormations,
    getNumberOfCertificats,
    getFormationCount,
    createFormation,
    getAllFormations, 
    getLastFormationId,
    deleteFormation,
    searchFormationsByTitre,
    getFormationById,
    searchFormationsByDomaine,
    countFormationsByDomain,
    countDistinctDomains,
    rejectFormation,
    acceptFormation,
    getFormationsByInstructorId, getAllFormationsPartAdmin,
    modifierFormation,
    getDureeFormation , getAllFormationsModiferAdmin , modifierFormationAdmin , getAllFormationsParticipant , searchFormationsByDomaineAdmin,searchFormationsByDomaineAdminmodifer

};
