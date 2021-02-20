const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DelivererSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    restaurantId: String,
    numberOfOrders: Number // number of currently active orders for this deliverer
});

const Deliverer = mongoose.model('Deliverer', DelivererSchema);
module.exports = Deliverer;