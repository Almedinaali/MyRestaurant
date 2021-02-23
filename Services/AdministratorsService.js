const Administrator = require('../Models/Administrator');
const mongoose = require('mongoose');

function create(admin, callback) {
    (new Administrator(admin)).save()
        .then(response => { callback(response); })
        .catch(error => { callback(null); })
}

module.exports = {
    create
};