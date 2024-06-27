const express = require('express');
const router = express.Router();
const commentaireController = require('../controllers/commentaireController');
router.post('/ajouter', commentaireController.createcommentairee); 
router.get('/lister', commentaireController.getAllcommentairees); 


module.exports = router;
