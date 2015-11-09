var fs = require('fs'),
	originPath = './uploads/',
	destinyPath = './files/';

exports.moveFilesToTree = function (files, fileNames, user, callback, errorCallback) {
	var fileNumber = 0,
		error;
	files.forEach(function (file) {
		var fileName = fileNames[fileNumber];
		var origin = originPath + file.filename;
		var destiny = destinyPath + user + '/' + fileName;
		fs.rename(origin, destiny, function (err) {
			if(err) {
				console.log('Error moving file ' + fileNames[fileNumber] + ' from ' + origin + ' to ' + destiny);
				error = err;
			}
		});
		fileNumber++;
	});
	if (error) {
		errorCallback(error);	
	}else {
		callback();
	}
};