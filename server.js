const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://aestebance:73994757@cluster0.suqbq.mongodb.net/test?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
app.use(cors())

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});

let exerciseSessionSchema = mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: String
});

let userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  log: [exerciseSessionSchema]
});

let ExerciseSession = mongoose.model('Session', exerciseSessionSchema);
let User = mongoose.model('User', userSchema);

app.post('/api/exercise/new-user', bodyParser.urlencoded({ extended: false}), (req, res) => {
  let newUser = new User({username: req.body.username});
  newUser.save((err, data) => {
    if (!err) {
      res.json({
        username: data.username,
        _id: data._id
      });
    }
  })
});

app.get('/api/exercise/users', (req, res) => {
  User.find({}, (err, data) => {
    if (!err) {
      res.json(data);
    }
  })
});

app.post('/api/exercise/add', bodyParser.urlencoded({ extended: false}), (req, res) => {
  let newExercise = new ExerciseSession({
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: req.body.date
  });
  if (newExercise.date === '') {
    newExercise.date = new Date().toISOString().substring(0, 10);
  }
  User.findByIdAndUpdate(
      req.body.userId, {$push: {log: newExercise}},
      {new: true},
      (err, data) => {
        res.json({
          _id: data._id,
          username: data.username,
          date: new Date(newExercise.date).toDateString(),
          description: newExercise.description,
          duration: newExercise.duration
        })
      });
});

app.get('/api/exercise/log', (req, res) => {
  User.findById(req.query.userId, (err, data) => {
    if(!err) {

      if (req.query.from || req.query.to) {
        let from = new Date(0);
        let to  = new Date();

        if (req.query.from) {
          from = new Date(req.query.from);
        }
        if (req.query.to) {
          to = new Date(req.query.to);
        }

        from = from.getTime();
        to = to.getTime();

        data.log = data.log.filter((ses) => {
          let sesDate = new Date(ses.date).getTime();
          return sesDate >= from && sesDate <= to ? ses : null;
        });
      }

      if (req.query.limit) {
        data.log = data.log.slice(0, req.query.limit);
      }

      res.json({
        _id: data._id,
        username: data.username,
        count: data.log.length,
        log: data.log
      });
    }
  });
});
