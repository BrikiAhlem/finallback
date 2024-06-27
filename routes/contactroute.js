const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/contactController');
router.post('/ajouter', ContactController.createContacte); 


module.exports = router;
