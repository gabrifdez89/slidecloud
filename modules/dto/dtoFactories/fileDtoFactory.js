exports.createFileDto = createFileDto;

function createFileDto (file) {
	return {
		'name': file.name,
		'url': file.baseUrl + file.id
	};
};