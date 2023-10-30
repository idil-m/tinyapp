const getUserByEmail = function(email,database) {
  for (let userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return undefined;
};

//Function to generate random string
const generateRandomString = function() {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let uid = "";
  for (let i = 0; i <= 6; i++) {

    const rLetterIndex = Math.floor(Math.random() * letters.length);
    const rNumberIndex = Math.floor(Math.random() * numbers.length);
    if (Math.random() > 0.5) {
      uid += letters[rLetterIndex];
    } else {
      uid += numbers[rNumberIndex];
    }
     
  }
  

  return uid;
};


const urlsForUser = function(id,database) {
  let EqUrls = {};
  for (let shortURL in database) {
    if (database[shortURL].userId === id) {
      EqUrls[shortURL] = database[shortURL];
    }
  }
  return EqUrls;
};
module.exports = {getUserByEmail,generateRandomString,urlsForUser };