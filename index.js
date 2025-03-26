const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

const sequelize = require('./util/db')

const models = require('./models/index')
sequelize.models = models

app.use((req, res, next) => {
    models.User.findByPk(1)
      .then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
});

const productAdminRoutes = require('./routes/admin/products')
app.use('/admin', productAdminRoutes)

const productRoutes = require('./routes/products')
app.use(productRoutes)

const shopRoutes = require('./routes/shop')
app.use(shopRoutes)

sequelize
    .sync({force: true})
    .then(() => {
        return models.User.findByPk(1)
    })
    .then(user => {
        if (!user) {
            return models.User.create({ name : 'user', gmail : 'user@local.com'});  
        }
        return user;
    })
    .then((user) => {
        return user.createCart()
    })
    .then((user) => {
        console.log(user)
        app.listen(3002);
    })
    .catch((error) => {
        console.log(error)
    })