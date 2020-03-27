require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const winston = require('winston');
const store = require('./store');
const bodyParser = express.json();
const { check, validationResult } = require('express-validator');
const app = express();
const uuid = require('uuid/v4');


const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

//set up winston 
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'info.log' })
  ]
});
// api key configure
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  // move to the next middleware
  next();
});
app.use(bodyParser);

//get all bookmarks
app.get('/bookmarks', (req, res) => {
  res
    .json(store.bookmarks);
});

app.get('/bookmarks/:id', (req, res) => {
  const { id } = req.params;
  const bookmark = store.bookmarks.find(c => c.id === id);
  // make sure book is found
  if (!bookmark) {
    logger.error(`Book with id ${id} not found.`);
    return res
      .status(404)
      .send('Book not found');
  }
  res.json(bookmark);
});

app.post('/bookmarks',(req, res)=>{
  const id = uuid();
  
  const { title, url, desc, rating} = req.body;
  const newBookmark = {
    id,
    title,
    url,
    desc,
    rating
  };
  if(!title){
    logger.error('Title is required');
    return res
      .status(400)
      .send('Title required!');
  }
  if (!url) {
    logger.error('URL is required');
    return res
      .status(400)
      .send('Url required!');
  }
  if (!desc) {
    logger.error('Desc is required');
    return res
      .status(400)
      .send('Description required!');
  }
  if (!rating) {
    logger.error('rating is required');
    return res
      .status(400)
      .send('rating required!');
  }
  if(title < 1){
    logger.error('Title length is required');
    return res
      .status(400)
      .send('Please provide title longer than 1 letter');
  }
  if(desc < 1 || desc > 200) {
    logger.error('Desc length is required');
    return res 
      .status(400)
      .send('Please input a proper description, between 1 and 200 characters.');
  }
  // if (url) {
  //   return res
  //     .status(400)
  //     .send('Please provide correct Url Format.');
  // }
  if(rating !== Number(rating) || rating > 5 || rating < 1){
    logger.error('Proper rating format is required');
    return res
      .status(400)
      .send('Please provide number between 1-5.');
  }

  store.bookmarks.push(newBookmark);
  res.send('Book created');
});
 

if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());


app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  }
  else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;