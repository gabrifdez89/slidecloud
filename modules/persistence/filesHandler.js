var models = require('../models/models.js'),
	usersHandler = require('../persistence/usersHandler.js');

exports.getFileById = getFileById;
exports.getFilesByUserId = getFilesByUserId;
exports.createFile = createFile;
exports.createFiles = createFiles;
exports.saveFile = saveFile;
exports.saveFiles = saveFiles;
exports.deleteFile = deleteFile;
exports.userHasSomeFileWithName = userHasSomeFileWithName;

/*.**/
function getFileById (id, errorCallback, callback) {
	models.File.findById(id)
	.then(function (file) {
		callback(file);
	}).catch(function (error) {
		errorCallback(error);
	});
};

/*.**/
function getFilesByUserId (id, errorCallback, callback) {
	models.File.findAll({
		where: {
			userId: id
		}
	}).then(function (files) {
		callback(files);
	}).catch(function (error) {
		errorCallback(error);
	});
};

/*.**/
function createFile (fileName, user, errorCallback, callback) {
	try{
		var file = models.File.build({
			name: fileName,
			path: user.username + '/' + fileName,
			baseUrl: 'users/' + user.username + '/files/',
			UserId: user.id
		});
		callback(file);
	}catch(error){
		console.log('Error creating the file ' + fileName);
		errorCallback(error);
	}
};

/*.**/
function createFiles (fileNames, user, errorCallback, callback) {
	var files = [],
		callbackArgument = {errorCallback: errorCallback, callback: callback, user: user, files: files};
	fileNames.forEach(createFileAndAddIt.bind(callbackArgument));
	callback(files);

};

function createFileAndAddIt (fileName) {
	var callbackArgument = {errorCallback: this.errorCallback, callback: this.callback, files: this.files, fileName: fileName};
	createFile(fileName, this.user,
		onCreateFileFailed.bind(callbackArgument),
		addFile.bind(callbackArgument));
};

function onCreateFileFailed (error) {
	this.errorCallback(error);
};

function addFile (file) {
	this.files.push(file);
};

/*.**/
function saveFile (file, errorCallback, callback) {
	file.save({
		fields: ['name', 'path', 'baseUrl', 'UserId']
	}).then(function (savedFile) {
		callback(savedFile);
	}).catch(function (error) {
		errorCallback(error);
	});
};

/*.**/
function saveFiles (files, errorCallback, callback) {
	var savedFiles = [],
		errors = [],
		callbackArgument = {savedFiles: savedFiles, errors: errors};

	files.forEach(saveFileAndAddIt.bind(callbackArgument));

	if(errors.length > 0) {
		errorCallback(errors);
	} else {
		callback(savedFiles);
	}
};

function saveFileAndAddIt (file) {
	var callbackArgument = {savedFiles: this.savedFiles, errors: this.errors};

	saveFile(file,
		addToErrors.bind(callbackArgument),
		addToSaved.bind(callbackArgument));
};

function addToErrors (error) {
	this.errors.push(error);
};

function addToSaved (savedFile) {
	this.savedFiles.push(savedFile);
};

/*.**/
function deleteFile (file, errorCallback, callback) {
	file.destroy()
	.then(function () {
		callback();
	}).catch(function (error) {
		errorCallback(error);
	});
};

/*.**/
function userHasSomeFileWithName (userName, files, errorCallback, callback) {
	var callbackArgument = {errorCallback: errorCallback, callback: callback, files: files};

	usersHandler.getUserByUserName(userName,
		onGetUsersByUserNameFailed.bind(callbackArgument),
		getFilesByUserIdAndCheckNames.bind(callbackArgument));
};

function onGetUsersByUserNameFailed (error) {
	console.log('error getting users by user name: ' + error);
	this.errorCallback(error);
};

function getFilesByUserIdAndCheckNames (user) {
	var callbackArgument = {errorCallback: this.errorCallback, callback: this.callback, files: this.files};

	getFilesByUserId(user.id,
		onGetFilesByUserIdFailed.bind(callbackArgument),
		checkFilesNames.bind(callbackArgument));
};

function onGetFilesByUserIdFailed (error) {
	this.errorCallback(error);
};

function checkFilesNames (userFiles) {
	var hasSome = false,
		callbackArgument = {hasSome: hasSome, userFiles: userFiles};

	this.files.forEach(checkFileName.bind(callbackArgument));

	this.callback(hasSome);
};

function checkFileName (fileName) {
	var callbackArgument = {hasSome: this.hasSome, fileName: fileName};

	this.userFiles.forEach(compareFileNameAndUpdateFlag.bind(callbackArgument));
};

function compareFileNameAndUpdateFlag (userFile) {
	if(this.fileName === userFile.name) {
		this.hasSome = true;
	}
};