const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', () => {
  it('should return a user object for an email that exists in the databse', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.deepEqual(getUserByEmail(user, expectedUserID, true));
  });

  it('should return undefined for email that does not exist in database', () => {
    const user = getUserByEmail("doesnotexist@example.com", testUsers);
    let expectedUserID;
    assert.deepEqual(getUserByEmail(user, expectedUserID, true));
  });
});
