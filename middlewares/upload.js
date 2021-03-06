var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/img/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() +'_'+ file.originalname);
  }
})

var upload = multer({ storage });

module.exports = function (app) {
  app.post('/upload', (req, res, next) => {
    upload.single('imageUpload')(req, res, err => {
      if (err) {
        return res.json({
          error: err.message
        });
      }   
      res.json({initialPreview:`<img src='/img/uploads/${req.file.filename}' class='file-preview-image' style="max-width: 200px; height:auto; object-fit:cover">`});
    })
  })
}