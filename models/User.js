const Sequelize = require("sequelize");
const connection = require("./connection");

const modelDefinition = {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    usercontent: {
        type: Sequelize.TEXT,
    },
    resetPasswordToken: {
        type: Sequelize.STRING,
    },
    privileges: {
        type: Sequelize.TEXT,
        get: function (value) {
            return JSON.parse(this.getDataValue(value));
        },
        set: function (value) {
            this.setDataValue("privileges", JSON.stringify(value));
        },
        allowNull: false,
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
};

// Compare passwords
const comparePasswords = (password, dbPassword, callback) => {
    return callback(null, API.comparePassword(dbPassword, password));
};

// Hash the password
const hashPassword = (user) => {
    if (user.changed("password")) {
        user.password = API.hashpassword(user.password);
    }
    return;
};

const modelOptions = {
    hooks: {
        beforeSave: hashPassword,
    },
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
};

const User = connection.define("User", modelDefinition, modelOptions);
User.prototype.comparePasswords = comparePasswords;
module.exports = User;
