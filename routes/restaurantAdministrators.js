const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const NodeGeocoder = require('node-geocoder');

const Restaurant = require('../Models/Restaurant');
const User = require('../Models/User');
const Administrator = require('../Models/Administrator');
const Menu = require('../Models/Menu');
const Deliverer = require('../Models/Deliverer');

const restaurantsService = require('../Services/RestaurantsService');
const usersService = require('../Services/UsersService');

const tokenKey = 'MIHCAgEAMA0GCSqGSIb3DQEBAQUABIGtMIGqAgEAAiEAhzo0TLmplZq8hlpWVQidQNpEd2IkJz9cOknwnz+sRbsCAwEAAQIgZdTm3YBSvF4x6drNeGtsPvixGrgDEI1e';

router.get('/', function(req, res, next) {

    // pronadjem u kolekciji Administrator admina koji se upravo ulogovao
    Administrator.findOne({ user: req.user._id })
        .then(admin => {
            console.log('CURRENT USER (u queriju):' + admin);

            // pronadjem restoran ciji je on admin
            Restaurant.findById(admin.restaurantId)
                .then(restaurant => {
                    // pomocu id-a restorana u kolekciji Menu nadjem sve artikle za taj restoran
                    // zatim renderu proslijedim i restoran i njegov menu
                    console.log('CURRENT RESTAURANT:' + restaurant.name);

                    Menu.find({ restaurantId: restaurant._id })
                        .then(menu => {
                            res.render('administrators/home', { restaurant: restaurant, admin: admin, menu: menu });
                        });
                })
        });
});

// Rendering form for adding new Article to Menu
router.get('/new', function(req, res, next) {
    res.render('administrators/newArticle');
});

// Adding new Article to Menu
router.post('/new', function(req, res, next) {

    let type = req.body.type;
    let name = req.body.name;
    let ingredients = req.body.ingredients;
    let price = req.body.price;
    let image = req.files.image;
    let imageName = image.name;

    image.mv('public/images/' + imageName, function(err) {
        if (err) throw(err);

        // u kolekciji Administrator pronadjem usera koji je trenutno logovan
        Administrator.findOne({ user: req.user._id })
            .then(admin => {

                // pronadjem restoran ciji je on admin
                Restaurant.findById(admin.restaurantId)
                    .then(restaurant => {
                        // sacuvam novi artikl u kolekciju Menu
                        (new Menu({
                            restaurantId: restaurant._id,
                            articleType: type,
                            articleName: name,
                            articleIngredients: ingredients,
                            articlePrice: price,
                            articleImage: imageName
                        })).save()
                            .then(response => {
                                res.redirect(req.baseUrl);
                                console.log('New Menu Article successfully added!');
                            })
                            .catch(error => {
                                res.redirect(req.baseUrl);
                                console.log('New Menu Article is not added!');
                            })
                    })
            });
    });
});

// Editing Restaurant info
router.post('/edit', function(req, res, next) {

    let phone = req.body.phone;
    let deliveryRange = req.body.delivery;
    let workingHours = req.body.workingHours;

    // pronadjem u kolekciji Administrator admina koji je logovan
    Administrator.findOne({ user: req.user._id })
        .then(admin => {

            // pronadjem restoran ciji je on admin i update-am
            // https://mongoosejs.com/docs/api.html#model_Model.findOneAndUpdate
            Restaurant.findByIdAndUpdate(admin.restaurantId, {
                phoneNumber: phone,
                deliveryRange: deliveryRange,
                workingHours: workingHours
            })
                .then(restaurant => {
                    res.redirect(req.baseUrl);
                })
        });
});

// Adding Article on sale price
router.post('/sale/:articleId', function(req, res, next) {

    let price = req.body.articleSalePrice;
    let articleId = req.params.articleId;

    // pronadjem artikal, postavim da je na akciji i postavim cijenu na akciji
    Menu.findByIdAndUpdate(articleId, {
        articlePriceOnSale: price,
        onSale: true
    })
        .then(article => {
            res.redirect(req.baseUrl);
        })
});

