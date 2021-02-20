const express = require('express');
const router = express.Router();
const NodeGeocoder = require('node-geocoder');

const Restaurant = require('../Models/Restaurant');
const User = require('../Models/User');
const Administrator = require('../Models/Administrator');
const restaurantsService = require('../Services/RestaurantsService');
const usersService = require('../Services/UsersService');
const administratorsService = require('../Services/AdministratorsService');

// Specifying Geocoding Provider in an Options Object parameter
// Provider is OpenStreetMap
const options = {
    provider: 'openstreetmap'
};

// Passing options to an instance of nodeGeocoder
const geoCoder = NodeGeocoder(options);

/* Homepage for Admin:
*  A list of all restaurants (and informations about restaurants) from database */
router.get('/', function(req, res, next) {

    // vraca kolekciju svih restorana u bazi koji nisu arhivirani
    Restaurant.find({ archived: false })
        .then(restaurants => {
            //console.log(restaurants);
            Administrator.find({})
                .populate('user')
                .then(admins => {
                    console.log(admins);
                    res.render('admin/restaurantsList', { restaurants: restaurants, admins: admins });
                });
        });
});

// Adding new restaurant to app
router.get('/new', function(req, res, next) {
    let restoran = {};
    // Create new empty Restaurant document and render newRestaurant.ejs with form to fill Restaurant fields
    //res.render('admin/newRestaurant', { restaurant: new Restaurant() });
    res.render('admin/newRestaurant', { restaurant: restoran });
});

/* Admin fills form with restaurant informations and saves it to database.
*  Collecting data from form and creating new Restaurant document */
router.post('/new', function(req, res, next) {

    // Admin enters information only about the address and city of the restaurant
    // Using OpenStreetMap for geocoding, I find longitude and latitude of entered address
    // And save it to database doc

    let name = req.body.name;
    let city = req.body.city;
    let streetName = req.body.streetName;
    let streetNumber = req.body.streetNumber;
    let stars = req.body.stars;
    let restaurantType = req.body.restaurantType;
    let archived = false;

    let latitude;
    let longitude;
    let street = streetNumber + ', ' + streetName;

    // Invoking the geocode() method of geoCoder object,
    // supplying it with an address of restaurant
    // (streetNumber, streetName and city that admin entered)
    // ***The invocation of the geocode() method will return a Promise so
    // we will use .then and .catch to handle the result or the error.
    geoCoder.geocode({
        city: city,
        street: street
    })
        .then((response) => {
            //console.log(res);

            latitude = response[0].latitude;
            longitude = response[0].longitude;
            console.log("LATITUDA: " + latitude + ", LONGITUDA: " + longitude);
            restaurantsService.create({
                name: name,
                latitude: latitude,
                longitude: longitude,
                city: city,
                streetName: streetName,
                streetNumber: streetNumber,
                stars: stars,
                restaurantType: restaurantType,
                archived: archived
            }, (obj) => {
                res.redirect(req.baseUrl); //The req.baseUrl property is the URL path on which a router instance was mounted.
                console.log("LATITUDA (u kreiranju restorana)" + latitude);
            });
        })
        .catch((err) => {
            console.log(err);
        });


    /*restaurantsService.create({
        name: name,
        latitude: latitude,
        longitude: longitude,
        city: city,
        streetName: streetName,
        streetNumber: streetNumber,
        stars: stars,
        restaurantType: restaurantType,
        archived: archived
    }, (response) => {
        res.redirect(req.baseUrl); //The req.baseUrl property is the URL path on which a router instance was mounted.
        console.log("LATITUDA (u kreiranju restorana)" + latitude);
    });*/
});

// Rendering page (form) for adding new restaurant administrator to db
router.get('/new-admin', function(req, res, next) {

    Restaurant.find()
        .then(restaurants => {
            res.render('admin/newAdmin', { restaurants: restaurants });
        });
});

