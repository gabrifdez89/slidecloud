var fs = require('fs'),
	originPath = './uploads/',
	destinyPath = './files/';

exports.moveFilesToTree = moveFilesToTree;
exports.deleteFile = deleteFile;
exports.deleteUploadedFiles = deleteUploadedFiles;
exports.getFile = getFile;

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
		throw err;
	}
};

function deleteFile (file, callback, errorCallback) {
	var destiny = destinyPath + file.path;
	fs.unlink(destiny, function (error) {
		if(error) {
			console.log('Unable to find ' + destiny);
			errorCallback(error);
		} else {
			callback(file);
		}
	});
};

function deleteUploadedFiles (files, callback, errorCallback) {
	var err;

	files.forEach(function (file) {
		var destiny = originPath + file.filename;

		fs.unlink(destiny, function (error) {
			err = error;
		});
	});

	err ? errorCallback(err) : callback(files);
};

function getFile (file, callback, errorCallback) {
	var destiny = destinyPath + file.path;
	fs.readFile(destiny, 'binary', function (err, data) {
		if(err) {
			console.log('Unable to find ' + destiny);
			errorCallback(err);
		} else {
			callback(data);
		}
	});
};