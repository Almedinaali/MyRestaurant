const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RestaurantSchema = new Schema({
    name: String,
    latitude: Number,
    longitude: Number,
    city: String,
    streetName: String,
    streetNumber: Number, // dodano
    stars: Number,
    restaurantType: String,
    archived: Boolean, // dodano
    deliveryRange: {
        type: Number, // u kilometrima opseg dostave
        default: null    // tamo gdje je dostava null, dostavljaju u citavom gradu
    },
    workingHours: {
        type: String,
        default: null
    },
    phoneNumber: {
        type: String,
        default: null
    }
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
module.exports = Restaurant;