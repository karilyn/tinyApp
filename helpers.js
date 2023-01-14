const bcrypt = require('bcryptjs');

/************* DATABASES ****************/

const urlDatabase = {
  'b2xVn2': {
    longURL: "https://www.lighthouselabs.ca",
    userId: "one",
  },
  '9sm5xK': {
    longURL: "https://www.google.ca",
    userId: "one",
  },
};

// users object to add new users to
const users = {
  'one': {
    id: 'one',
    email: 'karilyn.kempton@gmail.com',
    password: bcrypt.hashSync('banana', 10),
  }
};




/************** FUNCTIONS ***************/

// random string generator for generating short URL and userID
const generateRandomString = function () {
  return Math.random().toString(36).slice(2, 8);
};

// function to return URLS where the userId is equal to id of logged in user
const getUrlsForUser = function (userId, urlDatabase) {
  let urls = {};
  for (let id in urlDatabase) {
    if (userId === urlDatabase[id].userId) {
      urls[id] = urlDatabase[id];
    }
  }
  return urls;
};
// email lookup helper function
const getUserByEmail = function(email, users) {
  let user;
  for (let userId in users) {
    if (users[userId].email === email) {
      return user;
    }
  }
  return;
};



module.exports = {
  urlDatabase,
  users,
  generateRandomString,
  getUrlsForUser,
  getUserByEmail,
};