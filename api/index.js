var express = require('express')
var router = express.Router()
var ensureLoggedIn = require('./auth/ensureLoggedIn')

/* mise api routes */
// matches resources
var matches = require('./matches')
router.get('/matches',matches.index)
router.get('/matches/:id',matches.show)
router.post('/matches',ensureLoggedIn,matches.create)
router.put('/matches/:id',matches.update)
router.delete('/matches/:id',ensureLoggedIn,matches.destroy)

// bands resources
var bands = require('./bands')
router.get('/bands',bands.index)
router.get('/bands/:id',bands.show)
router.post('/bands',ensureLoggedIn,bands.create)
router.put('/bands/:id',bands.update)
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

// site resources
var site = require('./site')
router.get('/sites',site.index)
router.get('/sites/:id',site.show)
router.post('/sites',ensureLoggedIn,site.create)
router.put('/sites/:id',ensureLoggedIn,site.update)
router.delete('/sites/:id',ensureLoggedIn,site.destroy)



/* end mise api routes */

/* ping */

module.exports = router
