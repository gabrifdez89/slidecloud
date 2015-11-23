var path = require('path');

var Sequelize = require('sequelize');

var sequelize = new Sequelize(null, null, null, {
	dialect: 'sqlite',
	storage: 'slideCloudDb.sqlite'
});

var User = sequelize.import(path.join(__dirname, 'user'));
var File = sequelize.import(path.join(__dirname, 'file'));

File.belongsTo(User);
User.hasMany(File);

exports.User = User;
exports.File = File;

//Initializing DB when it is empty
sequelize.sync().then(function () {
	User.count().then(function (count) {
		if(count === 0) {
			User.create({
				username: 'pepe',
				pass: '1234'
			});
		}
	});
});