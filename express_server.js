const express = require("express");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());
function generateRandomString() {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers ='0123456789'
  let uid = ""
  for (let i=0; i<=6; i++){

    const rLetterIndex= Math.floor(Math.random() * letters.length)
    const rNumberIndex= Math.floor(Math.random() * numbers.length)
    if (Math.random() > 0.5){
      uid += letters[rLetterIndex]
    }else {
      uid += numbers[rNumberIndex]
    }
     
  }  
  

  return uid
};

function urlsForUser(id) {
  let EqUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      EqUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return EqUrls;
};
app.set("view engine", "ejs")

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
  if (!user){
    res.redirect("/login")
  }
  const userUrls = urlsForUser(user_id);
  const templateVars = { 
    urls: urlDatabase,
    user: user

  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"] 
  const user = users[user_id]
 if(!user){
  res.redirect("/login")
 } else{
  const templateVars = { 
    urls: urlDatabase,
    user: user
    
  }
  res.render("urls_new", templateVars)
 }
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const user_id = req.cookies["user_id"] 
  const user = users[user_id]
  if(!user){
    return res.redirect("/login")
  } if (urlDatabase[id].userId !== user_id) {
    return res.status.send("You do not have permission to view this URL.")
  }
  const templateVars = { 
    id:id, 
    longURL: urlDatabase[id].longURL,
    urls: urlDatabase,
    user: user

  };
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  console.log(req.body); 
  const user_id = req.cookies["user_id"];
  if(!users[user_id]){
    res.status(401).send("Log in to shorten URLs.");
  }else{

  const longuRL =  req.body.longURL
  const shortId = generateRandomString()

  urlDatabase[shortId] = {longURL:longuRL, userId: user_id };

  console.log(longuRL)
  res.redirect(`/urls/${shortId}`);
}
});

app.post("/urls/:id/delete", (req, res) =>{
  const id = req.params.id
  const user_id = req.cookies["user_id"];
  if(!urlDatabase[id]){
    return res.status(404).send("Could not find URL.")
  }
  if(urlDatabase[id].userId !== user_id) {
    return res.status(403).send("Unauthroized to delete this URL.")
  }
  delete urlDatabase[id];
    res.redirect("/urls");
});

app.post("/urls/:id", (req, res) =>{
  const id = req.params.id;
  const longURL = req.body.longURL;
  const user_id =req.cookies["user_id"];
  if(!urlDatabase[id]){
    return res.status(404).send("URL NOT FOUND.")
  }
  if(urlDatabase[id].userId !== user_id){
    return res.status(403).send("Unauthorized to edit this URL.")
  }
  urlDatabase[id].longURL = longURL;
  res.redirect("/urls");
  });

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  for (let userId in users) {
    const user = users[userId];
    if (user.email === email && bcrypt.compareSync(password, user.password)) {
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
  if(user){
    res.redirect("/urls")
  }else{
  const templateVars = {
    urls: urlDatabase,
    user: user
  }
res.render("registration", templateVars)
  }
});

app.post("/register", (req,res) =>{
  
  const newUser= {
    id: generateRandomString(),
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password,10)
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
  
  if(user) {
    res.redirect("/url")
  }else { 
  const templateVars = {
    user: user
  }

  res.render("login", templateVars);
}
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id
  const urlEntry = urlDatabase[id];
  if(!urlEntry){
    res.status(404).send("Shorten Url does not exist")
  }else {
  res.redirect(urlEntry,longURL);
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

