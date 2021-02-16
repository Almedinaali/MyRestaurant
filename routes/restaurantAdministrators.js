const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const NodeGeocoder = require('node-geocoder');

const Restaurant = require('../Models/Restaurant');
const User = require('../Models/User');
const Administrator = require('../Models/Administrator');
const Menu = require('../Models/Menu');

const restaurantsService = require('../Services/RestaurantsService');
const usersService = require('../Services/UsersService');

const tokenKey = 'MIHCAgEAMA0GCSqGSIb3DQEBAQUABIGtMIGqAgEAAiEAhzo0TLmplZq8hlpWVQidQNpEd2IkJz9cOknwnz+sRbsCAwEAAQIgZdTm3YBSvF4x6drNeGtsPvixGrgDEI1e';

router.get('/', function(req, res, next) {

    // token smo u index login ruti spremili u cookie
    // sad ga uzimamo (bit ce encripted)
    /*const token = req.cookies['token'];
    var decodedToken = jwt.verify(token, tokenKey);*/

    console.log('CURRENT USER:' + req.user.userId);
    // pronadjem u kolekciji Administrator admina koji se upravo ulogovao
    Administrator.findOne({ user: req.user._id })
        .then(admin => {
            console.log('CURRENT USER (u queriju):' + admin);

            // pronadjem restoran ciji je on admin
            Restaurant.findOne({ name: admin.restaurantName })
                .then(restaurant => {
                    // pomocu id-a restorana u kolekciji Menu nadjem sve artikle za taj restoran
                    // zatim renderu proslijedim i restoran i njegov menu
                    console.log('CURRENT RESTAURANT:' + restaurant.name);

                    /*Menu.find({ restaurantId: restaurant.id })
                        .then(menu => {
                            console.log("MENU: " + menu);
                        });*/
                    res.render('administrators/home', { restaurant: restaurant, admin: admin });

                })
        });
});

// Rendering form for adding new Article to Menu
router.get('/new', function(req, res, next) {
    res.render('administrators/newArticle');
});

// Adding new Article to Menu
router.post('/new', function(req, res, next) {
    // todo: ponovo uzmem naziv restorana za kojeg ovaj admin radi pa kad pokupim podatke iz forme
    //      mogu za odgovarajuci restoran dodati artikl (nadjem i id restorana preko naziva)

    let type = req.body.type;
    let name = req.body.name;
    let ingredients = req.body.ingredients;
    let price = req.body.price;
    //let image = req.body.image;


    Administrator.findOne({ user: req.user._id })
        .then(admin => {
            console.log('CURRENT USER (u queriju):' + admin);

            // pronadjem restoran ciji je on admin
            Restaurant.findOne({ name: admin.restaurantName })
                .then(restaurant => {
                    // pomocu id-a restorana u kolekciji Menu nadjem sve artikle za taj restoran
                    // zatim renderu proslijedim i restoran i njegov menu
                    console.log('CURRENT RESTAURANT:' + restaurant.name);

                    (new Menu()).save()
                        .then(response => { callback(response); })
                        .catch(error => { callback(null); })
                })
        });

    console.log("artikl dodan!");
    res.redirect(req.baseUrl);
});

router.get('/logout', function(req, res, next) {
    res.clearCookie('token');
    res.redirect('../login');
});

module.exports = router;