const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id).orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((error) => {
      if (error.name === 'DocumentNotFoundError') {
        const err = new Error('Информация о пользователе не найдена');
        err.statusCode = 404;
        next(err);
      } else {
        next(error);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email, password: hash, name,
    }))
    .then((user) => User.findOne({ _id: user._id }))
    .then((user) => res.send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        const err = new Error('Некорректные данные при создании пользователя');
        err.statusCode = 400;
        next(err);
      }
      if (error.code === 11000) {
        const err = new Error('Пользователь с таким email уже существует');
        err.statusCode = 409;
        next(err);
      } else {
        next(error);
      }
    });
};

module.exports.updateUserProfile = (req, res, next) => {
  const { email, name } = req.body;
  User.findByIdAndUpdate(req.user._id, { email, name }, { new: true, runValidators: true })
    .orFail()
    .then((user) => res.send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        const err = new Error('Некорректные данные при обновлении пользователя');
        err.statusCode = 400;
        next(err);
      } else {
        next(error);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key', {
        expiresIn: '7d',
      });
      res.send({ jwt: token });
    })
    .catch(next);
};
