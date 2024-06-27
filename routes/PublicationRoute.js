const express = require('express');
const router = express.Router();
const PublicationController = require('../controllers/PublicationController');
const upload = require("../middleware/fileapp");


router.post('/ajouter', PublicationController.createPublication);   
router.post('/ajouterParticipant', PublicationController.createPublicationParticipant);
router.get('/lister', PublicationController.getAllPublications); 
router.get('/getAllPublicationsModifierAdmin', PublicationController.getAllPublicationsModifierAdmin);
router.put('/updatePublicationAdmin/:id_public', PublicationController.updatePublicationAdmin);
router.delete('/supprimerAdmin/:id_public', PublicationController.deletePublicationAdmin);
router.delete('/supprimer/:id_public', PublicationController.deletePublicationIns);
router.get('/getPublicationById/:id', PublicationController.getPublicationById); 
router.put('/accepter/:id_public', PublicationController.acceptPublication);
router.put('/refuser/:id_public', PublicationController.rejectPublication); 
router.get('/publication/:id_public/creation-date', PublicationController.getPublicationCreationDate);   

router.get('/getPublicationsByParticipantId/:id_participant', PublicationController.getPublicationsByParticipantId);
router.get('/publicationsInstructeur/:id_instructeur', PublicationController.getPublicationsByInstructorId); 
router.put('/updatePublicationParticipant/:id_public', PublicationController.updatePublicationParticipant);
router.put('/publicationInstructeurModifier/:id_public', PublicationController.updatePublicationInstructeur); 
router.get('/rechercherByTitre', PublicationController.searchPublicationsByTitre);


module.exports = router;
