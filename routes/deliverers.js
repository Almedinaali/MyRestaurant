const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const NodeGeocoder = require('node-geocoder');

const Restaurant = require('../Models/Restaurant');
const User = require('../Models/User');
const Administrator = require('../Models/Administrator');
const Menu = require('../Models/Menu');
const Deliverer = require('../Models/Deliverer');
const Order = require('../Models/Deliverer');

const restaurantsService = require('../Services/RestaurantsService');
const usersService = require('../Services/UsersService');

// Display of orders not yet delivered
router.get('/', function(req, res, next) {

    // pronadjem u kolekciji Deliverer dostavljaca koji se upravo logovao
    Deliverer.findOne({ user: req.user._id })
        .then(deliverer => {
            console.log('CURRENT USER:' + deliverer);

            // pronadjem restoran ciji je on admin
            Restaurant.findById(deliverer.restaurantId)
                .then(restaurant => {
                    console.log('CURRENT RESTAURANT:' + restaurant.name);

                    let orders = [
                        {
                            status: false,
                            orderArticles: "Margherita, Pileća salata", // artikli koje je korisnik narucio
                            price: 7.5,
                            streetName: "Ulica",
                            streetNumber: 6,
                            paymentMethod: "Po preuzimanju"
                        },
                        {
                            status: false
                        },
                        {
                            status: false
                        },
                        {
                            status: false
                        },
                        {
                            status: false
                        }
                    ];
                    res.render('deliverers/home', { restaurant: restaurant, orders: orders });
                    /*Order.find({ restaurantId: restaurant._id, status: false })
                        .then(orders => {
                            res.render('deliverers/home', { restaurant: restaurant, orders: orders });
                        });*/
                })
        });
});

// Display of orders that have already been delivered
router.get('/delivered', function(req, res, next) {

    // pronadjem u kolekciji Deliverer dostavljaca koji se upravo logovao
    Deliverer.findOne({ user: req.user._id })
        .then(deliverer => {
            console.log('CURRENT USER:' + deliverer);

            // pronadjem restoran ciji je on admin
            Restaurant.findById(deliverer.restaurantId)
                .then(restaurant => {
                    console.log('CURRENT RESTAURANT:' + restaurant.name);

                    let orders = [
                        {
                            status: true
                        },
                        {
                            status: false
                        },
                        {
                            status: true
                        },
                        {
                            status: true
                        },
                        {
                            status: false
                        }
                    ];
                    res.render('deliverers/home', { restaurant: restaurant, orders: orders });
                    /*Order.find({ restaurantId: restaurant._id, status: true })
                        .then(orders => {
                            res.render('deliverers/home', { restaurant: restaurant, orders: orders });
                        });*/
                })
        });
});

// Mark order as delivered, ie. setting order status as delivered
router.get('/delivered/:orderId', function(req, res, next) {

    let orderId = req.params.orderId;

    Order.findByIdAndUpdate(orderId, {status: true})
        .then(order => {
            // pronadjem ovog dostavljaca i smanjim mu broj narudzbi za 1
            Deliverer.findOneAndUpdate({ user: req.user._id },
                { $inc: { numberOfOrders: -1 } })
                .then(deliverer => {
                    res.redirect(req.baseUrl);
                })
        });
});


router.get('/logout', function(req, res, next) {
    res.clearCookie('token');
    res.redirect('../login');
});

module.exports = router;