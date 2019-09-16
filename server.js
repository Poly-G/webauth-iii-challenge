//use express
const express = require("express");
const server = express();
server.use(express.json());
// use helmet
const helmet = require("helmet");
server.use(helmet());
//use my middleware
server.use(logger);
//use my helpers
const db = require("./userModel");

server.get("/", (req, res) => {
  res.send("works!");
});

const jwt = require("jsonwebtoken");
const secrets = require("./data/config/secrets");

const bcrypt = require("bcryptjs");

// register new user
server.post("/api/register", async (req, res) => {
  const userInfo = req.body;
  //generate the hash
  const hash = bcrypt.hashSync(userInfo.password, 12);
  //set the userpassword to our new hashed value
  userInfo.password = hash;

  try {
    if (userInfo) {
      const newUser = await db.addUser(userInfo);

      if (newUser) {
        res.status(201).json(newUser);
      } else {
        res.status(400).json({
          message: "Error Adding the User to the database"
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      message: "Error"
    });
  }
});

//authenticate and log in existing user
server.post("/api/login", (req, res) => {
  //destructure username and password
  let { username, password } = req.body;
  //use findby method in model to username from req.body
  db.findBy({ username })
    .first()
    .then(user => {
      //compare the hashed password in the database against the incoming password
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);

        res.status(200).json({ message: `Welcome ${user.username}!`, token });
      } else {
        res.status(401).json({ message: `new phone who this` });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

//put this in its own folder in production
function generateToken(user) {
  const payload = {
    //header and payload can be seen by the client, not encrypted
    subject: user.id, //sub property, who is this token for?
    username: user.username
  };
  const options = {
    expiresIn: "2m"
  };
  return jwt.sign(payload, secrets.jwtSecret, options);
}

//get all users
server.get("/api/users", verify, async (req, res) => {
  const users = await db.getUsers();

  if (users) {
    res.status(200).json(users);
  } else {
    res.status(400).json({ message: "Error retrieving list of users" });
  }
});

//logger middleware
function logger(req, res, next) {
  console.log(
    `Method: ${req.method}, url: ${
      req.url
    }, timestamp: [${new Date().toISOString()}]`
  );
  next();
}

//verification middleware
//note: verification middleware should be in its own folder in ./auth/ directory

function verify(req, res, next) {
  //get token from headers
  const token = req.headers.token;
  if (token) {
    //decoding token
    console.log(req.headers.token + " LINE 141");
    console.log(secrets.jwtSecret);
    jwt.verify(token, secrets.jwtSecret, (err, decodedToken) => {
      //if error means is an invalid or tempered token
      if (err) {
        res.status(401).json({ message: "Invalid token!" });
      } else {
        //if no error then it was decoded and is valid
        req.decodedJWT = decodedToken;
        next();
      }
    });
  } else {
    //No token
    res.status(401).json({ message: "Missing token!" });
  }
}

module.exports = server;
