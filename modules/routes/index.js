var express = require('express'),
	router = express.Router(),
	multer  = require('multer'),
	upload = multer({dest: './uploads/'}),
	fileController = require('../controllers/file_controller.js');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

// API routes
router.get('/users/:user/files', 							fileController.files);
router.post('/users/:user/files', upload.array('file'),		fileController.create);
router.delete('/users/:user/files/:fileId',					fileController.delete);
router.get('/users/:user/files/:fileId',						fileController.get);

module.exports = router;