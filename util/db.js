const Sequelize = require('sequelize');

const sequelize = new Sequelize('web-shop', 'root', 'Qwerty', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;