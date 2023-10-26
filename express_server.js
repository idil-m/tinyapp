const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
function generateRandomString() {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers ='0123456789'
  let uid = ""
  for (i=0; i<=6; i++){

    const rLetterIndex= Math.floor(Math.random() * letters.length)
    const rNumberIndex= Math.floor(Math.random() * numbers.length)
    if (Math.random() > 0.5){
      uid += letters[rLetterIndex]
    }else {
      uid += numbers[rNumberIndex]
    }
     
  }  
  

  return uid
}

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const templateVars = { id:id, longURL: urlDatabase[id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const longuRL =  req.body.longURL
  const shortId = generateRandomString()

  urlDatabase[shortId] = longuRL

  console.log(longuRL)
  res.redirect(`/urls/${shortId}`);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id]
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

