const express = require('express');
const router = express.Router();
const CoursPController = require('../controllers/CoursPController');
const upload = require("../middleware/fileapp")



router.post('/ajouter/:formationId', upload.any('contenu'), CoursPController.createcoursP);
router.get('/lister', CoursPController.getAllcourss);  
router.get('/getAllcourssAdminConsulter', CoursPController.getAllcourssAdminConsulter);
router.get('/getAllcourssDemandeAdmin', CoursPController.getAllcourssDemandeAdmin); 
router.get('/lister', CoursPController.listerCours);
router.put('/modifier/:id_cp',upload.any('contenu'), CoursPController.updatecours);
router.delete('/supprimer/:id_cp', CoursPController.deletecours);
router.get('/rechercher', CoursPController.searchcourssByTitre);  
router.get('/searchcourssByTitreAdmin', CoursPController.searchcourssByTitreAdmin);
router.get('/searchcourssByTitreAdminmodification', CoursPController.searchcourssByTitreAdminmodification);

router.get('/getAllcourssAdminModifier', CoursPController.getAllcourssAdminModifier);
router.get('/getCoursById/:id_cp', CoursPController.getcoursByIdAin);
router.get('/getCoursGById/:id', CoursPController.getcoursById); 
router.put('/accepter/:id_cp', CoursPController.acceptCours);  
router.put('/refuser/:id_cp', CoursPController.rejectCours); 
router.get('/formation/:formationId/cours', CoursPController.getCoursByFormationId);
router.get('/formation/:formationId/course/:courseId/number', CoursPController.getCourseNumberByFormationAndId);
router.get('/formation/:formationId/paidCoursesWithNumberAndStatus', CoursPController.getPaidCoursesWithNumberAndStatusByFormation);

module.exports = router;
