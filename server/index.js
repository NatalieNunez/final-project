require('dotenv/config');
const pg = require('pg');
const express = require('express');
const errorMiddleware = require('./error-middleware');
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

app.get('/api/uploads', (req, res, next) => {
  const sql = `
  select *
    from "images"
  `;

  db.query(sql)
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => next(err));
});

app.get('/api/guests', (req, res, next) => {
  const sql = `
  select *
    from "guests"
    order by "firstName"
    `;

  db.query(sql)
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => next(err));
});

app.post('/api/guests', (req, res, next) => {
  const { firstName, lastName } = req.body;
  if (!firstName || !lastName) {
    res.status(400).json({
      error: 'firstName and lastName are both required fields'
    });
  }
  const sql = `
  insert into "guests" ("firstName", "lastName")
  values ($1, $2)
  returning *
  `;
  const params = [firstName, lastName];

  db.query(sql, params)
    .then(result => {
      const [newGuest] = result.rows;
      res.status(201).json(newGuest);
    })
    .catch(err => next(err));
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`express server listening on port ${process.env.PORT}`);
});
