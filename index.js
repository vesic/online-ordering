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
    for (var i = 0; i < 1000; i++) {
        new Restaraunt({
            name: chance.domain(),
            geo: {
                "type":"Point",
                coordinates: [chance.longitude({min: -124, max: -70}), chance.latitude({min: 28, max: 50})]
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
    var sess = req.session;
    var lat = sess.lat;
    var lng = sess.lng;
    var distance = sess.distance;
    console.log(distance);
    Restaraunt.aggregate(
        [
            { "$geoNear": {
                "near": {
                    "type": "Point",
                    "coordinates": [lng, lat]
                },
                "distanceField": "distance",
                "sperical": true,
                "maxDistance": 10000
            }}
        ],
        function(err,results) {
            if (!err) res.render('restaraunts', {data: data});
            else res.send(err);
        }
    )
    // res.send('error');
    // Restaraunt.find({
    //     'geo': {
    //         $near: {
    //             type: "Point",
    //             coordinates: [lng, lat]
    //         },
    //         $maxDistance: 10000
    //     }
    // }).exec((err, data) => {
    //     if (err) res.send(err); 
        
    //     console.log('count', data.length);
    //     res.render('restaraunts', {data: data});
    //     // res.send(data);
    // });
});

app.post('/restaraunt-add', (req, res) => {
    if (req.body.name && req.body.lat && req.body.lng) {
        var lng = parseFloat(req.body.lng).toFixed(5);
        var lat = parseFloat(req.body.lat).toFixed(5);
        console.log(lng, lat);
        new Restaraunt({
            name: req.body.name,
            geo: [lng, lat]
        }).save();
    }

   res.send({"message":"OK"}); 
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