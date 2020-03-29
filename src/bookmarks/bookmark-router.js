const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const store = require('../store');
const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    res.json(store.bookmarks);
  })
  .post(bodyParser, (req, res) => {
    const id = uuid();
    const { title, url, desc, rating } = req.body;
    const newBookmark = {
      id,
      title,
      url,
      desc,
      rating
    };
    for (let field of ['title', 'url', 'rating']) {
      if (!req.body[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send(`'${field}' is required`);
      }
    }
    if (!url.includes('http')) {
      return res.status(400).send('Please provide correct Url Format.');
    }
    if (rating !== Number(rating) || rating > 5 || rating < 1) {
      logger.error('Proper rating format is required');
      return res.status(400).send('Please provide number between 1-5.');
    }
    store.bookmarks.push(newBookmark);
    res.send('Book created');
  });
bookmarksRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
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
  })
  .delete((req, res) => {
    const { id } = req.params;

    const bookmarkIndex = store.bookmarks.findIndex(b => b.id === id);

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${id} not found`);
      return res
        .status(404)
        .send('Bookmark Not found');
    }

    store.bookmarks.splice(bookmarkIndex, 1);

    logger.info(`Bookmark with id ${id} deleted.`);
    res
      .status(204)
      .end();
  });

module.exports = bookmarksRouter;

