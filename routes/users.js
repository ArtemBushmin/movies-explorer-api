const express = require('express');
const { celebrate, Joi } = require('celebrate');
const {
  updateUserProfile,
  getUserInfo,
} = require('../controllers/users');

const userRoutes = express.Router();

userRoutes.get('/users/me', getUserInfo);
userRoutes.patch(
  '/users/me',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      name: Joi.string().min(2).max(30).required(),
    }),
  }),
  updateUserProfile,
);

module.exports = { userRoutes };
