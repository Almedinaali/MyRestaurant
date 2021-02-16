const bcrypt = require('bcrypt');

function passwordHashing(password) {
    return bcrypt.hashSync(password, 10);
}

function verifyPassword(password, hash) {
    // using Bcrypt’s .compareSync() method we compare the password sent
    // with the request to the password in the database.
    if (bcrypt.compareSync(password, hash)) {
        return true;
    }

    return false;
}

module.exports = {
    passwordHashing,
    verifyPassword
};