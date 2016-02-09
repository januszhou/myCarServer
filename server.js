/**
 * Created by zhou1 on 2/7/2016.
 */
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model
var Location   = require('./app/models/location'); // get our mongoose model
var passwordHash = require('password-hash');
var validator = require('validator');

// =======================
// configuration =========
// =======================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// start the server ======
// =======================
app.listen(port);

// =======================
// routes ================
// =======================

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
app.post('/login', function(req, res) {

    // find the user
    User.findOne({
        email: req.body.email
    }, function(err, user) {

        if (err) throw err;

        if (!user) {
            return res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {

            // check if password matches
            if (!passwordHash.verify(req.body.password,user.password)) {
                return res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            } else {
                // if user is found and password is right
                // create a token
                var token = jwt.sign({id: user._id}, app.get('superSecret'), {
                    expiresInMinutes: 1440 // expires in 24 hours
                });

                // return the information including token as JSON
                return res.json({
                    success: true,
                    message: 'login success!',
                    token: token
                });
            }
        }
    });
});

app.post('/signup', function(req, res) {

    if(!req.body.email || !req.body.password){
        return res.status(400).json({ success: false, message: 'Email and password is required' });
    }

    if(!validator.isEmail(req.body.email)){
        return res.status(400).json({ success: false, message: 'Email is not valid' });
    }

    // email needs to be unique
    User.findOne({
        email: req.body.email
    }, function(err, existingUser){
        if(existingUser){
            return res.status(400).json({ success: false, message: 'Email already exists' });
        } else {
            var password = passwordHash.generate(req.body.password);

            // create a sample user
            var user = new User({
                email: req.body.email,
                password: password
            });

            // save the sample user
            user.save(function(err) {
                if (err){
                    return res.status(400).json({ success: true, message: 'Signup successful'});
                }
                //TODO: email notification

                //TODO: email validation

                console.log('User saved successfully');
                var token = jwt.sign({id: user._id}, app.get('superSecret'), {
                    expiresInMinutes: 1440 // expires in 24 hours
                });

                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'login success!',
                    token: token
                });
            });
        }
    });
});

// API ROUTES -------------------

// get an instance of the router for api routes
var apiRoutes = express.Router();

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});

// apply the routes to our application with the prefix /api
app.use('/api/v1', apiRoutes);

/*
* POST /api/v1/locate {lat, lng}
* @return success or failed*/
app.post('/api/v1/locate', function(req, res){
    if(!req.body.lat || !req.body.lng){
        return res.status(400).json({ success: false, message: 'lat and lng is required' });
    }

    var _userId = req.decoded.id;

    var location = new Location({
        lat: req.body.lat,
        lng: req.body.lng,
        _userId: _userId
    });

    // save the sample user
    location.save(function(err) {
        if(err) return res.status(400).json({success: false});
        return res.json({success: true, objectId: location._id});
    });
});

/*
* GET /api/v1/locate/:id
* @return location
* */
app.get('/api/v1/locate/:id', function(req, res){
    if(!req.params.id){
        return res.status(400).json({ success: false, message: 'location id is required' });
    }

    // userId here pretty much just double check, since id is already unique
    Location.findOne({
        _id: req.params.id,
        _userId: req.decoded.id
    }, function(err, location){
        if(err || !location) return res.status(400).json({success: false});
        return res.status(200).json({success: true, location: location});
    });
});

app.get('/api/v1/locate', function(req, res){
    // userId here pretty much just double check, since id is already unique
    Location.find({
        _userId: req.decoded.id
    }, function(err, locations){
        if(err || !locations) return res.status(400).json({success: false});
        return res.status(200).json({success: true, locations: locations});
    });
});

//TODO: PUT
//app.put('/api/v1/locate/:id', function(req, res){
//
//});

