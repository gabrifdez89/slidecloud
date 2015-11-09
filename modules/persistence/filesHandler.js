var models = require('../models/models.js');

exports.getFileById = function (id, callback, errorCallback) {
	models.File.findById(id)
	.then(function (file) {
		callback(file);
	}).catch(function (error) {
		errorCallback(error);
	});
};

exports.getFilesByUserId = function (id, callback) {
	models.File.findAll({
		where: {
			userId: id
		}
	}).then(function (files) {
		callback(files);
	});
};

exports.createFile = function (fileName, user, callback) {
	var file = models.File.build({
		name: fileName,
		path: user.username + '/' + fileName,
		baseUrl: 'users/' + user.username + '/files/',
		UserId: user.id
	});
	callback(file);
};

exports.createFiles = function (fileNames, user, callback) {
	var files = [];
	fileNames.forEach(function (fileName) {
		exports.createFile(fileName, user, function (file) {
			files.push(file);
		});
	});
	callback(files);
};

exports.saveFile = function (file, callback, errorCallback) {
	file.save({
		fields: ['name', 'path', 'baseUrl', 'UserId']
	}).then(function (savedFile) {
		callback(savedFile);
	}).catch(function (error) {
		errorCallback(error);
	});
};

exports.saveFiles = function (files, callback, errorCallback) {
	var savedFiles = [],
		errors = [];
	files.forEach(function (file) {
		exports.saveFile(file, function (savedFile) {
			savedFiles.push(savedFile);
		}, function (error) {
			errors.push(error);
		});
	});
	if(errors.length > 0) {
		errorCallback(errors);
	} else {
		callback(savedFiles);
	}
};

exports.deleteFile = function (file, callback, errorCallback) {
	file.destroy()
	.then(function () {
		callback();
	}).catch(function (error) {
		errorCallback(error);
	});
};