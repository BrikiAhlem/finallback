const jwt = require('jsonwebtoken');
const secretKey = 'votre_clé_secrète'; // Remplacez ceci par votre propre clé secrète

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, secretKey, { expiresIn: '2h' }); // Vous pouvez ajuster la durée de validité du token selon vos besoins
};

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Token manquant. Authentifiez-vous pour accéder à cette ressource.' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded; // Attach the user information to the request object
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalide. Authentifiez-vous pour accéder à cette ressource.' });
    }
};

module.exports = {
    authenticateToken,
    generateToken
};
