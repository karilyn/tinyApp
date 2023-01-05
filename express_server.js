const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

// setting EJS as templating engine
app.set("view engine", "ejs");

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
  'id': 'here i am',
  fart: 'asdfasdf'
};

// registers a handler on the root path '/'
app.get('/', (req, res) => {
  res.send('Hello!');
});

// registers handler for the path /urls.json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// route for URLs table template
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// route for single URL
app.get("/urls/:id", (req, res) => {
  let id = req.params.id;
  const templateVars = { id: id, longURL: urlDatabase[id] };
  res.render("urls_show", templateVars);
});

// registers a handler for the path /hello
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
