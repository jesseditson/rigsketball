// server.js

var express = require('express')
var path = require('path')
var app = express()
var engine = require('ejs-locals')
var favicon = require('serve-favicon')
var logger = require('morgan')
var session = require('express-session')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var tumblr = require('./app/routes/tumblr')

var port = process.env.APP_PORT || 4444
var address = process.env.APP_IP || '127.0.0.1'

// include the JSX transpiler
require('node-jsx').install({harmony: true})

// config app
app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

if (app.get('env') === 'development') {
  var MongoStore = require('connect-mongo')(session)
  app.use(session({
    secret : 'talented-bust-loss',
    name : 'Rigsketball',
    resave : false,
    saveUninitialized : false,
    store: new MongoStore(require('./app/models/mongo/config'))
  }))
} else {
  var RedisStore = require('connect-redis')(session)
  app.use(session({
    name : 'Rigsketball',
    store: new RedisStore({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      pass: process.env.REDIS_PASS
    }),
    resave : false,
    saveUninitialized : false,
    secret: 'talented-bust-loss'
  }))
}


// compass styles
if (app.get('env') === 'development') {
  var compass = require('node-compass')
  app.use(compass({css: 'styles'}))

  // Include static assets. In production nginx handles this.
  app.use(express.static(path.join(__dirname, 'public')))

  // long traces
  Error.stackTraceLimit = Infinity
}

// ping endpoint for monitoring
app.get('/ping',function(req,res,next){
  // TODO: set real time?
  res.send('<pingdom_http_custom_check><status>OK</status><response_time>'+10+'</response_time></pingdom_http_custom_check>')
})

// Set view path
app.set('views', path.join(__dirname, 'views'))
// set up ejs for templating.
app.engine('ejs', engine)
app.set('view engine', 'ejs')

// arbitrary proxy
var http = require('http')
app.all('/proxy', function(req, res, next) {
  var url = req.query.url
  if(!url) return res.status(404).send('Not Found.')

  var proxy = http.request(url, function (r) {
    r.pipe(res, {
      end: true
    })
  })
  req.pipe(proxy, {
    end: true
  })
})

// auth
var passport = require('passport')
app.use(passport.initialize())
app.use(passport.session())
app.use(require('./api/auth/middleware'))

// set up api
app.use('/api', require('./api'))

// tumblr endpoint
app.use('/tumblr',tumblr)

// Set up Routes for the application
require('./app/routes/core-routes.js')(app)

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
        res.status(err.status || 500)
        res.send(JSON.stringify({
            message: err.message,
            error: err,
            stack : err.stack
        }))
    })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.send(JSON.stringify({
        error: err.message
    }))
})

app.listen(port, address)
console.log('Server is Up and Running at Port : ' + port)
// console.log('env: ')
// for (var v in process.env) {
//   console.log(v + '=' + process.env[v])
// }
