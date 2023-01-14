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
  getUserByEmail,
};