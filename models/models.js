var path = require('path');

var Sequelize = require('sequelize');

var sequelize = new Sequelize(null, null, null, {
	dialect: 'sqlite',
	storage: 'quiz.sqlite'
});

var User = sequelize.import(path.join(__dirname, 'user'));
var File = sequelize.import(path.join(__dirname, 'file'));

File.belongsTo(User);
User.hasMany(File);

exports.User = User;
exports.File = File;

sequelize.sync().then(function () {
	User.count().then(function (count) {
		if(count === 0) {
			User.create({
				username: 'pepe',
				pass: '1234'
			}).then(function () {
				console.log('Users table initialized');
			});

			File.create({
				name: 'mySlides.pdf',
				path: 'pepe/mySlides.pdf',
				UserId: 1
			}).then(function () {
				console.log('Files table initialized');
			});

			File.create({
				name: 'tfg.pdf',
				path: 'pepe/tfg.pdf',
				UserId: 1
			}).then(function () {
				console.log('Files table initialized with second element');
			});
		}
	});
});