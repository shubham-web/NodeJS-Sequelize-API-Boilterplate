const Sequelize = require("sequelize");
const sequelize = require("./connection");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models/tables
db.users = require("./User");

// Relations
/* db.users.hasMany(db.video, {
	onDelete: "cascade",
});
db.video.belongsTo(db.users); */

db.sequelize.sync({ alter: true });

module.exports = db;
