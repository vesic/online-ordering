var express = require('express');
var session = require('express-session')
var bodyParser = require('body-parser');
var chance = require('chance').Chance();

var app = express();

// mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://vesic:vesic@ds037155.mlab.com:37155/my');

// models
var Restaraunt = require('./models/restaraunt');

app.use(express.static('public'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
//   cookie: { secure: true }
}));
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
//   res.send('Hello World!');
    res.sendfile('index.html');
});

app.get('/restaurants', (req, res) => {
    // res.send('Restaraunts');
    Restaraunt.find({}, (err, data) => {
        if (err) res.send(err);

        res.send(data);
    })
});

app.get('/restaurants-seed', (req, res) => {
    // 45.267081, 19.835363
    // new Restaraunt({
    //     name: 'Novi Sad',
    //     geo: [19.835363, 45.267081]
    // }).save();
    for (var i = 0; i < 1000; i++) {
        new Restaraunt({
            name: chance.domain(),
            geo: [
                chance.longitude({min: -124, max: -70}),
                chance.latitude({min: 28, max: 50})
            ]
        }).save();
    }
    res.send('success');
});

app.get('/restaurants-find', (req, res) => {
    var sess = req.session;
    var lat = sess.lat;
    var lng = sess.lng;
    // console.log(lat, lng);
    var distance = 10000 / 6371;
    Restaraunt.find({
        'geo': {
            $near: [
                lng,
                lat
            ],
            $maxDistance: distance
        }
    }).exec((err, data) => {
        if (err) res.send(err);
        
        res.render('restaraunts', {data: data});
        // res.send(data);
    });
});

app.post('/set', (req, res) => {
    var sess = req.session;
    var lat = req.body.lat;
    var lng = req.body.lng;
    var distance = req.body.distance;
    sess.lat = lat;
    sess.lng = lng;
    sess.distance = distance;
    console.log(lat, lng, distance);
    res.send({"message":"OK"});
});

app.get('/get', (req, res) => {
    var sess = req.session;
    res.send('you name is '+ sess.lat + " " + sess.lng + " " + sess.distance);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});