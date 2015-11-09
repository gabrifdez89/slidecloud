var fileDtoFactory = require('../../dto/dtoFactories/fileDtoFactory.js');

exports.mapFilesToDtos = function (files) {
	var dtos = [];

	files.forEach(function (file) {
		var dto =  fileDtoFactory.createFileDto(file);
		dtos.push(dto);
	});

	return dtos;
};