var webclientUrl = 'http://localhost:3030/#/presentation?fileId='

exports.generateLink = generateLink;

function generateLink (presentation) {
	return webclientUrl + presentation.FileId;
};