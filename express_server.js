const express = require("express");
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
const bcrypt = require("bcryptjs");


const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
//Set up cookie-session
app.use(cookieSession({
  name: 'session',
  keys: ["P8muX61j6O","LAbokGoH0W"],
  maxAge: 24 * 60 * 60 * 1000
}));



app.set("view engine", "ejs");


//url database
const urlDatabase = {
  "b2xVn2":{
    longURL:"http://www.lighthouselabs.ca",
    userId : ""
  } ,
  "9sm5xK":{
    longURL:"http://www.google.com",
    userId: ""
  },

};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur",10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur",10),
  },
  "tt3":{
    id: "tt3",
    email: "user2@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur",10),
  },
};
//Middleware
app.use(express.urlencoded({ extended: true }));
//Root route
app.get("/", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  if (!user) {
    return res.redirect("/login");
  }
  return res.redirect("/urls");
});
//Tester
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  if (!user) {
    return res.status(401).redirect("/login");
  }
  const userUrls = urlsForUser(userId,urlDatabase);
  const templateVars = {
    urls: userUrls,
    user: user

  };
  return res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  if (!user) {
    return res.redirect("/login");
  } else {
    const templateVars = {
      urls: urlDatabase,
      user: user
    
    };
    return res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.session.userId;
  const user = users[userId];
  
  if (!user) {
    return res.redirect("/login");
  }
  if (!urlDatabase[id]) {
    return res.status(404).send("URL not found.");
  } else if (urlDatabase[id].userId !== userId) {
    return res.status(403).send("You do not have permission to view this URL.");
  }

  const templateVars = {
    id:id,
    longURL: urlDatabase[id].longURL,
    urls: urlDatabase,
    user: user

  };
  return res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  
  const userId =  req.session.userId;
  if (!users[userId]) {
    return res.status(401).send("Log in to shorten URLs.");
  } else {

    const longuRL =  req.body.longURL;
    const shortId = generateRandomString();

    urlDatabase[shortId] = {longURL:longuRL, userId: userId };

    
    return res.redirect(`/urls/${shortId}`);
  }
});
//Route to delete  URL
app.post("/urls/:id/delete", (req, res) =>{
  const id = req.params.id;
  const userId = req.session.userId;
  if (!urlDatabase[id]) {
    return res.status(404).send("Could not find URL.");
  }
  if (urlDatabase[id].userId !== userId) {
    return res.status(403).send("Unauthroized to delete this URL.");
  }
  delete urlDatabase[id];
  return res.redirect("/urls");
});
//Route for updating an existing URL
app.post("/urls/:id", (req, res) =>{
  const id = req.params.id;
  const longURL = req.body.longURL;
  const userId = req.session.userId;
  if (!urlDatabase[id]) {
    return res.status(404).send("URL NOT FOUND.");
  }
  if (urlDatabase[id].userId !== userId) {
    return res.status(403).send("Unauthorized to edit this URL.");
  }
  urlDatabase[id].longURL = longURL;
  return res.redirect("/urls");
});
//Route for handling user login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.userId = user.id;
    return res.redirect("/urls");

  }
  return res.status(401).send("Invalid email or password.");
});
//Route for handling user logout
app.post("/logout", (req,res) =>{
  delete req.session.userId;
  return res.redirect("/login");
});
//Route to display the reg page
app.get("/register", (req,res) =>{
  const userId =  req.session.userId;
  const user = users[userId];
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      urls: urlDatabase,
      user: user
    };
    return res.render("registration", templateVars);
  }
});
//Route for handling new user reg
app.post("/register", (req,res) =>{
  
  const newUser = {
    id: generateRandomString(),
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password,10)
  };
  if (!newUser.email || !newUser.password) {
    return res.status(400).send("Email and password cannot be empty.");
  }
  for (const userId in users) {
    const user = users[userId];
    if (user.email === newUser.email) {
      return res.status(400).send("Email already registered.");

    }
  }
  users[newUser.id] = newUser;
  req.session.userId = newUser.id;
  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  
  if (user) {
    return res.redirect("/urls");
  } else {
    const templateVars = {
      user: user
    };

    return res.render("login", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const urlEntry = urlDatabase[id];
  if (!urlEntry) {
    return res.status(404).send("Shorten Url does not exist");
  } else {
    return res.redirect(urlEntry.longURL);
  }
});

//Start the sever
app.listen(PORT, () => {
  
});

