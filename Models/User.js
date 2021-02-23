const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    username: String,
    email: String,
    password: String,
    latitude: {
        type: Number,
        default: null
    },
    longitude: {
        type: Number,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    userType: String  // user types: Kupac, Administrator, Dostavljac, Administrator restorana
});

const User = mongoose.model('User', UserSchema);
module.exports = User;