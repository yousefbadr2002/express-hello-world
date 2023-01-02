
var alert = require('alert');
var express = require('express');
var path = require('path');
var fs = require('fs');
const { stringify } = require('querystring');
const e = require('express');
const { Db } = require('mongodb');
var app = express();
const { MongoClient } = require('mongodb');
const cookieParser = require('cookie-parser');
const mongodbLegacy = require('mongodb-legacy');

var session = require('express-session');
var MongoStore = require('connect-mongodb-session')(session);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
  secret: 'my-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60
  },
  store: new MongoStore({
    uri: 'mongodb://127.0.0.1:27017/myDB',
    collection: 'Sessions'
  }),
}));

function generateUniqueId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function requireLogin(req, res, next) {
  if (!req.session.userId && !req.cookies.UserID) {
    return res.redirect('/');
  }
  next();
}

app.get('/',function(req,res){
  res.render('login')
}); 

app.post('/',function(req,res){
  var username = req.body.username;
  var pass = req.body.password;
  
  var userId = generateUniqueId();
  req.session[userId] = username ;

  mongodbLegacy.MongoClient.connect("mongodb://127.0.0.1:27017", { useUnifiedTopology: true },function(err, client) {
    if (err) throw err;
    var db = client.db('myDB');

    db.collection('FirstCollection').findOne(
      {
        $and: [
          {Username: {$eq: username}},
          {Password: {$eq: pass}}
        ]
      },
      function(err, result) 
      {
        if (err) throw err;
        if (result) 
        {
          res.cookie('UserID', userId, { maxAge: 1000 * 60 * 60 , httpOnly: true });
          res.render('home');
        }
        else 
          alert('Incorrect username or password. Please try again.');
      });
  });
});


app.get('/home',requireLogin,function(req,res){
  res.render('home');
});


app.get('/registration',function(req,res){
  res.render('registration');
});



app.post('/register',function(req,res){
  var username = req.body.username;
  var pass = req.body.password;
  
  const want_to_go = new Array();
  mongodbLegacy.MongoClient.connect("mongodb://127.0.0.1:27017",{ useUnifiedTopology: true }, function(err,client){
  if(err) throw err;
  var db = client.db('myDB');
  if (!username || !pass)
     alert('Try to register correctly.');
  db.collection('FirstCollection').findOne({ "Username": username }, function(err, result) {
  if (err) throw err;
  if (result && username && pass)
        alert('This username is already taken. Please choose another one.');
  else
  {
     db.collection('FirstCollection').insertOne({Username: username  , Password: pass , want_to_go: want_to_go} );
     alert('The registration was successful.');
     res.redirect('/');
  }
  });
 });
});


app.get('/hiking',requireLogin,function(req,res){
  res.render('hiking');
});

app.get('/annapurna',requireLogin,function(req,res){
  res.render('annapurna');
});


app.get('/inca',requireLogin,function(req,res){
  res.render('inca');
});

app.get('/cities',requireLogin,function(req,res){
  res.render('cities');
});

app.get('/islands',requireLogin,function(req,res){
  res.render('islands');
});

app.get('/rome',requireLogin,function(req,res){
  res.render('rome');
});

app.get('/paris',requireLogin,function(req,res){
  res.render('paris');
});

app.get('/bali',requireLogin,function(req,res){
  res.render('bali');
});

app.get('/santorini',requireLogin,function(req,res){
  res.render('santorini');
});

app.get('/wanttogo',requireLogin,function(req,res){
  var want_to_go;
  var userId = req.cookies.UserID;
  var username = req.session[userId];
  mongodbLegacy.MongoClient.connect("mongodb://127.0.0.1:27017",{ useUnifiedTopology: true }, function(err,client){
    if(err) throw err;
    var db = client.db('myDB');
    db.collection('FirstCollection').find({Username: username}).toArray(function(err, result) {
      if (err) throw err;
      want_to_go = result[0].want_to_go;
      res.render('wanttogo',{destinations:want_to_go});
    });
  });
});
  

app.post('/search',function(req,res){
    var ans = new Array();
    var search = req.body.Search;
    var destinations = ['Annapurna Circuit', 'Bali Island', 'Inca Trail to Machu Picchu', 'Paris', 'Rome', 'Santorini Island'];
    for (var i = 0; i < destinations.length; i++)
    {
      if(destinations[i].toLowerCase().includes(search.toLowerCase()))
         ans.push(destinations[i]);
    }
    if (ans.length == 0 || search.length == 0)
       alert('Destination not Found.');
    else
        res.render('searchresults',{destinations:ans});
});

