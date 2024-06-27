const bcrypt = require('bcrypt');
const util = require('util');
const dbConnection = require('../config/db');

const saltRounds = 10;
const query = util.promisify(dbConnection.query).bind(dbConnection);

const Admin = {
    register: async (AdminData) => {
        try {
          // Assurez-vous que participantData.mots_de_passeP a une valeur définie.
          if (!AdminData.mots_de_passe) {
            throw new Error('Le mot de passe est requis pour l\'inscription.');
          }
    
          const hashedmots_de_passe= await bcrypt.hash(AdminData.mots_de_passe, saltRounds);
          const result = await query(
            'INSERT INTO admin (avatar ,email, mots_de_passe) VALUES (?, ?, ?)',
            [AdminData.avatar, AdminData.email, hashedmots_de_passe]
          );
          return result;
        } catch (error) {
          throw error;
        }
      },
      
login: async (email, mots_de_passe) => {
  try {
      const results = await query('SELECT * FROM admin WHERE email = ?', [email]);
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

getAdminById: async (id) => {
    try {
        const results = await query('SELECT * FROM admin WHERE id = ?', [id]);
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        throw error;
    }
},
   
getAllInstructeurs: async () => {
  try {
      const instructeurs = await query('SELECT * FROM instructeur');
      return instructeurs;
  } catch (error) {
      throw error;
  }
} ,
 getAllInstructeurCount : async () => {
  try {
      const queryResult = await query('SELECT COUNT(*) AS count FROM instructeur');
      return queryResult[0].count;
  } catch (error) {
      console.error('Erreur lors du comptage des instructeurs :', error);
      throw error;
  }
} ,

 getAllParticipantCount :async () => {
  try {
      const queryResult = await query('SELECT COUNT(*) AS count FROM participant');
      return queryResult[0].count;
  } catch (error) {
      console.error('Erreur lors du comptage des participants :', error);
      throw error;
  }
},

 getAllFormationCount :async () => {
  try {
      const queryResult = await query('SELECT COUNT(*) AS count FROM formation_p');
      return queryResult[0].count;
  } catch (error) {
      console.error('Erreur lors du comptage des formations :', error);
      throw error;
  }
},
 getInstructorCountByWeek : async () => {
  try {
    const queryResult = await query('SELECT WEEK(created_at) AS week, COUNT(*) AS count FROM instructeur GROUP BY WEEK(created_at)');
    return queryResult;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'augmentation des comptes d\'instructeurs par semaine :', error);
    throw error;
  }
},
getParticipantCountByWeek: async () => {
  try {
    const queryResult = await query('SELECT WEEK(created_at) AS week, COUNT(*) AS count FROM participant GROUP BY WEEK(created_at)');
    return queryResult;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'augmentation des comptes de participants par semaine :', error);
    throw error;
  }
},

  getAllCoursCount: async () => {
    try {
      const queryResult = await query('SELECT COUNT(*) AS count FROM courgratuits');
      return queryResult[0].count;
    } catch (error) {
      throw error;
    }
  },

  getAllFormationCount: async () => {
    try {
      const queryResult = await query('SELECT COUNT(*) AS count FROM formation_p');
      return queryResult[0].count;
    } catch (error) {
      throw error;
    }
  },

  getAllRessourceCount: async () => {
    try {
      const queryResult = await query('SELECT COUNT(*) AS count FROM ressource_pedagogique');
      return queryResult[0].count;
    } catch (error) {
      throw error;
    }
  } ,

  updateAdmin: async (id_A, newData) => {
    try {
        if (newData.mots_de_passe) {
            const hashedmots_de_passe = await bcrypt.hash(newData.mots_de_passe, saltRounds);
            await query(
                'UPDATE admin SET email = ?, mots_de_passe = ? WHERE id_A = ?',
                [newData.email, hashedmots_de_passe, id_A]
            );
        } else {
            await query(
                'UPDATE admin SET email = ? WHERE id_A = ?',
                [newData.email, id_A]
            );
        }
    } catch (error) {
        throw error;
    }
},

  
}



  module.exports = Admin;