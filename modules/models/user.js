//User model definition

module.exports = user;

function user (sequelize, DataTypes) {
	return sequelize.define('User', {
		username: DataTypes.STRING,
		pass: DataTypes.STRING
	});
};