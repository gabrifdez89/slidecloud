var models = require('../models/models.js');

exports.createPresentationForFileId = createPresentationForFileId;
exports.savePresentation = savePresentation;
exports.getPresentationByFileId = getPresentationByFileId;
exports.deletePresentation = deletePresentation;
exports.deleteOldPresentations = deleteOldPresentations;

/*.**/
function createPresentationForFileId (fileId, errorCallback, callback) {
	try{
		var presentation = models.Presentation.build({
			FileId: fileId
		});
		callback(presentation);
	}catch(error){
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
function getPresentationByFileId (fileId, errorCallback, callback) {
	console.log('fileId: ' + fileId);
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

/*.**/
function deletePresentation (presentation, errorCallback, callback) {
	presentation.destroy()
	.then(function () {
		callback();
	}).catch(function (error) {
		errorCallback(error);
	});
};

/*.**/
function deleteOldPresentations (errorCallback, callback) {
	models.Presentation.findAll({
		where: {
			createdAt: {
				lt: new Date(new Date() - 24 * 60 * 60 * 1000)
			}
		}
	}).then(function (oldPresentations) {
		var numDeleted = 0;
		oldPresentations.forEach(function (presentation) {
			presentation.destroy();
			numDeleted++;
		});
		callback(numDeleted);
	}).catch(function (error) {
		errorCallback(error);
	});
};