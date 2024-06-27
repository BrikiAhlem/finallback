const bcrypt = require('bcrypt');
const util = require('util');
const dbConnection = require('../config/db');

const saltRounds = 10;
const query = util.promisify(dbConnection.query).bind(dbConnection);
const nodemailer = require('nodemailer'); 
const transporter = nodemailer.createTransport({
    service:'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: false,
    auth: {
        user: 'ahlembriki4@gmail.com',
        pass: 'nqlaebuyygecmrdl'
    }
});
const Instructeur = {
   
    login: async (email, mots_de_passe) => {
        try {
            const results = await query('SELECT * FROM instructeur WHERE email = ?', [email]);
            if (results.length > 0) {
                const mots_de_passeMatch = await bcrypt.compare(mots_de_passe, results[0].mots_de_passe);
                return mots_de_passeMatch ? results[0] : null;
            } else {
                return null;
            }
        } catch (error) {
            throw error;
        }
    },
    getInstructeurById: async (instructeur_id) => {
        try {
            const id = instructeur_id;
            const results = await query('SELECT * FROM instructeur WHERE id = ?', [instructeur_id]);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            throw error;
        }
    },
    
    deleteInstructeur: async (id) => {
        try {
            const deleteQuery = 'DELETE FROM instructeur WHERE id = ?';
            const result = await query(deleteQuery, [id]);
            return result;
        } catch (error) {
            throw error;
        }
    },
    countFormationsForInstructeur: async (id) => {
        try {
            const queryResult = await query('SELECT COUNT(*) AS count FROM formation_p WHERE instructeurfp_id = ?', [id]);
            return queryResult[0].count;
        } catch (error) {
            console.error('Erreur lors du comptage des formations pour l\'instructeur:', error);
            throw error;
        }
    },
    countCoursGratuitsForInstructeur: async (id) => {
        try {
            const queryResult = await query('SELECT COUNT(*) AS count FROM courgratuits WHERE id_InsctructeurC = ? ', [id]);
            return queryResult[0].count;
        } catch (error) {
            console.error('Erreur lors du comptage des cours gratuits pour l\'instructeur:', error);
            throw error;
        }
    },
    countInstructeurs: async () => {
        try {
            const queryResult = await query('SELECT COUNT(*) AS count FROM instructeur');
            return queryResult[0].count;
        } catch (error) {
            console.error('Erreur lors du comptage des instructeurs :', error);
            throw error;
        }
    } ,
    updateInstructeur: async (id, InstructeurData) => {
        try {
            const { nom, prenom, email, specialite, tel } = InstructeurData;
    
    
            const updateQuery = `
            UPDATE instructeur
            SET nom = ?, prenom = ?, email= ?,  specialite = ? ,tel = ? 
            WHERE id = ?
        `;
        
        const result = await query(updateQuery, [nom, prenom, email, specialite, tel, id]);
    
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    
    updateAvatar: async (id, avatar) => {
        try {
            const updateQuery = `
                UPDATE instructeur
                SET Avatar = ?
                WHERE id = ?
            `;
            const result = await query(updateQuery, [avatar, id]);
            return result;
        } catch (error) {
            throw error;
        }
    }
    ,
    
    
       register: async (InstructeurData) => {
            try {
              // Assurez-vous que participantData.mots_de_passeP a une valeur définie.
              if (!InstructeurData.mots_de_passe) {
                throw new Error('Le mot de passe est requis pour l\'inscription.');
              }
        
              const hashedmots_de_passe= await bcrypt.hash(InstructeurData.mots_de_passe, saltRounds);
              const result = await query(
                'INSERT INTO instructeur (nom, prenom, email, mots_de_passe, tel, specialite) VALUES (?, ?, ?, ?, ?, ?)',
                [InstructeurData.nom, InstructeurData.prenom, InstructeurData.email, hashedmots_de_passe, InstructeurData.tel, InstructeurData.specialite]
              );
              return result;
            } catch (error) {
              throw error;
            }
          },
           updateInstructeurStatus : async (id, newStatus) => {
            try {
              // Utilisez votre ORM ou votre bibliothèque de requêtes SQL pour mettre à jour l'instructeur
              const updatedInstructeur = await Instructeur.findOneAndUpdate(
                { _id: id },
                { statut: newStatus },
                { new: true } // Pour obtenir l'instructeur mis à jour après la mise à jour
              );
              return updatedInstructeur;
            } catch (error) {
              console.error('Erreur lors de la mise à jour du statut de l\'instructeur :', error);
              throw error;
            }
          },
          resetPasswordRequest: async (email) => {
            try {
                // Générer un code de réinitialisation
                const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
                // Enregistrer le code de réinitialisation dans la base de données avec une date d'expiration
                const expirationDate = new Date(Date.now() + 3600000); // 1 heure
                const updateQuery = 'UPDATE instructeur SET reset_code = ?, reset_code_expires = ? WHERE email = ?';
                await query(updateQuery, [resetCode, expirationDate, email]);
    
                // Envoi de l'e-mail de réinitialisation
                const mailOptions = {
                    from: 'ahlembriki4@gmail.com',
                    to: email,
                    subject: 'Réinitialisation de mot de passe',
                    text: `Votre code de réinitialisation de mot de passe est : ${resetCode}. Il expirera dans 1 heure.`
                };
    
                await transporter.sendMail(mailOptions);
            } catch (error) {
                throw error;
            }
        },
        resetPassword: async (email, resetCode, nouveauMotDePasse) => {
            try {
                const hashedNouveauMotDePasse = await bcrypt.hash(nouveauMotDePasse, saltRounds); // Hasher le nouveau mot de passe
        
                // Vérifier si le code de réinitialisation est valide
                const results = await query('SELECT * FROM instructeur WHERE email = ?', [email]);
                if (results.length > 0) {
                    const user = results[0];
                    console.log(user)
                    if (user.reset_code === resetCode && user.reset_code_expires > new Date()) {
                        // Mettre à jour le mot de passe dans la base de données et supprimer le code de réinitialisation
                        const updateQuery = 'UPDATE instructeur SET mots_de_passe = ?, reset_code = NULL, reset_code_expires = NULL WHERE email = ?';
                        await query(updateQuery, [hashedNouveauMotDePasse, email]);
                        return true; // Mot de passe réinitialisé avec succès
                    } else {
                        throw new Error('Code de réinitialisation invalide ou expiré.');
                    }
                } else {
                    throw new Error('Aucun utilisateur trouvé avec cet e-mail.');
                }
            } catch (error) {
                throw error;
            }
        },
          
    
    
         getFormationsByInstructeurRevenu :async (instructeurId) => {
            const sql = `
                SELECT formation_p.id_fp, formation_p.prix, COUNT(participant.id_p) AS nombreParticipants
                FROM formation_p
                LEFT JOIN participant ON formation_p.id_fp = participant.id_p
                WHERE formation_p.instructeurfp_id = ?
                GROUP BY formation_p.id_fp
            `; 
            return await query(sql, [instructeurId]);
        }, 
        
};

module.exports = Instructeur;
