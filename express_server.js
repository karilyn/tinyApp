const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
// setting EJS as templating engine
app.set('view engine', 'ejs');

/***************************************/
/************ MIDDLWARE ****************/
/***************************************/

// converts request body into readable string
app.use(express.urlencoded({ extended: true }));
let cookies = require('cookie-parser');
app.use(cookies());
/***************************************/
/************* DATABASE ****************/
/***************************************/

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

/***************************************/
/************ FUNCTIONS ****************/
/***************************************/

const generateRandomString = function (length = 6) {
  return Math.random().toString(36).substr(2, length)
};


/***************************************/
/*************** ROUTES ****************/
/***************************************/

// registers a handler on the root path '/'
app.get('/', (req, res) => {
  res.redirect('/urls');
});

/***************************************/
/********* CREATE OPERATIONS ***********/
/***************************************/

// a GET route to render the urls_new.ejs template in the browser, to present the form to the user
// CREATE (FORM)
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
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

// CREATE NEW LOGIN
app.post('/login', (req, res) => {
  let username = req.body.username.toLowerCase();
  res.cookie('username', username);
  res.redirect('/urls');
})

/***************************************/
/********* READ OPERATIONS ***********/
/***************************************/

// set a redirect to the longURL
app.get('/u/:id', (req, res) => {
  // look up the longURL from the id
  let longURL = urlDatabase[req.params.id];
  // if the id exists in the database, go to its page
  if (longURL){
    res.redirect(longURL);
  }
  else {
    res.redirect('/urls'); // if not, go back to index
  }
});

// GET route for single URL
app.get('/urls/:id', (req, res) => {
  let id = req.params.id;

  const templateVars = {
    id: id,
    longURL: urlDatabase[id],
    username: req.cookies['username']
  };
  res.render('urls_show', templateVars);
});



// registers handler for the path /urls.json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// GET route for URLs table template
// READ ALL
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username'],
  };
  res.render('urls_index', templateVars);
});


// registers a handler for the path /hello
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

/***************************************/
/********* UPDATE OPERATIONS ***********/
/***************************************/
app.post('/urls/:id/edit', (req, res) => {
  let id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls');
})

app.get('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

/***************************************/
/********* DELETE OPERATIONS ***********/
/***************************************/

// registers POST route to remove URL resource
app.post('/urls/:id/delete', (req, res) => {

  let id = req.params.id;
  delete urlDatabase[id];

  res.redirect('/urls');
});


/***************************************/
/********* SERVER LISTENING ************/
/***************************************/
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
