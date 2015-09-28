var express = require('express');
var router = express.Router();

var fileController = require('../controllers/file_controller.js');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/users/:user/files', fileController.files);

module.exports = router;