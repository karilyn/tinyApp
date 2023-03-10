const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require('bcryptjs');
const { reset } = require('nodemon');
const cookieSession = require('cookie-session');
const cookieSessionConfig = cookieSession({
  name: 'session_id',
  keys: ['keys[0]', 'keys[1]'],
  maxAge: 24 * 60 * 60 * 1000
});
const methodOverride = require('method-override');
const {
  urlDatabase,
  users,
  generateRandomString,
  getUrlsForUser,
  getUserByEmail,
} = require('./helpers');


/************ MIDDLEWARE ****************/

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieSessionConfig);


/********* CREATE OPERATIONS ***********/

// NEW USER REGISTRATION
// GET /register
app.get('/register', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render('register', templateVars);
});

// POST /register
app.post('/register', (req, res) => {
  // server generates short random user id
  let { email, password } = req.body;
  email = email.toLowerCase();
  const hashedPassword = bcrypt.hashSync(password, 10);
  let userId = generateRandomString();

  // find the user by their email address
  if (getUserByEmail(email)) {
    //user already exists
    return res.status(400).send("User already exists");
  }
  // check to see if the email or password are empty strings
  if ((email === '') || (password === '')) {
    return res.status(400).send('Please make sure the fields are not empty');
  }

  let user = {
    id: userId,
    email,
    password: hashedPassword,
  };
  users[userId] = user;

  const isMatch = bcrypt.compareSync(password, hashedPassword);
  if (!isMatch) {
    return res.status(400).send('Error authenticating user');
  }
  // now that the user is in the database, set the cookie
  req.session.user_id = userId;
  res.redirect('/urls');
});

// USER LOGIN/LOGOUT
// GET /login
app.get('/login', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  // if user is logged in, /login should redirect to  GET /urls
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render('login', templateVars);
});



// POST /login
app.post('/login', (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase();
  const hashedPassword = bcrypt.hashSync(password, 10);
  let user = getUserByEmail(email);

  if (!user) {
    //email doesn't exist in database
    return res.status(403).send("Email cannot be found");
  }
  const isMatch = bcrypt.compareSync(password, hashedPassword);
  if (!isMatch) {
    return res.status(400).send('Error authenticating user');
  }
  // if the user exists and the passwords match, give them a cookie
  req.session.user_id = user.id;
  res.redirect('/urls');
});

//GET /logout
app.get('/logout', (req, res) => {
  // remove the cookie session to clear the cookies from the browser
  req.session = null;
  res.redirect("/login");
});


// a GET route to render the urls_new.ejs template in the browser, to present the form to the user
// CREATE (FORM)
app.get('/urls/new', (req, res) => {
  // If the user is not logged in, redirect GET /urls/new to GET /login
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render('urls_new', templateVars);

});

// CREATE NEW ENTRY
app.post('/urls', (req, res) => {
  let userId = req.session.user_id;
  // if user is not logged in, redirect
  if (!userId) {
    return res.status(400).send("You must be logged in to shorten a URL.");
  }
  // server generates short random id, adds it to database
  let id = generateRandomString(6);

  // validate/clean up URL to catch when users don't include the http://
  let longURL = req.body.longURL;
  if (longURL.indexOf('http') < 0) {
    longURL = "http://" + longURL;
  }

  // the value of the new id is the longURL submitted by user
  let url = {
    'longURL': longURL,
    'userId': userId,
    visits: 0,
    visitors: [],
  };
  urlDatabase[id] = url;
  // the POST then redirects to the url page for that unique id
  res.redirect(`/urls/${id}`);
});


/********* READ OPERATIONS ***********/

// GET route for URLs table template
// READ ALL
app.get('/urls', (req, res) => {
  let userId = req.session.user_id;
  let urls = getUrlsForUser(userId);

  if (!userId) {
    return res.status(400).send("You must be logged in to view the URL pages.");
  }

  const templateVars = {
    urls: urls,
    user: users[req.session.user_id],
  };
  res.render('urls_index', templateVars);
});

// debug page to monitor live cookie and database results
app.get('/debug', (req, resp) => {
  resp.render('debug', {
    sessionInfo: JSON.stringify(req.session, null, '  '),
    urlDatabase: JSON.stringify(urlDatabase, null, '  '),
    users: JSON.stringify(users, null, '  '),
  });
});

// set a redirect to the longURL
app.get('/u/:id', (req, res) => {

  // look up the url from its id
  let url = urlDatabase[req.params.id];
  let longURL = url.longURL;

  // if the id exists in the database, follow the longURL link
  if (longURL) {
    // increment visit number by one each time the short url is followed
    url.visits++;
    // each user gets own session id, and add unique ones to the url.visitors array
    if (url.visitors.indexOf(req.session.id) < 0) {
      url.visitors.push(req.session.id);
    }
    res.redirect(longURL);
  } else {
    return res.status(404).send("<h2>404 Error. Page not found.</h2>");
  }
});

// GET route for single URL
app.get('/urls/:id', (req, res) => {
  let id = req.params.id;
  let userId = req.session.user_id;
  let url = urlDatabase[id];

  if (!userId) {
    return res.status(403).send("<h2>403 Error. You must be <a href='/login'>logged in</a> to access your URL.</h2>");
  }

  // Make sure url exists
  if (!url) {
    return res.status(404).send("<h2>404 Error. Page not found.</h2>");
  }
  // Make sure url is owned by user.
  if (userId !== url.userId) {
    return res.status(400).send("h2>403 Error. You do not have permission to access this URL.</h2>");
  }

  const templateVars = {
    id: id,
    longURL: urlDatabase[id].longURL,
    visits: urlDatabase[id].visits,
    numOfVisitors: urlDatabase[id].visitors.length,
    user: users[req.session.user_id],
  };
  res.render('urls_show', templateVars);
});


// registers a handler on the root path '/'
app.get('/', (req, res) => {
  let userId = req.session.user_id;
  if (!userId) {
    return res.redirect('/login');
  }

  res.redirect('/urls');
});


/********* UPDATE OPERATIONS ***********/

app.put('/urls/:id', (req, res) => {
  let id = req.params.id;
  urlDatabase[id].longURL = req.body.longURL;
  let userId = req.session.user_id;
  let url = urlDatabase[id];
  // make sure user is logged in
  if (!userId) {
    return res.status(400).send("You must be logged in to access this URL.");
  }
  // Make sure url is owned by user.
  if (userId !== url.userId) {
    return res.status(400).send("You do not have permission to access this URL.");
  }
  if (!id) {
    return res.status(404).send("URL does not exist.");
  }
  res.redirect('/urls');
});


/********* DELETE OPERATIONS ***********/

// registers POST route to remove URL resource
app.delete('/urls/:id/delete', (req, res) => {
  let id = req.params.id;
  let userId = req.session.user_id;
  let url = urlDatabase[id];

  if (!userId) {
    return res.status(400).send("You must be logged in to access your URL.");
  }
  // Make sure url is owned by user.
  if (userId !== url.userId) {
    return res.status(400).send("You do not have permission to access this URL.");
  }
  if (!id) {
    return res.status(404).send("URL does not exist.");
  }

  delete urlDatabase[id];
  res.redirect('/urls');
});


/********* SERVER LISTENING ************/
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
