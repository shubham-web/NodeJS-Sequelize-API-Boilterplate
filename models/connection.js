const Sequelize = require("sequelize");
const config = require("../config/config");
let db = config.db;
const connection = new Sequelize(db.database, db.username, db.password, {
	host: db.host,
	dialect: "mysql",
	logging: false,
	dialectOptions: {
		charset: "utf8mb4",
	},
	timezone: "+05:30",
});
connection
	.authenticate()
	.then(() => {
		console.log("Connection has been established successfully.");
	})
	.catch((err) => {
		console.error("Unable to connect to the database:" + err);
	});
module.exports = connection;
