const express = require('express');
const router = express.Router();
const PaiementController = require('../controllers/paimentControleur');
const { authenticateToken, generateToken } = require("../middleware/authMiddleware");
router.post('/paiment', authenticateToken, PaiementController.Add);
router.post('/Verify/:id',PaiementController.verify );
router.get('/getPaymentId/:formationId', async (req, res) => {
    const formationId = req.params.formationId;

    try {
        const paymentId = await PaiementController.getPaymentIdByFormationId(formationId);
        
        if (paymentId) {
            res.send({ paymentId });
        } else {
            res.status(404).send("Aucun paiement trouvé pour cette formation.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message); 
    }
});

module.exports = router;
 