const express = require('express');
const morgan = require('morgan');
const usersRouter = require('./routes/users');
const validateUser = require('./middlewares/validateUser');
const itemsRouter = require('./routes/items');
const app = express();

app.use(express.json());
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));

app.get('/', async (request, response) => {
  return response.status(200).json({ hola: 'mundo' });
});

app.use('/api/users', usersRouter);
app.use('/api/items', validateUser, itemsRouter);

module.exports = app;
