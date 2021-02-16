const Administrator = require('../Models/Administrator');
const mongoose = require('mongoose');

function create(admin, callback) {
    //*** response object holds administrator cols from database of created administrator
    (new Administrator(admin)).save()
        .then(response => { callback(response); })
        .catch(error => { callback(null); })
}

// vjerovatno ce trebati implementirati fju getByRestaurantName koja vraca listu svih admina nekog restorana

module.exports = {
    create
};