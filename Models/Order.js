const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// one doc of Order collection respresents one order
const OrderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    restaurantId: {
        type: String,
        default: null // kad se tek kreira korpa bude null, dok customer ne izabere restoran
    },
    orderArticles: [
        {
            articleId: {
                type: Schema.Types.ObjectId,
                ref: 'Menu',
                default: null
            }
        }
    ], // artikli koje je korisnik narucio
    price: {
        type: Number,
        default: 0
    }, // cijena narudzbe
    quantity: {
        type: Number,
        default: 1
    },
    paymentMethod: {
        type: String,
        default: "Keš"
    }, // keš, kartica
    deliveryTime: {
        type: Date,
        default: Date.now()
    },
    contactNumber: { // korisnik unosi svoj broj pri potvrdi narudzbe
        type: String,
        default: null
    },
    status: { // null = kupac bira artikle narudzbe, false = kupac potvrdio narudzbu ali nije jos isporucena, true = isporucena
        type: Boolean,
        default: null
    },
    delivererId: {
        type: String,
        default: null
    },
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;