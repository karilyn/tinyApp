const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
// setting EJS as templating engine
app.set('view engine', 'ejs');

/***************************************/
/************ MIDDLEWARE ****************/
/***************************************/

// converts request body into readable string
app.use(express.urlencoded({ extended: true }));
let cookies = require('cookie-parser');
const { reset } = require('nodemon');
app.use(cookies());

/***************************************/
/************* DATABASES ****************/
/***************************************/

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

// created empty users object to add new users to
const users = {
  'one': {
    id: 'one',
    email: 'simon@simonwex.com',
    password: 'adawake',
  }
};

/***************************************/
/************ FUNCTIONS ****************/
/***************************************/

// random string generator for generating short URL and userID
const generateRandomString = function () {
  return Math.random().toString(36).slice(2, 8);
};

// email lookup helper function
const getUserByEmail = function(email) {
  let user;
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};


/********* CREATE OPERATIONS ***********/

// a GET route to render the urls_new.ejs template in the browser, to present the form to the user
// CREATE (FORM)
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render('urls_new');
});

// CREATE NEW ENTRY
app.post('/urls', (req, res) => {
  // server generates short random id, adds it to database
  let id = generateRandomString(6);
  // the value of the new id is the longURL submitted by user
  urlDatabase[id] = req.body.longURL;
  // the POST then redirects to the url page for that unique id
  res.redirect(`/urls/${id}`);
});



// NEW USER REGISTRATION
// GET /register
app.get('/register', (req, res) => {
  const templateVars = {
    email: req.cookies['email'],
    password: req.cookies['password'],
  };
  res.render('register', templateVars);
});

// POST /register
app.post('/register', (req, res) => {
  // server generates short random user id
  let { email, password } = req.body;
  email = email.toLowerCase();
  let userId = generateRandomString();

  if (getUserByEmail(email)) {
    //user already exists
    return res.status(400).send("User already exists");
  }
  // check to see if the email or password are empty strings
  if ((email === '') || (password === '')) {
    return res.status(400).send('Please make sure the fields are not empty');
  }

  let user = {
    id,
    email,
    password,
  };
  users[userId] = user;

  // now that the user is in the database, set the cookie
  res.cookie('user_id', userId);
  // console.log(user);
  res.redirect('/urls');
});

// USER LOGIN/LOGOUT
// GET /login
app.get('/login', (req, res) => {
  const templateVars = {
    email: req.cookies['email'],
    password: req.cookies['password'],
  };
  res.render('login', templateVars);
});

// POST /login
app.post('/login', (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase();
  let user = getUserByEmail(email);

  if (!user) {
    //email doesn't exist in database
    return res.status(403).send("Email cannot be found");
  }
  if (user.password !== password) {
    return res.status(403).send("Password doesn't match. Please try again.");
  }
  // if the user exists and the passwords match, give them a cookie
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});



//GET /logout
app.get('/logout', (req, res) => {
  // call the response object, don't need to parse to clear
  res.clearCookie("user_id");
  res.redirect("/login");
});

/********* READ OPERATIONS ***********/

// GET route for URLs table template
// READ ALL
app.get('/urls', (req, res) => {
  let user = users[req.cookies['user_id']];
  const templateVars = {
    urls: urlDatabase,
    user: user,
  };
  res.render('urls_index', templateVars);
});

// set a redirect to the longURL
app.get('/u/:id', (req, res) => {
  // look up the longURL from the id
  let longURL = urlDatabase[req.params.id];
  // if the id exists in the database, go to its page
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.redirect('/urls'); // if not, go back to index
  }
});

// GET route for single URL
app.get('/urls/:id', (req, res) => {
  let id = req.params.id;

  const templateVars = {
    id: id,
    longURL: urlDatabase[id],
    user: users[req.cookies['user_id']],
  };
  res.render('urls_show', templateVars);
});


// registers a handler on the root path '/'
app.get('/', (req, res) => {
  res.redirect('/urls');
});


/********* UPDATE OPERATIONS ***********/

app.post('/urls/:id/edit', (req, res) => {
  let id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls');
});


/********* DELETE OPERATIONS ***********/

// registers POST route to remove URL resource
app.post('/urls/:id/delete', (req, res) => {

  let id = req.params.id;
  delete urlDatabase[id];

  res.redirect('/urls');
});


/********* SERVER LISTENING ************/
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
