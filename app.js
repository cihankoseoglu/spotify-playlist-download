// -----
// npm's
var express         = require('express'),
    path            = require('path'),
    favicon         = require('serve-favicon'),
    logger          = require('morgan'),
    cookieParser    = require('cookie-parser'),
    bodyParser      = require('body-parser'),
    session         = require('express-session');

// -----
// lib's
var spotify         = require('./lib/spotify.js');

// -----
// config's
var config          = require('./config/app.js');

// ----------
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(session({
    secret: 'FrEshB1I$teR$51%6',
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    // cookie: {
    //     secure: true
    // }
}));

app.use(express.static(path.join(__dirname, 'public')));

// -----
// Route's


app.use(function(req, res, next) {
    // redirect to login
    // if(!req.session.accessToken && !/^\/login.*/.test(req.url))
    //     return res.redirect('/login');

    next();
});

app.use('/', require('./routes/index'));
app.use('/login', require('./routes/login'));
app.use('/users', require('./routes/users'));
app.use('/search', require('./routes/search'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


app.listen(config.server.port);
console.log('Server running at', config.server.host + ':' + config.server.port);

module.exports = app;
