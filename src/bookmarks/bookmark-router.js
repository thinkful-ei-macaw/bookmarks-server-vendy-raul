const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const store = require('../store');


const bookmarksRouter = express.Router();
const bodyParser = express.json();


