const express = require('express');
const router = express.Router();
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');

const port = process.env.PORT || 3000;

require('dotenv').config();

const app = express();

// Routes
//const user = require('./routes/user');

// Models
const Profile = require('./models/Profile')
const User = require('./models/User')


var verify = require('./token')

// Express configurations
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.get('/profile', verify, (req, res) => {
  const query = req.query

  Profile.find(query).then(profiles => {
    res.json({
      confirmation: 'success',
      data: profiles
    })
  }).catch(err => {
    res.json({
      confirmation: 'fail',
      data: err.message
    })
  })
})

app.get('/profile/:id', (req, res) => {
  const id = req.params.id

  Profile.findById(id).then(profile => {
    res.json({
      confirmation: 'success',
      data: profile
    })
  }).catch(err => {
    res.json({
      confirmation: 'fail',
      message: `Profile ${id} not found.`
    })
  }) 
})

app.get('/post', (req, res) => {
  res.render('index');
})

app.post('/profile/post', verify, (req, res) => {
  Profile.create(req.body).then(profile => {
    res.json({
      confirmation: 'success',
      data: profile
    })
    
  }).catch(err => {
    res.json({
      confirmation: 'fail',
      message: `Can't created user`
    })
  })
})

// non restful
app.get('/profile/update', (req,res) => {
  const query = req.query
  const profileId = query.id
  delete query['id']

  Profile.findByIdAndUpdate(profileId, query, {new:true}).then(profile => {
    res.json({
      confirmation: 'success',
      data: profile
    })
  }).catch(err => {
    res.json({
      confimration: 'fail',
      message: err.message
    })
  })
})

app.delete('/profile/remove/:id', (req, res) => {
  const query = req.params.id

  Profile.findByIdAndRemove(query).then(data => {
    res.json({
      confirmation: 'success',
      data: `Data ${query} successfully removed`
    })
  }).catch(err => {
    res.json({
      confimration: 'fail',
      message: err.message
    })
  })
})

app.get('/register', (req, res) => {
  res.render('register');
})
app.post('/register', async (req, res) => {
  const emailCheck = await User.findOne({email: req.body.email})
  if(emailCheck) return res.status(400).send('Email already exists')

  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(req.body.password, salt)

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword
  })

  try{
    const savedUser = await user.save()
    res.send(savedUser)
  } catch (err) {
    res.status(400).send(err)
  }

})

app.get('/login', (req, res) => {
  res.render('login');
})
app.post('/login', async (req, res) => {
  const user = await User.findOne({email: req.body.email})
  if(!user) return res.status(400).send('Email doesn\'t exists')

  const validPassword = await bcrypt.compare(req.body.password, user.password)
  if(!validPassword) return res.status(400).send('Invalid password')

  const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET)
  res.header('auth-token', token).send(token)

  
})

app.listen(port, () => console.log(`Server runnig on port ${port} - mode: ${process.env.NODE_ENV}`))
