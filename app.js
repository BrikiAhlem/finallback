// app.js
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const participantRoutes = require('./routes/participantRoutes');
const courseRoutes = require('./routes/CoursProute');
const courseGRoutes = require('./routes/CoursGroute');
const formationPRout = require('./routes/FormationPRoutes')
const ResourceRoute = require('./routes/RessourceRoute')
const AdminRoute = require('./routes/AdminRoute')
const coursgratuis = require('./routes/CoursGroute')
const coursPayant = require('./routes/CoursProute')
const publication = require('./routes/PublicationRoute')
const instructeur = require('./routes/instructeurRoutes')
const contact = require('./routes/contactroute')
const commentaire = require('./routes/comentaireRoute')
const paiment = require('./routes/paimentroute')
const quiz = require('./routes/quizRoute')
const question = require('./routes/questionRoutes')
const quizFinal = require('./routes/quizfinal/routequiz')
const questionFinal = require('./routes/quizfinal/routequestion')
const  reponsefinal = require('./routes/quizfinal/roueteponse')

const authMiddleware = require('./middleware/authMiddleware');
const path = require('path');

const port = process.env.PORT || 3000;  
 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 


// Configuration de CORS
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/participant', participantRoutes);
app.use('/coursPayant', coursPayant); 
app.use('/coursgratuis', coursgratuis); 
app.use('/formationP', formationPRout);
app.use('/Ressource', ResourceRoute);
app.use('/Admin', AdminRoute); 
app.use('/publication', publication); 
app.use('/instructeur', instructeur);   
app.use('/contact', contact);  
app.use('/commentaire', commentaire); 
app.use('/Pa', paiment); 
app.use('/quiz', quiz);  
app.use('/question', question);   
app.use('/quizFinal', quizFinal);    
app.use('/questionFinal', questionFinal);   
app.use('/reponsefinal', reponsefinal);  


const staticFilesPath ='C:/Users/ahlem/OneDrive/Bureau/PFE/final sprint/backendsp22-main/backendsp22-main/upload'; // Chemin vers le dossier contenant les fichiers
app.use('/uploads', express.static(staticFilesPath)); 

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);      
});
