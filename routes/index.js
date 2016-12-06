var express = require('express');
var ObjectID = require('mongodb').ObjectID;
var router = express.Router();

//////////////////////////////AUTH0///////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
};
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////


router.get('/', function(req, res) {
  res.render('index', {title:'index'});
});
////////////////////AUTH0////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
router.get('/login',
  function(req, res){
    res.render('login', { env: env });
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/url-if-something-fails' }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/guestbook');
  });
///////////////////////////////////////////////////
///////////////////////////////////////////////////
////////////////////////////////////////////////////

/* GET Guestbook page. */
router.get('/guestbook', ensureLoggedIn, function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        res.render('guestbook', {
            "userlist" : docs
        });
    });
});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;
    var userMessage = req.body.usermessage;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "username": userName,
        "email": userEmail,
        "message": userMessage
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("/guestbook");
        }
    });
});

//Direct to specific user page
router.get('/view/:username', function (req, res){
  var username = req.params.username;
  var db = req.db;
  var collection = db.get('usercollection');
  collection.find({"username": username}, function(e, doc) {
    res.render('user', {
      name: doc[0].username,
      email: doc[0].email,
      message: doc[0].message
    });
  });
});

//remove entry
router.get('/:id', function(req,res){

	var id = req.params.id;
	var objectId = new ObjectID(id);
	var db = req.db;
	var collection = db.get('usercollection');
	console.log(collection);
	collection.remove({_id: objectId});
	res.redirect("/guestbook");

});




module.exports = router;
