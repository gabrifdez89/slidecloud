var fs = require('fs'),
	originPath = './uploads/',
	destinyPath = './files/';

exports.moveFilesToTree = moveFilesToTree;
exports.deleteFile = deleteFile;
exports.deleteUploadedFiles = deleteUploadedFiles;
exports.getFile = getFile;

/*.**/
function moveFilesToTree (files, fileNames, user, errorCallback, callback) {
	var fileNumber = 0,
		callbackArgument = {
			fileNumber: fileNumber,
			fileNames: fileNames,
			user: user
		};
	try{
		files.forEach(moveFileToTree.bind(callbackArgument));
		callback();
	}catch(error){
		errorCallback(error);
	}
};

function moveFileToTree (file) {
	var fileName = this.fileNames[this.fileNumber],
		origin = originPath + file.filename,
		destiny = destinyPath + this.user + '/' + fileName,
		callbackArgument = {
			fileNumber: this.fileNumber,
			fileNames: this.fileNames,
			origin: origin,
			destiny: destiny
		};

	fs.rename(origin, destiny,
		onRename.bind(callbackArgument));
	this.fileNumber++;
};

function onRename (err) {
	if(err) {
		console.log('Error moving file ' + this.fileNames[this.fileNumber] + ' from ' + this.origin + ' to ' + this.destiny);
	}
};

/*.**/
function deleteFile (file, errorCallback, callback) {
	try{
		var destiny = destinyPath + file.path,
			callbackArgument = {destiny: destiny};

		fs.unlink(destiny, onUnlink.bind(callbackArgument));
		callback(file);
	}catch(error) {
		errorCallback(error);
	}
};

function onUnlink (error) {
	if(error) {
		console.log('Unable to find ' + this.destiny);
	}
};

/*.**/
function deleteUploadedFiles (files, errorCallback, callback) {
	try{
		files.forEach(deleteUploadedFile);
		callback(files);
	}catch (error) {
		errorCallback(error);
	}
};

function deleteUploadedFile (file) {
	var destiny = originPath + file.filename;

	fs.unlink(destiny, onUnlink);
};

/*.**/
function getFile (file, errorCallback, callback) {
	var destiny = destinyPath + file.path,
		callbackArgument = {destiny: destiny, callback: callback};
	try{
		fs.readFile(destiny, 'binary', onReadFile.bind(callbackArgument));
	}catch(error) {
		errorCallback(error);
	}
};

function onReadFile (error, data) {
	if(error) {
		console.log('Unable to find ' + this.destiny);
	} else {
		this.callback(data);
	}
};