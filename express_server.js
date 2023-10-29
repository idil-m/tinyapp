const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());
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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  "tt3":{
    id: "tt3",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
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
  const user_id = req.cookies["user_id"] 
  const user = users[user_id]
  const templateVars = { 
    urls: urlDatabase,
    user: user

  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"] 
  const user = users[user_id]
  const templateVars = { 
    urls: urlDatabase,
    user: user
    
  }
  res.render("urls_new", templateVars)
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const user_id = req.cookies["user_id"] 
  const user = users[user_id]
  const templateVars = { 
    id:id, 
    longURL: urlDatabase[id],
    urls: urlDatabase,
    user: user

  };
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

app.post("/urls/:id/delete", (req, res) =>{
  const id = req.params.id
  if(urlDatabase[id]) {
    delete urlDatabase[id];
    res.redirect("/urls");
  }
});

app.post("/urls/:id", (req, res) =>{
  const id = req.params.id;
  const longURL = req.body.longURL;
  if(urlDatabase[id]){
    urlDatabase[id] =longURL;
    res.redirect("/urls");
  }

  });

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  for (let userId in users) {
    const user = users[userId];
    if (user.email === email && user.password === password) {
      res.cookie("user_id", user.id);
      return res.redirect("/urls");
    }
  }
  res.status(401).send("Invalid email or password.");
});

app.post("/logout", (req,res) =>{
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req,res) =>{
  const user_id = req.cookies["user_id"] 
  const user = users[user_id]
  const templateVars = {
    urls: urlDatabase,
    user: user
  }
res.render("registration", templateVars)
});

app.post("/register", (req,res) =>{
  
  const newUser= {
    id: generateRandomString(),
    email: req.body.email,
    password: req.body.password
  }
  if(!newUser.email || !newUser.password){
    return res.status(400).send("Email and password cannot be empty.");
  }
  for (const userId in users){
    const user = users[userId]
    if (user.email == newUser.email){
      return res.status(400).send("Email already registered.");

    }
  }
  users[newUser.id] = newUser
  res.cookie("user_id", newUser.id)
  console.log(users)
    res.redirect("/urls");
    
});
app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"] 
  const user = users[user_id]
  const templateVars = {
    user: user
  }
  
  res.render("login", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id]
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

