var express = require('express');
var router = express.Router();

const Restaurant = require('../Models/Restaurant');
const User = require('../Models/User');
const Administrator = require('../Models/Administrator');
const Menu = require('../Models/Menu');
const Deliverer = require('../Models/Deliverer');
const Order = require('../Models/Deliverer');

// Rendering Home page for customers
router.get('/', function(req, res, next) {
    res.render('customers/home');
});

router.get('/logout', function(req, res, next) {
    res.clearCookie('token');
    res.redirect('../login');
});

module.exports = router;
