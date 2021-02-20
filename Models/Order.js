const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// one doc of Order collection respresents one order
const OrderSchema = new Schema({
    restaurantId: String, // id odgovarajuceg restorana ciji je ovo artikal
    orderArticles: String, // artikli koje je korisnik narucio
    price: Number, // cijena narudzbe
    // adresa na koju treba dostaviti narudzbu, cuvat cu ili kao naziv adrese ili kao par lat, long
    //latitude: Number,
    //longitude: Number,
    streetName: String,
    streetNumber: Number,
    quantity: {
        type: Number,
        default: 1
    },
    paymentMethod: String, // keš, kartica
    deliveryTime: {
        type: Date,
        default: Date.now()
    },
    contactNumber: { // korisnik unosi svoj broj pri potvrdi narudzbe
        type: String,
        default: null
    },
    status: { // false = nije isporucena, true = isporucena
        type: Boolean,
        default: false
    },
    delivererId: {
        type: String,
        default: null
    }
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;