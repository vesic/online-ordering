var express = require('express');
var session = require('express-session')
var bodyParser = require('body-parser');
var chance = require('chance').Chance();
var async = require('async');

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
}));
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.sendfile('index.html');
});

app.get('/restaurants', (req, res) => {
    Restaraunt.find({}, (err, data) => {
        if (err) res.send(err);

        res.send(data);
    })
});

app.get('/restaurants-seed', (req, res) => {
    for (var i = 0; i < 10000; i++) {
        new Restaraunt({
            name: chance.domain(),
            geo: {
                type:"Point",
                coordinates: [chance.longitude({min: -105, max: -70}), chance.latitude({min: 28, max: 50})]
            }
        }).save();
    }

    res.send('success');
});

app.get('/restaurants-delete', (req, res) => {
    Restaraunt.remove().exec((err) => {
        if (!err) res.send('Ok');
    });
});

app.get('/restaurants-find', (req, res) => {
    var sess, lat, lng, distance;

    async.series([
        function(callback){
            sess = req.session;
            lat = sess.lat;
            lng = sess.lng;
            distance = sess.distance;
            callback();
        },
        function(callback){
            Restaraunt.find({
                'geo': {
                    $near: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    $maxDistance: distance
                }
            }).exec((err, data) => {
                if (err) res.send(err); 
                
                res.render('restaraunts', {data: data});
            });
            callback();
        }
    ]);
});

app.post('/restaraunt-add', (req, res) => {
    var lat, lng;
    if (req.body.name && req.body.lat && req.body.lng) {
        async.series([
            function(callback) {
                lng = Number(req.body.lng).toFixed(5);
                lat = Number(req.body.lat).toFixed(5);
                callback();
            },
            function(callback) {
                new Restaraunt({
                    name: req.body.name,
                    geo: {
                        type: "Point",
                        coordinates: [lng, lat]
                    }
                }).save();
                res.send({"message":"OK"}); 
                callback();
            }
        ]);
        // console.log(lng, lat);
    }
    else res.send('Error');
});

app.post('/set', (req, res) => {
    var sess = req.session;
    var lat = req.body.lat;
    var lng = req.body.lng;
    var distance = req.body.distance;
    sess.lat = lat;
    sess.lng = lng;
    sess.distance = Number(distance);
    res.send({"message":"OK"});
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});