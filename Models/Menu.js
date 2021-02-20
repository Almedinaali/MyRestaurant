const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// one doc of Menu collection respresents a single menu article
const MenuSchema = new Schema({
    restaurantId: String, // id odgovarajuceg restorana ciji je ovo artikal
    articleType: String, // salata, piće, pizza, pasta, glavno jelo, kuhano jelo,...
    articleName: String,
    articleIngredients: String,
    articlePrice: Number,
    articlePriceOnSale: {
        type: Number,
        default: null
    }, // kad admin postavi onSale na true, onda mora unijeti i novu cijenu artikla
    articleImage: {
        type: String, // cuvam samo naziv slike u bazi, a u folderu images po nazivu nadjem sliku
        default: null
    },
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