require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const errorHandler = require('./error-handler');
const store = require('./store');
const bodyParser = express.json();
const app = express();
const uuid = require('uuid/v4');
const validateBearerToken = require('./validate-bearer-token');


const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

//set up winston 


app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

// api key configure
app.use(validateBearerToken);
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

app.post('/bookmarks', (req, res) => {
  const id = uuid();

  const { title, url, desc, rating } = req.body;
  const newBookmark = {
    id,
    title,
    url,
    desc,
    rating
  };
  if (!title) {
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
  if (title < 1) {
    logger.error('Title length is required');
    return res
      .status(400)
      .send('Please provide title longer than 1 letter');
  }
  if (desc < 1 || desc > 200) {
    logger.error('Desc length is required');
    return res
      .status(400)
      .send('Please input a proper description, between 1 and 200 characters.');
  }
  if (!url.includes('http')) {
    return res
      .status(400)
      .send('Please provide correct Url Format.');
  }
  if (rating !== Number(rating) || rating > 5 || rating < 1) {
    logger.error('Proper rating format is required');
    return res
      .status(400)
      .send('Please provide number between 1-5.');
  }

  store.bookmarks.push(newBookmark);
  res.send('Book created');
});

app.delete('/bookmarks/:id', (req, res) => {
  const { id } = req.params;
  const bookmarkIndex = store.bookmarks.findIndex(b => b.id === id);

  if (bookmarkIndex === -1) {
    logger.error(`Bookmark with id ${id} not found`);
    return res
      .status(404)
      .send('Not found');
  }
  store.bookmarks.splice(bookmarkIndex, 1);
  res.json('deleted');
});


app.get('/', (req, res) => {
  res.send('Hello, world!');
});


app.use(errorHandler);

module.exports = app;