const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
// setting EJS as templating engine
app.set("view engine", "ejs");

//////////////////////////////////////////////
/////////////// MIDDLEWARE //////////////////
//////////////////////////////////////////////

// converts request body into readable string
app.use(express.urlencoded({ extended: true }));

////////////////////////////////////////////
/////////////// DATABASE //////////////////
///////////////////////////////////////////

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

////////////////////////////////////////////
/////////////// FUNCTIONS //////////////////
///////////////////////////////////////////

const generateRandomString = function (length = 6) {
  return Math.random().toString(36).substr(2, length)
};


////////////////////////////////////////////
/////////////// ROUTES //////////////////
///////////////////////////////////////////

// registers a handler on the root path '/'
app.get('/', (req, res) => {
  res.send('Hello!');
});

//////////////////////////////////////////////
////////////// CREATE OPERATIONS/////////////////
//////////////////////////////////////////////

// a GET route to render the urls_new.ejs template in the browser, to present the form to the user
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.post("/urls", (req, res) => {
  // server generates short random id, adds it to database
  let id = generateRandomString(6);
  // the value of the new id is the longURL submitted by user
  urlDatabase[id] = req.body.longURL;
  // the POST then redirects to the url page for that unique id
  res.redirect(`/urls/${id}`);
});


// set a redirect to the longURL
app.get("/u/:id", (req, res) => {
  // look up the longURL from the id
  let longURL =   urlDatabase[req.params.id];
  // if the id exists in the database
  if (longURL){
    res.redirect(longURL);
  }
  else {
    res.redirect('/urls');
  }
});


//////////////////////////////////////////////
////////////// READ OPERATIONS/////////////////
//////////////////////////////////////////////

// GET route for single URL
app.get("/urls/:id", (req, res) => {
  let id = req.params.id;
  const templateVars = { id: id, longURL: urlDatabase[id] };
  res.render("urls_show", templateVars);
});

// registers handler for the path /urls.json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// GET route for URLs table template
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});




// registers a handler for the path /hello
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});


///////////////////////////////////////////////
////// SERVER LISTENING ///////////////////////
///////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
