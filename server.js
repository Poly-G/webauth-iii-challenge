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

module.exports = server;
