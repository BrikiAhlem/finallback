const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require("../middleware/fileapp");

router.post('/register', AdminController.register);
router.post('/login', AdminController.login);

router.get('/instructeurs', authenticateToken, AdminController.getAllInstructeurs);
router.get('/totals', AdminController.getTotalCounts);
router.get('/getTotalP', AdminController.getTotalP);
router.get('/instructor-count-by-week', AdminController.getInstructorCountByWeek); 
router.get('/participant-count-by-week', AdminController.getParticipantCountByWeek);  
router.put('/:id_A', authenticateToken, AdminController.updateAdmin);
router.get('/statistiques/domaines', AdminController.getDomaineStats);
 
module.exports = router;
