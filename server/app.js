`use strict`;

const express = require(`express`);
const parser = require(`body-parser`);
const router = require(`./api`);
const path = require('path');

const isAuth = require('./middleware/is-auth');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(parser.json());
app.use(parser.urlencoded({ extended: false}));
app.use(isAuth);
app.use(`/api`, router);


// Глобальный обработчик ошибок для несуществующих маршрутов
app.use((req, res, next) => {
    const err = new Error(`Not Found`);
    err.status = 404;
    next(err);
});

// Глобальный обработчик для всех остальных ошибок
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    });
});

module.exports = app;
