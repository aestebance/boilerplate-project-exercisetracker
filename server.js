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
