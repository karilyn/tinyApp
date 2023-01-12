const crcypt = require('bcryptjs');
console.log(bcrypt);

const SALT_ROUNDS = 10
const PASSWORD = 'I_love_cats';
const OTHER_PASSWORD = 'dogsrule';
const salt = bcrypt.genSaltSync(SALT_ROUNDS);
console.log(salt);
const hash = bcrypt.hashSync(PASSWORD, salt);
console.log('Hash: ', hash);

// process to compare password and hash
const isMatch = bcrypt.compareSync(PASSWORD, hash)
console.log('Are passwords the same? ', isMatch);

module.exports = { bcrypt }