// adding new restaurant administrator to db
router.post('/new-admin', function(req, res, next) {

    // https://mongoosejs.com/docs/populate.html
    let firstName = req.body.first_name;
    let lastName = req.body.last_name;
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let restaurantId = req.body.restaurantId;
    // todo: let address = provjeriti jos kako cu za adresu uraditi, klik na mapu ili unos latituda, longituda
    let userType = 'Administrator restorana';

    usersService.findByUsername(username, (response) => {

        // if username already exists:
        if (response != null) {
            res.redirect(req.baseUrl);
            console.log("Username is already taken!");
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
            // if adding to db is successful, new Administrator with ref to this User
            // (and restaurant name) is saved to collection Administrator
            administratorsService.create({
                user: response._id,
                restaurantId: restaurantId
            }, (adminRes) => {
                res.redirect(req.baseUrl);
                console.log(adminRes);
            });
        });
    });
});

// Deleting restaurant administrator from db
router.delete('/:adminId', async function (req, res) {

    // koristenjem callback fje
    await Administrator.findById(req.params.adminId, async function (err, admin) {
        if (err) {
            res.redirect('/administrator');
            console.log(err);
            return;
        }

        let userId = admin.user._id;
        await Administrator.findByIdAndDelete(req.params.adminId);
        await User.findByIdAndDelete(userId);
    });

    // trebam napraviti fju u usersService "findByAdminIdAndDelete(adminId)"
    res.redirect('/administrator');
});

// Render page for editing (updating) a restaurant
router.get('/edit/:id', async function(req, res, next) {

    console.log("ID restorana: " + req.params.id);
    var restaurant = await Restaurant.findById(req.params.id);
    console.log("RESTORAN: " + restaurant.name);
    res.render('admin/editRestaurant', { restaurant: restaurant });
});

// Updating restaurant in collection
router.put('/:id', async function(req, res, next) {
    req.restaurant = await Restaurant.findById(req.params.id);
    console.log('RESTORAN PUT ' + req.restaurant.name);
    next();
}, async function (req, res) {
        let restaurant = req.restaurant;
        restaurant.name = req.body.name;
        restaurant.city = req.body.city;
        restaurant.streetName = req.body.streetName;
        restaurant.streetNumber = req.body.streetNumber;
        restaurant.stars = req.body.stars;
        restaurant.restaurantType = req.body.restaurantType;
        restaurant.archived = false;

        let latitude;
        let longitude;
        let street = restaurant.streetNumber + ', ' + restaurant.streetName;

        geoCoder.geocode({
            city: restaurant.city,
            street: street
        })
            .then((res) => {
                //console.log(res);

                latitude = res[0].latitude;
                longitude = res[0].longitude;
            })
            .catch((err) => {
                console.log(err);
            });

        restaurant.latitude = latitude;
        restaurant.longitude = longitude;

        try {
            restaurant = await restaurant.save();
            res.redirect('/administrator');
        } catch (e) {
            console.log(e);
            res.redirect('/administrator');
        }
});

// Archiving a restaurant:
// restaurant field archived setting to true so it wont be shown in restaurant list on
// administrator home page
// mora ova ruta biti na kraju da neka druga post ruta ne bi upala u ovu
router.post('/:id', async function (req, res) {
    let restaurant = await Restaurant.findById(req.params.id);
    restaurant.archived = true;

    try {
        restaurant.save();
        res.redirect('/administrator');
    } catch (e) {
        console.log(e);
        res.redirect('/administrator');
    }
});

// A list of all archived restaurants
router.get('/archived', function(req, res, next) {

    // vraca kolekciju svih arhiviranih restorana u bazi
    Restaurant.find({ archived: true })
        .then(restaurants => {
            console.log(restaurants);
            res.render('admin/archivedList', { restaurants: restaurants });
        });
});

// Unarchive a particular restaurant
router.post('/archived/:id', async function (req, res) {
    let restaurant = await Restaurant.findById(req.params.id);
    restaurant.archived = false;

    try {
        restaurant.save();
        res.redirect('/administrator/archived');
    } catch (e) {
        console.log(e);
        res.redirect('/administrator/archived');
    }
});

router.get('/logout', function(req, res, next) {
    res.clearCookie('token');
    res.redirect('../login');
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});

module.exports = router;