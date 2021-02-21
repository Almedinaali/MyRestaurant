var express = require('express');
var router = express.Router();

const Restaurant = require('../Models/Restaurant');
const User = require('../Models/User');
const Administrator = require('../Models/Administrator');
const Menu = require('../Models/Menu');
const Deliverer = require('../Models/Deliverer');
const Order = require('../Models/Order');

// Rendering Home page for customers
router.get('/', function(req, res, next) {

    User.findOne({ _id: req.user._id })
        .then(customer => {

           Restaurant.find()
               .then(restaurants => {
                   // prilikom logovanja korisnika kreira se i korpa za njega
                   // ali ako je korpa vec kreirana i narudzba nije gotova, ne treba kreirati novu
                   Order.findOne({ user: customer._id, status: null })
                       .populate('user')
                       .then(order => {

                           if (order != null) {
                               console.log("korpa postoji: " + order);
                               // ako je korpa kreirana ali narudzba nije gotova
                               res.render('customers/home', { customer: customer, restaurants: restaurants });
                               return;
                           }

                           // korisnik tek logovan, kreira se korpa
                           (new Order({
                               user: customer
                           })).save()
                               .then(order => {
                                   // .ejs-u proslijedim sve restorane i trenutnog kupca
                                   // u njemu cu odrediti koje restorane treba prikazati kupcu
                                   console.log("korpa tek kreirana: " + order);
                                   res.render('customers/home', { customer: customer, restaurants: restaurants });
                               })
                               .catch(err => {
                                   throw err;
                               });
                       })
                       .catch(err => {
                           throw err;
                       })
               });
        });
});

// When customers clicks on a restaurant
router.get('/restaurant/:restaurantId', function(req, res, next) {

    let restaurantId = req.params.restaurantId;

    User.findOne({ _id: req.user._id })
        .then(customer => {

            Restaurant.findById(restaurantId)
                .then(restaurant => {

                    Menu.find({ restaurantId: restaurant._id })
                        .then(menu => {
                            Order.findOneAndUpdate({ user: customer._id, status: null }, { restaurantId: restaurant._id })
                                .then(order => {
                                    res.render('customers/restaurant', { customer: customer, restaurant: restaurant, menu: menu });
                                });
                        })
                });
        });
});

// When customers chooses an article
router.get('/article/:articleId', function(req, res, next) {

    let articleId = req.params.articleId;

    // treba nam samo narudzba koja jos nije potvrdjena
    Order.findOne({ user: req.user.id, status: null })
        .then(order => {

        });

    res.redirect(req.baseUrl);
});

router.get('/ordertest', function(req, res, next) {

    Order.find()
        .then(orders => {
            console.log("SVE NARUDZBE: " + orders);
            res.redirect('../login');
        })

});

router.get('/logout', function(req, res, next) {
    res.clearCookie('token');
    res.redirect('../login');
});

module.exports = router;
