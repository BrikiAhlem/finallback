const multer = require('multer');

const storage = multer.diskStorage({
  destination: './upload',
  filename: (req, file, cb) => {
    const uniqueSuffix = file.originalname.split('.')[0] + '-' + (Date.now() + '-' + Math.round(Math.random() * 1E9)) + '.' + file.originalname.split('.')[1];
    req.Fnameup = uniqueSuffix;    
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ 
  storage: storage 
});

module.exports = upload;
