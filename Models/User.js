const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
* Everything in Mongoose starts with a Schema.
* Each schema maps to a MongoDB collection and defines
* the shape of the documents within that collection.
* https://mongoosejs.com/docs/guide.html
* */

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
    userType: String  // user types: Kupac, Administrator, Dostavljac, Administrator restorana
});

// https://mongoosejs.com/docs/models.html
// When you call mongoose.model() on a schema, Mongoose compiles a model for you.
// The first argument is the singular name of the collection your model is for.
const User = mongoose.model('User', UserSchema);
module.exports = User;