exports.createFileDto = function (file) {
	var dto = {
		'name': file.name,
		'url': file.baseUrl + file.id
	};

	return dto;
};