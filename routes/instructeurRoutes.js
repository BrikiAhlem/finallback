const express = require('express');
const router = express.Router();
const instructeurController = require('../controllers/instructeurController');
const upload = require("../middleware/fileapp")

router.get('/lister', instructeurController.listerInstructeursB);
router.get('/', instructeurController.listerInstructeurs);
router.post('/register', instructeurController.register);
router.put('/avatar/:id',upload.any('Avatar'), instructeurController.updateAvatar);
router.put('/modifier/:id', instructeurController.modifierInstructeur); 

router.post('/login', instructeurController.login);
router.get('/getInstructeurById/:instructeur_id', instructeurController.getInstructeurById);
router.get('/revenu/:id', instructeurController.calculerRevenuInstructeur);

router.delete('/supprimer/:id', instructeurController.supprimerInstructeur);
router.get('/instructeur/:instructeur_id/stats', instructeurController.countStatsForInstructeur);
router.get('/count', instructeurController.countInstructeurs);
router.put('/archiver/:id', instructeurController.archiverInstructeur); 
router.put('/Desarchiver/:id', instructeurController.desarchiverInstructeur); 
router.post('/resetPasswordRequest', instructeurController.resetPasswordRequest);
router.put('/resetPassword', instructeurController.resetPassword);
module.exports = router;
