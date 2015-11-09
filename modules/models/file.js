//File model definition

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('File', {
		name: DataTypes.STRING,
		path: DataTypes.STRING,
		baseUrl: DataTypes.STRING
	});
}