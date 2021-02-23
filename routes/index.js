const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const NodeGeocoder = require('node-geocoder');

const usersService = require('../Services/UsersService');

const tokenKey = 'MIHCAgEAMA0GCSqGSIb3DQEBAQUABIGtMIGqAgEAAiEAhzo0TLmplZq8hlpWVQidQNpEd2IkJz9cOknwnz+sRbsCAwEAAQIgZdTm3YBSvF4x6drNeGtsPvixGrgDEI1e';

// Specifying Geocoding Provider in an Options Object parameter
// Provider is OpenStreetMap
const options = {
  provider: 'openstreetmap'
};

// Passing options to an instance of nodeGeocoder
const geoCoder = NodeGeocoder(options);


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { error: ""});
});

router.post('/login', function(req, res, next) {

  let username = req.body.username;
  let password = req.body.password;

  usersService.verifyUser(username, password, function (currentUser) {
    // if username doesn't exist or username exists but password isn't correct
    if (currentUser == null) {
      res.render('login', { error: 'Enter valid username and password!' });
      return;
    }

    const token = jwt.sign({ userId: currentUser._id }, tokenKey);

    res.cookie('token', token);

    if (currentUser.userType === 'Kupac') {
      res.redirect('../customers');
    } else if (currentUser.userType === 'Administrator') {
      res.redirect('../administrator');
    } else if (currentUser.userType === 'Administrator restorana') {
      res.redirect('../restaurant-administrators');
    } else if (currentUser.userType === 'Dostavljac') {
      res.redirect('../deliverers');
    }
  })
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { error: ""});
});

router.post('/signup', function(req, res, next) {

  let firstName = req.body.first_name;
  let lastName = req.body.last_name;
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let latitude = req.body.latitude;
  let longitude = req.body.longitude;
  let userType = 'Kupac';

  let streetName;
  let streetNumber;

  usersService.findByUsername(username, (response) => {

    // if username already exists:
    if (response != null) {
      res.render('signup', { error: 'That username is already taken!'});
      return;
    }

    // if username isn't taken, new User is created and added to database
    // and then user is redirected to login page to log in with his
    // newly created account
    geoCoder.reverse({ lat:latitude, lon:longitude })
        .then((result) => {

          usersService.create({
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            password: password,
            latitude: latitude,
            longitude: longitude,
            address: result[0].formattedAddress,
            userType: userType
          }, (response) => {
            res.redirect(req.baseUrl + '/login');
            console.log(response);
          })
        })

  });

  console.log("Username: " + username + " - " + password + " -- " + userType);
});

module.exports = router;
