const express = require('express');
const { celebrate, Joi } = require('celebrate');
const {
  updateUserProfile,
  getUserInfo,
} = require('../controllers/users');

const userRoutes = express.Router();

userRoutes.get('/me', getUserInfo);
userRoutes.patch(
  '/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      about: Joi.string().min(2).max(30).required(),
    }),
  }),
  updateUserProfile,
);

module.exports = { userRoutes };
