const Sequelize = require('sequelize');
const sequelize = require('../util/db');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: Sequelize.STRING,
    gmail: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

module.exports = User;