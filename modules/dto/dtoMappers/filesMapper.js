var fileDtoFactory = require('../../dto/dtoFactories/fileDtoFactory.js');

exports.mapFilesToDtos = mapFilesToDtos;

function mapFilesToDtos (files) {
	var dtos = [],
		callbackArgument = {dtos: dtos};

	files.forEach(mapFileToDto.bind(callbackArgument));

	return dtos;
};

function mapFileToDto (file) {
	var dto =  fileDtoFactory.createFileDto(file);
	this.dtos.push(dto);
};