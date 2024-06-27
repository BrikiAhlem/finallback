// app.js
const express = require('express');
const bodyParser = require('body-parser');
const participantRoutes = require('./routes/participantRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('', participantRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
