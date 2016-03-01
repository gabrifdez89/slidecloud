var path = require('path'),
	Sequelize = require('sequelize'),
	sequelize = new Sequelize(null, null, null, {
		dialect: 'sqlite',
		storage: 'slideCloudDb.sqlite'
	}),
	User = sequelize.import(path.join(__dirname, 'user')),
	File = sequelize.import(path.join(__dirname, 'file'));

File.belongsTo(User);
User.hasMany(File);

exports.User = User;
exports.File = File;

//Initializing DB when it is empty
sequelize.sync().then(onSync);

function onSync () {
	User.count().then(populateDataBase);
};

function populateDataBase (count) {
	if(count === 0) {
		User.create({
			username: 'pepe',
			pass: '1234'
		});
		User.create({
			username: 'juan',
			pass: '5678'
		});
	}
};