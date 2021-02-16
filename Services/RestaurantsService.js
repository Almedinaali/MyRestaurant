const Restaurant = require('../Models/Restaurant');
const mongoose = require('mongoose');
const helper = require('../helper');

function create(restaurant, callback) {
    (new Restaurant(restaurant)).save()
        .then(response => { callback(response); })
        .catch(error => { callback(null); })
}


module.exports = {
    create
};

