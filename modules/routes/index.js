var express = require('express'),
	router = express.Router(),
	multer  = require('multer'),
	upload = multer({dest: './uploads/'}),
	fileController = require('../controllers/file_controller.js'),
	authController = require('../controllers/auth_controller.js'),
	signinController = require('../controllers/signin_controller.js'),
	presentationController = require('../controllers/presentation_controller.js');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

// API routes
router.get('/users/:user/files', 							fileController.files);
router.post('/users/:user/files', upload.array('file'),		fileController.create);
router.delete('/users/:user/files/:fileId',					fileController.delete);
router.get('/users/:user/files/:fileId',					fileController.get);

router.post('/authenticate',								authController.post);
router.post('/signin',										signinController.post);
router.post('/validate',									signinController.validate);
router.post('/requestvalidationemail',						signinController.requestValidationEmail);
router.post('/users/:user/files/:fileId/startpresentation',	presentationController.startPresentation);
router.delete('/users/:user/files/:fileId/presentation',	presentationController.deletePresentation);

module.exports = router;