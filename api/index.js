var express = require('express')
var router = express.Router()
var ensureLoggedIn = require('./auth/ensureLoggedIn')

// TODO: remove this in production - it's just skipping auth
ensureLoggedIn = function(req, res, next) {
  next()
}

/* mise api routes */
// matches resources
var matches = require('./matches')
router.get('/matches',matches.index)
router.get('/matches/:id',matches.show)
router.post('/matches',ensureLoggedIn,matches.create)
router.put('/matches/:id',ensureLoggedIn,matches.update)
router.delete('/matches/:id',ensureLoggedIn,matches.destroy)

// bands resources
var bands = require('./bands')
router.get('/bands',bands.index)
router.get('/bands/:id',bands.show)
router.post('/bands',ensureLoggedIn,bands.create)
router.put('/bands/:id',ensureLoggedIn,bands.update)
router.delete('/bands/:id',ensureLoggedIn,bands.destroy)

// brackets resources
var brackets = require('./brackets')
router.get('/brackets',brackets.index)
router.get('/brackets/:id',brackets.show)
router.post('/brackets',ensureLoggedIn,brackets.create)
router.put('/brackets/:id',ensureLoggedIn,brackets.update)
router.delete('/brackets/:id',ensureLoggedIn,brackets.destroy)

// users resources
var users = require('./users')
router.get('/users',users.index)
router.get('/users/me',users.currentUser)
router.get('/users/:id',users.show)
router.post('/users',ensureLoggedIn,users.create)
router.put('/users/:id',ensureLoggedIn,users.update)
router.delete('/users/:id',ensureLoggedIn,users.destroy)



/* end mise api routes */

/* ping */

module.exports = router
