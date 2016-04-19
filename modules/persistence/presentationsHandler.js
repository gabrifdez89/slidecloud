var models = require('../models/models.js');

exports.createPresentationForFileId = createPresentationForFileId;
exports.savePresentation = savePresentation;
exports.checkIfThereIsAPresentationForFileId = checkIfThereIsAPresentationForFileId;

/*.**/
function createPresentationForFileId (fileId, errorCallback, callback) {
	try{
		var presentation = models.Presentation.build({
			FileId: fileId
		});
		callback(presentation);
	}catch(error){
		console.log('Error creating the presentation');
		errorCallback(error);
	}
};

/*.**/
function savePresentation (presentation, errorCallback, callback) {
	presentation.save({
		fields: ['FileId']
	}).then(function (savedPresentation) {
		callback(savedPresentation);
	}).catch(function (error) {
		errorCallback(error);
	});
};

/*.**/
function checkIfThereIsAPresentationForFileId (fileId, errorCallback, callback) {
	models.Presentation.findAll({
		where: {
			fileId: fileId
		}
	}).then(function (presentations) {
		callback(presentations);
	}).catch(function (error) {
		errorCallback(error);
	});
};