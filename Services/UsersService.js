const User = require('../Models/User');
const mongoose = require('mongoose');
const helper = require('../helper');

function create(user, callback) {
    // hashiram password koji je proslijedjen iz index.js: usersService.create(...)
    user.password = helper.passwordHashing(user.password);

    /** kreiram (ubacujem u bazu) novog korisnika **/
    // https://javascript.info/promise-error-handling
    // https://docs.mongodb.com/drivers/node/fundamentals/promises
    // https://mongoosejs.com/docs/queries.html
    // https://mongoosejs.com/docs/promises.html
    // https://kb.objectrocket.com/mongo-db/how-to-use-mongoose-save-1419
    // https://www.rithmschool.com/courses/intermediate-node-express/mongoose-crud
    //*** .save() function is used to save the document to the database.
    // Using this function, new documents can be added to the database.
    // The save() method is designed to insert documents by calling
    // the instance of that document, meaning the model that has been created.
    // In Mongoose 5, async operations like .save() and .find().exec() return
    // a promise unless you pass a callback.
    //*** .then(): Javascript’s convention to chain events,
    // preventing the program from running ahead without the data it needed
    //*** .catch(): Try...catch will work with async/await and not with promise...then.
    // promise...then has special block called catch()
    // Normally, .catch() doesn’t trigger at all. But if any of the promises
    // above rejects (a network problem or invalid json or whatever),
    // then it would catch it.
    //  We may have as many .then handlers as we want, and then use a single
    //  .catch at the end to handle errors in all of them.
    //*** response object holds user cols from database of created user (password is hashed)
    (new User(user)).save()
        .then(response => { callback(response); })
        .catch(error => { callback(null); })
}

function findByUsername(username, callback) {
    /* Model.findOne()
    https://mongoosejs.com/docs/api.html#model_Model.findOne
    https://stackoverflow.com/questions/7033331/how-to-use-mongoose-findone
    Mongoose findOne query returns a query object, not a document.
    You can either use a callback or as of v4+ findOne returns a
    thenable so you can use .then or await/async to retrieve the document.
    * */
    User.findOne({ username: username }, function (err, docs) {
        if (err) throw err;

        // docs ce biti wrapper object s raznim propertijima, medju kojima
        // se nalazi i property _doc koje je meni potrebno pa mu pristupam
        // pomocu docs._doc, a unutar tog _doc propertija se takodjer nalaze
        // drugi properties medju kojima je _id property koji mi je potreban
        /* ako docs nije null, onda korisnik s tim username-om postoji */
        if (docs != null) {
            let user = docs._doc;
            // call: _id.toHexString() to get the hex value directly
            // returns the 24 byte hex string representation.
            // https://stackoverflow.com/a/50234479/13853785
            /** _id: https://kb.objectrocket.com/mongo-db/understanding-the-mongoose-_id-field-1008 **/
            // We do not need to create primary key(id) for every document(row) in collections ourselves because MongoDB itself
            // provides a primary key for each document.
            // This primary key provided by MongoDB is the _id field that is
            // automatically created when a document(row) is inserted into a collection.
            user._id = user._id.toHexString();
            callback(user);
        } else {
            callback(null);
        }
    });
}

function verifyUser(username, password, callback) {
    findByUsername(username, function (user) {
        // if next if is entered, it means that this username exists
        if (user !== null) {
            // check if password is correct
            if (helper.verifyPassword(password, user.password)) {
                // posaljemo usera (user objekat ima sve informacije o useru) u index.js
                // u tijelo callback fje proslijedjene u pozivu verifyUser() fje
                callback(user);
            } else {
                // if password is not correct
                callback(null);
            }
        } else {
            // if username doesn't exist
            callback(null);
        }
    });
}

module.exports = {
    create,
    findByUsername,
    verifyUser
};
