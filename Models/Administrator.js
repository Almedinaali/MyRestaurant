const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// https://medium.com/@mendes.develop/joining-tables-in-mongodb-with-mongoose-489d72c84b60
// https://mongoosejs.com/docs/populate.html
// Joining this collection with User collection by user property
// Only users with userType: Administrator restorana will be joined with this collection
// where information about the restaurant where they work is stored
const AdministratorSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    restaurantId: String // id restorana za koji admin radi
});

const Administrator = mongoose.model('Administrator', AdministratorSchema);
module.exports = Administrator;