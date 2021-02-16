const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// one doc of Menu collection respresents a single menu article
const MenuSchema = new Schema({
    restaurantId: String, // id odgovarajuceg restorana ciji je ovo artikal
    articleType: String, // salata, piće, pizza, pasta, glavno jelo, kuhano jelo,...
    articleName: String,
    articleIngredients: String,
    articlePrice: Number,
    articlePriceOnSale: Number, // kad admin postavi onSale na true, onda mora unijeti i novu cijenu artikla
    articleImage: String, // promijeniti tip
    available: {
        type: Boolean,
        default: true
    }, // kad admin restorana ukljuci switch, true je, ako iskljuci, onda false
    onSale: {
        type: Boolean,
        default: false
    }, // true kad je na akciji artikl
    archived: {
        type: Boolean,
        default: false
    }
});

const Menu = mongoose.model('Menu', MenuSchema);
module.exports = Menu;