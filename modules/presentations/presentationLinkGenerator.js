var webclientUrl = 'http://slidecloud.herokuapp.com/#/presentation';

exports.generateLink = generateLink;

function generateLink (presentation, username) {
	return webclientUrl + '?fileId=' + presentation.FileId + '&username=' + username;
};