// Removing Article from sale
router.get('/end-sale/:articleId', function(req, res, next) {

    // samo postavim u kolekciji dokumenta da je onSale false
    let articleId = req.params.articleId;

    // pronadjem artikal, postavim da vise nije na akciji
    Menu.findByIdAndUpdate(articleId, {
        onSale: false
    })
        .then(article => {
            res.redirect(req.baseUrl);
        })
});

// Deleting (archiving) Article
router.get('/archive/:articleId', function(req, res, next) {

    let articleId = req.params.articleId;

    Menu.findByIdAndUpdate(articleId, {
        archived: true
    })
        .then(article => {
            res.redirect(req.baseUrl);
        })
});

// Rendering page (form) for adding new deliverer to db
router.get('/new-deliverer', function(req, res, next) {
    res.render('administrators/newDeliverer');
});

// Adding new Deliverer
router.post('/new-deliverer', function(req, res, next) {

    let firstName = req.body.name;
    let lastName = req.body.lastName;
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let userType = 'Dostavljac';

    usersService.findByUsername(username, (response) => {

        // if username already exists:
        if (response != null) {
            res.render('admin/newAdmin', {error: 'That username is already taken!'});
            return;
        }

        // if username isn't taken, new User is created and added to database
        usersService.create({
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            password: password,
            userType: userType
        }, (response) => {

            // pronadjem u kolekciji Administrator ovog admina koji dodaje novog dostavljaca
            Administrator.findOne({ user: req.user._id })
                .then(admin => {

                    // pronadjem restoran ciji je on admin
                    Restaurant.findById(admin.restaurantId)
                        .then(restaurant => {

                            // admin restorana dodaje dostavljaca samo za svoj restoran
                            // pa zbog toga u polje restaurantId kolekcije Deliverer spremam id restorana za koji radi ovaj admin
                            (new Deliverer({
                                user: response._id,
                                restaurantId: restaurant._id,
                                numberOfOrders: 0
                            })).save()
                                .then(response => {
                                    res.redirect(req.baseUrl);
                                    console.log('New Deliverer successfully added!');
                                })
                                .catch(error => {
                                    res.redirect(req.baseUrl);
                                    console.log('New Deliverer is not added!');
                                })
                        })
                });
        });
    });
});

router.get('/orders', function(req, res, next) {

    // pronadjem u kolekciji Administrator admina koji se upravo ulogovao
    Administrator.findOne({ user: req.user._id })
        .then(admin => {

            // pronadjem restoran ciji je on admin
            Restaurant.findById(admin.restaurantId)
                .then(restaurant => {
                    // todo: u Order.find smjestiti Deliverer.find
                    /*Order.find({ restaurantId: restaurant._id, delivererId: null })
                        .then(orders => {
                            Deliverer.find({ restaurantId: restaurant._id })
                                .populate('user')
                                .then(deliverers => {
                                    console.log("dostavljaci: " + deliverers);
                                    res.render('administrators/orders', { restaurant: restaurant, orders: orders, deliverers: deliverers });
                                });
                        });*/

                    let orders=['order1','order2','order3','order4','order5'];
                    Deliverer.find({ restaurantId: restaurant._id })
                        .populate('user')
                        .then(deliverers => {
                            console.log("dostavljaci: " + deliverers);
                            res.render('administrators/orders', { restaurant: restaurant, orders: orders, deliverers: deliverers });
                        });
                })
        });
});

// When the restaurant admin assigns the order to the deliverer
router.post('/orders/:orderId', function(req, res, next) {

    let orderId = req.params.orderId;
    let delivererId = req.body.deliverersList;

    Order.findByIdAndUpdate(orderId, { delivererId: delivererId })
        .then(order => {
            // povecam broj narudzbi ovog deliverera za 1
            // https://docs.mongodb.com/manual/reference/operator/update/inc/
            Deliverer.findByIdAndUpdate(delivererId, { $inc: { numberOfOrders: 1 } })
                .then(deliverer => {
                    res.redirect(req.baseUrl + '/orders');
                })
        })
});

router.get('/logout', function(req, res, next) {
    res.clearCookie('token');
    res.redirect('../login');
});

module.exports = router;