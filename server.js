// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var mongoose = require('mongoose');                     // mongoose for mongodb
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var cookieParser = require('cookie-parser'); 
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    //var session = require('express-session');
    //var MongoStore = require('connect-mongo')(session);

    // configuration =================

    mongoose.connect('mongodb://localhost:27017/weblifetime_db');     // connect to mongoDB database on modulus.io

    app.use(cookieParser());
    // set a cookie
    app.use(function (req, res, next) {
      // check if client sent cookie
      var cookie = req.cookies.cookieName;
      if (cookie === undefined)
      {
        // no: set a new cookie
        var randomNumber=Math.random().toString();
        randomNumber=randomNumber.substring(2,randomNumber.length);
        res.cookie('cookieName',randomNumber, { maxAge: 900000, httpOnly: true });
        console.log('cookie created successfully');
      } 
      else
      {
        // yes, cookie was already present 
        console.log('cookie exists', cookie);
      } 
      next(); // <-- important!
    });

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());

    // Define Model ===============================
    var Lifetimeline = mongoose.model('Lifetimeline', {
        title : String,
        description : String,
        startDate : Date,
        endDate : Date,
        emoColor : String
    })

    //routes ==========================
    //select all lifetimeline
    app.get('/api/lifetimelines', function(req, res){
        Lifetimeline.find(function(err, lifetimelines){
            if (err){
              res.send(err);
            }
            res.json(lifetimelines);
        });
    });

    //creating lifetimeline
    app.post('/api/lifetimelines', function(req, res){
        Lifetimeline.create({
            title : req.body.title, 
            description : req.body.description,
            startDate : req.body.startDate,
            endDate : req.body.endDate,
            emoColor : req.body.emoColor,
            done : false
        }, function(err, lifetimeline){
            if(err){
                res.send(err);
            }
            Lifetimeline.find(function(err, lifetimelines){
                if(err){
                    res.send(err);
                }
                res.json(lifetimelines);
            });
        });
    });

    //delete lifetimeline
    app.delete('/api/lifetimelines/:lifetimeline_id', function(req, res){
        Lifetimeline.remove({
            _id : req.params.lifetimeline_id
        }, function(err, lifetimeline){
            if(err){
                res.send(err);
            }
            Lifetimeline.find(function(err, lifetimelines){
                if(err){
                    res.send(err);
                }
                res.json(lifetimelines);
            });
        });
    });

    //for updating lifetimeline
    app.put('/api/lifetimelines/:lifetimeline_id', function(req, res){
        if(!req.body) { 
            return res.send(400); 
        } // 6
        // Lifetimeline.findById(req.params.lifetimeline_id, function(err, lifetimeline){
        //     lifetimeline.content = req.body.content;
        //     lifetimeline.save( function(err, lifetimeline){
        //         if(err){
        //             res.json(err);
        //         }
        //         else {
        //             res.json(lifetimeline);
        //         }
        //     });
        // });
        Lifetimeline.findByIdAndUpdate( req.params.lifetimeline_id,
            { 
                $set : { 
                    title : req.body.title, 
                    description : req.body.description,
                    startDate : req.body.startDate,
                    endDate : req.body.endDate,
                    emoColor : req.body.emoColor 
                }
            },
            { new : true }, function(err, lifetimeline) {
            if (err) {
                res.json(err);
            } else {
                res.json(lifetimeline);
            }
        });
    });

    // application ===============================
    app.get('*', function (req, res){
        res.sendfile('public/index.html'); 
    });

    // listen (start app with node server.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");