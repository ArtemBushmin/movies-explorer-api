require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { userRoutes } = require('./routes/users');
const { movieRoutes } = require('./routes/movie');
const { loginRoutes } = require('./routes/login');
const { auth } = require('./middlewares/auth');

const { PORT = 3000, NODE_ENV, DATABASE_URL } = process.env;
const app = express();
app.use(express.json());
app.use(requestLogger);
app.use(cors());
app.use(loginRoutes);
app.use(auth);
app.use(userRoutes);
app.use(movieRoutes);
app.use('/*', (req, res, next) => {
  const err = new Error('Указан неверный путь');
  err.statusCode = 404;
  next(err);
});
app.use(errorLogger);
app.use(errors());
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});

mongoose.connect(NODE_ENV === 'production' ? DATABASE_URL : 'mongodb://localhost:27017/bitfilmsdb').then(() => {
  console.log('Connected to database on mongodb://127.0.0.1:27017/bitfilmsdb');
});

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
