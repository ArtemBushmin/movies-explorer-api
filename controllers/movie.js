const Movie = require('../models/movie');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    nameRU,
    nameEN,
    trailerLink,
    thumbnail,
    movieId,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    nameRU,
    nameEN,
    trailerLink,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.send(movie))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        const err = new Error('Некорректные данные при создании фильма');
        err.statusCode = 400;
        next(err);
      } else {
        next(error);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.id)
    .orFail()
    .then((movie) => {
      if (!movie.owner.equals(req.user._id)) {
        const err = new Error('Нет возможности удалить фильм другого пользователя');
        err.statusCode = 403;
        return next(err);
      }
      return movie.remove()
        .then(() => res.send({ massege: 'Фильм удален' }));
    })
    .catch((error) => {
      if (error.name === 'DocumentNotFoundError') {
        const err = new Error('Фильм не найден');
        err.statusCode = 404;
        next(err);
      } else {
        next(error);
      }
    });
};
