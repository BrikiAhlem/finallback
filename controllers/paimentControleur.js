const db = require('../config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);
const axios = require("axios")
const jwt = require('jsonwebtoken');
const secretKey = 'votre_clé_secrète'; // Assurez-vous de remplacer ceci par votre propre clé secrète



const Add = async (req, res) => {
    const participantId = req.body.participantId;
    const formationId = req.body.formation_id;
    const formationIdP= req.body.formation_id;

    const amountfinal = req.body.amount * 1000;
    const url = "https://developers.flouci.com/api/generate_payment";
    const payload = {
        "app_token": "adf58929-ac14-4b7c-8176-32c3908f8dd7",
        "app_secret": "532300ef-5077-457c-a2a4-23f33a0622d8",
        "amount": amountfinal,
        "accept_card": "true",
        "session_timeout_secs": 3000,
        "success_link": `http://localhost:3001/Formation/getformationById/${formationId}`,
        "fail_link": "http://localhost:3000/fail",
        "developer_tracking_id": "0b5cc9de-5280-4975-ba4e-ad0d3a8e419b"
    };

    try {
        // Générer le paiement
        const result = await axios.post(url, payload);
        const paymentId = result.data.result.payment_id; // Accéder à l'identifiant de paiement dans le niveau result
        console.log(paymentId);

        // Mettre à jour la table des formations avec l'ID du participant
        const updateFormationQuery = `UPDATE formation_p SET participantfp_id = ? WHERE id_fp = ?`;
        await query(updateFormationQuery, [participantId, formationId]);

        // Insérer une nouvelle entrée dans la table des participations
        const insertParticipationQuery = `INSERT INTO participation (id_p, id_fp, id_paiement) VALUES (?, ?, ?)`;
        await query(insertParticipationQuery, [participantId, formationIdP, paymentId]);

        res.send(result.data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Une erreur s'est produite lors du traitement du paiement.");
    }
};

const getPaymentIdByFormationId = async (formationId) => {
    try {
        const getPaymentIdQuery = `SELECT id_paiement FROM participation WHERE id_fp = ?`;
        const result = await query(getPaymentIdQuery, [formationId]);
        return result.length > 0 ? result[0].id_paiement : null;
    } catch (error) {
        console.error(error);
        throw new Error("Une erreur s'est produite lors de la récupération de l'ID de paiement.");
    }
};
const verify = async (req, res) => {
    const id_payment = req.params.id
    const url = `https://developers.flouci.com/api/verify_payment/${id_payment}`
    await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
            'apppublic': 'adf58929-ac14-4b7c-8176-32c3908f8dd7',
            "appsecret": "532300ef-5077-457c-a2a4-23f33a0622d8", 
        }
    })
        .then(result => {
            res.send(result.data)
        })
        .catch(err => {
            console.log(err.message)

        }
        )

};
module.exports = {
    Add,
    getPaymentIdByFormationId,
    verify,
}; 