// email lookup helper function
const getUserByEmail = function(email, users) {
  let user;
  for (let userId in users) {
    if (users[userId].email === email) {
      // return users[userId];
      return user
    }
  }
  return null;
};

module.exports = {
  getUserByEmail,
}