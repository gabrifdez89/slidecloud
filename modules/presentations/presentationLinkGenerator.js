var webclientUrl = 'http://localhost:3030/#/presentation';

exports.generateLink = generateLink;

function generateLink (presentation, username) {
	return webclientUrl + '?fileId=' + presentation.FileId + '&username=' + username;
};