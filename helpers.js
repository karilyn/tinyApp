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

// random string generator for generating short URL and userID
const generateRandomString = function () {
  return Math.random().toString(36).slice(2, 8);
};

// function to return URLS where the userId is equal to id of logged in user
const getUrlsForUser = function (userId) {
  let urls = {};
  for (let id in urlDatabase) {
    if (userId === urlDatabase[id].userId) {
      urls[id] = urlDatabase[id];
    }
  }
  return urls;
};


module.exports = {
  getUserByEmail,
  generateRandomString,
  getUrlsForUser,
};