app.post('/annapurna',function(req,res){
  var userId = req.cookies.UserID;
  var username = req.session[userId];
  mongodbLegacy.MongoClient.connect("mongodb://127.0.0.1:27017", { useUnifiedTopology: true }, function(err, client) {
    if (err) throw err;
    var db = client.db('myDB');
    db.collection('FirstCollection').findOne({Username: username}, function(err, user) {
      if (err) throw err;
      if (user.want_to_go.includes('Annapurna Circuit')) 
         alert('This destination already exists, do not add duplicate destination.');
      else 
      {
          db.collection('FirstCollection').findOneAndUpdate({Username: username}, {$push: {'want_to_go': 'Annapurna Circuit'}});
          alert('Annapurna Circuit is added, you can choose another one');
      }
    });
  });
  res.render('annapurna');
});

app.post('/bali',function(req,res){
  var userId = req.cookies.UserID;
  var username = req.session[userId];
  mongodbLegacy.MongoClient.connect("mongodb://127.0.0.1:27017", { useUnifiedTopology: true }, function(err, client) {
    if (err) throw err;
    var db = client.db('myDB');
    db.collection('FirstCollection').findOne({Username: username}, function(err, user) {
      if (err) throw err;
      if (user.want_to_go.includes('Bali Island')) 
         alert('This destination already exists, do not add duplicate destination.');
      else 
      {
          db.collection('FirstCollection').findOneAndUpdate({Username: username}, {$push: {'want_to_go': 'Bali Island'}});
          alert('Bali Island is added, you can choose another one');
      }
    });
  });
  res.render('bali');
});

app.post('/inca',function(req,res){
  var userId = req.cookies.UserID;
  var username = req.session[userId];
  mongodbLegacy.MongoClient.connect("mongodb://127.0.0.1:27017", { useUnifiedTopology: true }, function(err, client) {
    if (err) throw err;
    var db = client.db('myDB');
    db.collection('FirstCollection').findOne({Username: username}, function(err, user) {
      if (err) throw err;
      if (user.want_to_go.includes('Inca Trail to Machu Picchu')) 
         alert('This destination already exists, do not add duplicate destination.');
      else 
      {
          db.collection('FirstCollection').findOneAndUpdate({Username: username}, {$push: {'want_to_go': 'Inca Trail to Machu Picchu'}});
          alert('Inca Trail to Machu Picchu is added, you can choose another one');
      }
    });
  });
  res.render('inca');
});

app.post('/paris', function(req, res) {
  var userId = req.cookies.UserID;
  var username = req.session[userId];
  mongodbLegacy.MongoClient.connect("mongodb://127.0.0.1:27017", { useUnifiedTopology: true }, function(err, client) {
    if (err) throw err;
    var db = client.db('myDB');
    db.collection('FirstCollection').findOne({Username: username}, function(err, user) {
      if (err) throw err;
      if (user.want_to_go.includes('Paris')) 
         alert('This destination already exists, do not add duplicate destination.');
      else 
      {
          db.collection('FirstCollection').findOneAndUpdate({Username: username}, {$push: {'want_to_go': 'Paris'}});
          alert('Paris is added, you can choose another one');
      }
    });
  });
  res.render('paris');
});


app.post('/rome',function(req,res){
  var userId = req.cookies.UserID;
  var username = req.session[userId];
  mongodbLegacy.MongoClient.connect("mongodb://127.0.0.1:27017", { useUnifiedTopology: true }, function(err, client) {
    if (err) throw err;
    var db = client.db('myDB');
    db.collection('FirstCollection').findOne({Username: username}, function(err, user) {
      if (err) throw err;
      if (user.want_to_go.includes('Rome')) 
         alert('This destination already exists, do not add duplicate destination.');
      else 
      {
          db.collection('FirstCollection').findOneAndUpdate({Username: username}, {$push: {'want_to_go': 'Rome'}});
          alert('Rome is added, you can choose another one');
      }
    });
  });
  res.render('rome');
});

app.post('/santorini',function(req,res){
  var userId = req.cookies.UserID;
  var username = req.session[userId];
  mongodbLegacy.MongoClient.connect("mongodb://127.0.0.1:27017", { useUnifiedTopology: true }, function(err, client) {
    if (err) throw err;
    var db = client.db('myDB');
    db.collection('FirstCollection').findOne({Username: username}, function(err, user) {
      if (err) throw err;
      if (user.want_to_go.includes('Santorini Island')) 
         alert('This destination already exists, do not add duplicate destination.');
      else 
      {
         db.collection('FirstCollection').findOneAndUpdate({Username: username}, {$push: {'want_to_go': 'Santorini Island'}});
         alert('Santorini Island is added, you can choose another one');
      }
    });
  });
  res.render('santorini');
});

if(process.env.PORT)
  app.listen(process.env.PORT,function(){console.log('Server started')});
else
  app.listen(3000,function(){console.log('Server started on port 3000')});

