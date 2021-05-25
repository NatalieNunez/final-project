require('dotenv/config');
const pg = require('pg');
const express = require('express');
// const ClientError = require('./client-error');
const errorMiddleware = require('./error-middleware');
// const staticMiddleware = require('./static-middleware');
const uploadsMiddleware = require('./uploads-middleware');

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();

const jsonMiddleware = express.json();

app.use(jsonMiddleware);

app.post('/api/uploads', uploadsMiddleware, (req, res, next) => {
  const imageUrl = `/images/${req.file.filename}`;
  const sql = `
  insert into "images" ("url")
    values ($1)
    returning *
    `;
  const values = [imageUrl];
  db.query(sql, values)
    .then(result => {
      const [newImage] = result.rows;
      res.status(201).json(newImage);
    })
    .catch(err => next(err));
});

// app.use(staticMiddleware);

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`express server listening on port ${process.env.PORT}`);
});
