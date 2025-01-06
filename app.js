const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// ====================== 1. middleware ======================
app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  console.log('hello from the middleware');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// ====================== 2. route handlers ======================
const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    message: 'Success',
    requestedAt: req.requestTime,
    result: tours.length,
    data: {
      tours: tours,
    },
  });
};

const getDetailTours = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;

  if (id > tours.length) {
    return res.status(404).json({
      status: 'Fail',
      message: 'Invalid ID',
    });
  }

  const tour = tours.find((element) => element.id === id);

  res.status(200).json({
    message: 'Success',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'Success',
        data: {
          tours: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'Fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'Success',
    data: {
      tour: '<Update tour here...>',
    },
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'Fail',
      message: 'Invalid ID',
    });
  }

  res.status(204).json({
    status: 'Success',
    data: null,
  });
};

// ====================== 3. routes ======================
app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getDetailTours)
  .patch(updateTour)
  .delete(deleteTour);

// ====================== 4. start server ======================
const port = 3000;
app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});
