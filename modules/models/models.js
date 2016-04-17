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
	User.count().then(populateDataBase);
};

function populateDataBase (count) {
	if(count === 0) {
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
	}
};