var path = require('path'),
	Sequelize = require('sequelize'),
	sequelize = new Sequelize(null, null, null, {
		dialect: 'sqlite',
		storage: 'slideCloudDb.sqlite'
	}),
	User = sequelize.import(path.join(__dirname, 'user')),
	File = sequelize.import(path.join(__dirname, 'file')),
	Presentation = sequelize.import(path.join(__dirname, 'presentation'));

File.belongsTo(User);
User.hasMany(File);
Presentation.belongsTo(File);

exports.User = User;
exports.File = File;
exports.Presentation = Presentation;

//Initializing DB when it is empty
sequelize.sync().then(onSync);

function onSync () {
	User.count().then(initializeDataBase);
};

function initializeDataBase (count) {
	if(count === 0) {
		populateDataBase();
		scheduleDailyCleanUpOfPresentations();
	}
};

function populateDataBase () {
	User.create({
			username: 'pepe',
			pass: 'pepe',
			email: 'pepe@pepe.com',
			validated: true
		});
		User.create({
			username: 'juan',
			pass: 'juan',
			email: 'juan@juan.com',
			validated: true
		});
};

function scheduleDailyCleanUpOfPresentations () {
	new CronJob('00 00 03 * * *', cleanUpOfPresentations, onCleanUpOfPresentationsFinish, true, 'Europe/Madrid');
};

function cleanUpOfPresentations () {
	presentationsHandler.deleteOldPresentations(onDeleteOldPresentationsError, onDeleteOldPresentationsSucceeded);
};

function onDeleteOldPresentationsError (error) {
	console.log('ERROR DELETING OLD PRESENTATIONS: ' + error);
};

function onDeleteOldPresentationsSucceeded (numDeleted) {
	console.log('NUMBER OF OLD PRESENTATIONS DELETED: ' + numDeleted);
};

function onCleanUpOfPresentationsFinish () {
	console.log('FINISHED CLEANUP OF PRESENTATIONS');
};