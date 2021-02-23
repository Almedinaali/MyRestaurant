var express = require('express');
var router = express.Router();
const nodemailer = require("nodemailer");

const Restaurant = require('../Models/Restaurant');
const User = require('../Models/User');
const Administrator = require('../Models/Administrator');
const Menu = require('../Models/Menu');
const Deliverer = require('../Models/Deliverer');
const Order = require('../Models/Order');

var transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: 'myrestaurant_app@outlook.com',
        pass: 'kdh35a11'
    }
});

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
                                    // ako se u korpi vec nalaze artikli iz jednog restorana
                                    // a korisnik udje u drugi restoran, svi artikli iz korpe se brisu
                                    if (restaurantId != order.restaurantId) {

                                        Order.update({ user: customer._id, status: null },
                                            { "$set": { "orderArticles": [], "price": 0 } })
                                            .then(newOrder => {
                                                res.render('customers/restaurant', { customer: customer, restaurant: restaurant, menu: menu });
                                            });
                                    } else {
                                        res.render('customers/restaurant', { customer: customer, restaurant: restaurant, menu: menu });
                                    }
                                });
                        })
                });
        });
});

// When customers chooses an article
router.get('/article/:articleId', function(req, res, next) {

    let articleId = req.params.articleId;

    Menu.findById(articleId)
        .then(article => {
            // treba nam samo narudzba koja jos nije potvrdjena
            Order.findOne({ user: req.user.id, status: null })
                .populate()
                .then(order => {
                    let articleIndex = order.orderArticles.findIndex(a => a.articleId == articleId);

                    if (articleIndex > -1) {
                        // ako je artikl vec u korpi, povecamo mu quantity
                        let orderArticle = order.orderArticles[articleIndex];
                        orderArticle.quantity += 1;
                        console.log("ARTIKAL: " + orderArticle);
                        order.orderArticles[articleIndex] = orderArticle;
                    }
                    else {
                        // ako artikl nije u korpi, dodajemo ga
                        order.orderArticles.push({ articleId: article, quantity: 1 });
                    }

                    // Increase price
                    if (article.onSale) {
                        order.price += article.articlePriceOnSale;
                    } else {
                        order.price += article.articlePrice;
                    }

                    order.save()
                        .then(newOrder => {
                            console.log("ARTIKL SPREMLJEN: " + newOrder);
                            res.redirect(req.baseUrl + "/restaurant/" + newOrder.restaurantId);
                        });
            })
        });
});

// When Customer clicks on cart button
router.get('/order-cart', function(req, res, next) {

    Order.findOne({ user: req.user._id, status: null })
        .populate('orderArticles.articleId')
        .then(order => {

            Restaurant.findById(order.restaurantId)
                .then(restaurant => {
                    res.render('customers/cart', { restaurant: restaurant, order: order });
                })
        })
});

// When customers wants to remove an article from order
router.get('/article-remove/:articleId', function(req, res, next) {

    let articleId = req.params.articleId;

    Menu.findById(articleId)
        .then(article => {
            // treba nam samo narudzba koja jos nije potvrdjena
            Order.findOne({ user: req.user.id, status: null })
                .populate()
                .then(order => {
                    let articleIndex = order.orderArticles.findIndex(a => a.articleId == articleId);
                    console.log("ARTICLE INDEX: " + articleIndex);

                    let orderArticle = order.orderArticles[articleIndex];

                    if (orderArticle.quantity > 1) {
                        orderArticle.quantity -= 1;
                        order.orderArticles[articleIndex] = orderArticle;
                    } else {
                        // ako je samo 1 takav artikl u korpi, skroz ga uklonimo iz korpe
                        order.orderArticles.pull({ articleId: article });
                    }

                    // Decrease price
                    if (article.onSale) {
                        order.price -= article.articlePriceOnSale;
                    } else {
                        order.price -= article.articlePrice;
                    }

                    order.save()
                        .then(newOrder => {
                            console.log("ARTIKL SPREMLJEN: " + newOrder);
                            res.redirect(req.baseUrl + "/order-cart");
                        });
                })
        });
});

// When customers wants to confirm order
router.get('/confirm-order', function(req, res, next) {

    // treba nam samo narudzba koja jos nije potvrdjena
    Order.findOneAndUpdate({ user: req.user.id, status: null }, { status: false })
        .populate('user')
        .populate('orderArticles.articleId')
        .then(order => {

            let email = order.user.email;

            // sending confirmation email to customer
            var mailOptions = {
                from: 'myrestaurant_app@outlook.com',
                to: email,
                subject: 'Order | MyRestaurantApp',
                text: 'Narudžba je uspješno spašena!'
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            res.redirect(req.baseUrl);
        })
});

// List of all previous orders of the customer
router.get('/all-orders', function(req, res, next) {

    User.findById(req.user._id)
        .then(customer => {
            Order.find({ user: customer._id, status: true })
                .populate('user')
                .populate('orderArticles.articleId')
                .then(orders => {
                    res.render('customers/allOrders', { customer: customer, orders: orders });
                })
        })
});

router.get('/logout', function(req, res, next) {
    res.clearCookie('token');
    res.redirect('../login');
});

module.exports = router;
