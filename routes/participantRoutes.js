// participantRoutes.js

const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const upload = require("../middleware/fileapp")
// Assurez-vous que votre route POST est correctement définie
router.post('/register', participantController.register);
router.put('/avatar/:id',upload.any('Avatar'), participantController.updateAvatar);

router.put('/modifier/:id', participantController.modifierParticipant);
router.post('/login', participantController.login);
router.get('/:id', participantController.getParticipantById);
router.get('/count', participantController.countTotal);

router.get('/', participantController.getAllParticipants);
router.delete('/supprimer/:id', participantController.supprimerParticipant);
router.put('/modifierMotDePasse/:id_p', participantController.updatePassword); 
router.put('/archiver/:id_p', participantController.archiverParticipant); 
router.put('/Desarchiver/:id_p', participantController.desarchiverParticipant); 
router.post('/resetPasswordRequest', participantController.resetPasswordRequest);
router.put('/resetPassword', participantController.resetPassword);

module.exports = router;
