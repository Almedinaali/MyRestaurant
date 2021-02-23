const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdministratorSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    restaurantId: String // id restorana za koji admin radi
});

const Administrator = mongoose.model('Administrator', AdministratorSchema);
module.exports = Administrator;