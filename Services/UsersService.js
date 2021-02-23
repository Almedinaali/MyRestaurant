const User = require('../Models/User');
const mongoose = require('mongoose');
const helper = require('../helper');

function create(user, callback) {
    // hashiram password koji je proslijedjen iz index.js: usersService.create(...)
    user.password = helper.passwordHashing(user.password);

    (new User(user)).save()
        .then(response => { callback(response); })
        .catch(error => { callback(null); })
}

function findByUsername(username, callback) {

    User.findOne({ username: username }, function (err, docs) {
        if (err) throw err;

        if (docs != null) {
            let user = docs._doc;
            user._id = user._id.toHexString();
            callback(user);
        } else {
            callback(null);
        }
    });
}

function verifyUser(username, password, callback) {
    findByUsername(username, function (user) {
        // if next if is entered, it means that this username exists
        if (user !== null) {
            // check if password is correct
            if (helper.verifyPassword(password, user.password)) {
                // posaljemo usera (user objekat ima sve informacije o useru) u index.js
                // u tijelo callback fje proslijedjene u pozivu verifyUser() fje
                callback(user);
            } else {
                // if password is not correct
                callback(null);
            }
        } else {
            // if username doesn't exist
            callback(null);
        }
    });
}

module.exports = {
    create,
    findByUsername,
    verifyUser
};
