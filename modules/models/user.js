//User model definition

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('User', {
		username: DataTypes.STRING,
		pass: DataTypes.STRING
	});
}