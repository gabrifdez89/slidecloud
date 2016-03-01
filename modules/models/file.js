//File model definition

module.exports = file;

function file (sequelize, DataTypes) {
	return sequelize.define('File', {
		name: DataTypes.STRING,
		path: DataTypes.STRING,
		baseUrl: DataTypes.STRING
	});
};