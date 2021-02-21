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
      return; // TODO: zasto ovaj return??
    }

    /* JSON Web Tokens */
    // authentication - implementing a system for registering and logging users in.
    // authorization - The act of granting users the permission to access certain resources on our REST API.
    // https://jwt.io/introduction/
    // https://www.freecodecamp.org/news/securing-node-js-restful-apis-with-json-web-tokens-9f811a92bb52/
    // https://stackoverflow.com/questions/31309759/what-is-secret-key-for-jwt-based-authentication-and-how-to-generate-it
    // In authentication, when the user successfully logs in using their
    // credentials, a JSON Web Token will be returned. Since tokens are
    // credentials, great care must be taken to prevent security issues.
    // A JWT is an encoded string of characters which is safe to send
    // between two computers if they both have HTTPS. The token represents
    // a value that is accessible only by the computer that has access to
    // the secret key with which it was encrypted.
    // practical example of how JWT works:
    //  Let’s say a user wants to sign in to their account. They send a request
    //  with the required credentials such as email and password to the
    //  server. The server checks to see if the credentials are valid.
    //  If they are, the server creates a token using the desired payload
    //  and a secret key. This string of characters that results from the
    //  encryption is called a token. Then the server sends it back to the
    //  client. The client, in turn, saves the token to use it in every
    //  other request the user will send. The practice of adding a token to
    //  the request headers is as way of authorizing the user to access
    //  resources.
    /* The jwt.sign() method takes a payload and the secret key defined in
    config.js as parameters. It creates a unique string of characters
    representing the payload. In our case, the payload is an object
    containing only the id of the user. */
    const token = jwt.sign({ userId: currentUser._id }, tokenKey);

    // The res.cookie() function is used to set the cookie name to value.
    // The value parameter may be a string or object converted to JSON.
    // https://expressjs.com/en/5x/api.html#res.cookie
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
  // todo: let address = mozda jos dodati i naziv i broj ulice
  let latitude = req.body.latitude;
  let longitude = req.body.longitude;
  let userType = 'Kupac';

  usersService.findByUsername(username, (response) => {

    // if username already exists:
    if (response != null) {
      res.render('signup', { error: 'That username is already taken!'});
      return;
    }

    // if username isn't taken, new User is created and added to database
    // and then user is redirected to login page to log in with his
    // newly created account
    usersService.create({
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
      password: password,
      latitude: latitude,
      longitude: longitude,
      userType: userType
    }, (response) => {
      res.redirect(req.baseUrl + '/login'); //The req.baseUrl property is the URL path on which a router instance was mounted.
      console.log(response);
    })
  });

  console.log("Username: " + username + " - " + password + " -- " + userType);
});

module.exports = router;
