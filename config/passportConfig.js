// Require passport and any needed strategies
const passport = require ("passport");
const localStrategy = require("passport-local").Strategy;

// We will need db access to store profiles
const db = require("../models");

// Provide serialization and de-serialization functions
// for passport to use. This allows passport to store
// user by the id alone (serialize) and look up a user's
// full information from the id (deserialize)

passport.serializeUser((user, callback) => {
	// callback first arg is error and second arg is data
	// Just sending the user id
	callback(null, user.id);
})


passport.deserializeUser((id, callback) => {
	// Pass on full user info from id
	db.user.findByPk(id)
	.then((user) => {
		callback(null, user);
	})
	.catch(callback)
})

// Implement the strategies

passport.use(new localStrategy({
		usernameField: "email",
		passwordField: "password"
		}, (typedInEmail, typedInPassword, callback) => {
	// Try looking up our user by email
	console.log("1", typedInEmail,typedInPassword);
	db.user.findOne({
		where: { email: typedInEmail }
	})
	.then((foundUser) => {
		console.log("got a user", foundUser.email);
		// If I didn't find a user matching email (foundUser == null)
		// OR if I did find the user but password is incorrect
		if (!foundUser || !foundUser.validPassword(typedInPassword)) {
			// BAD USER, NO DATA
			callback(null, null);
		} else {
			callback(null, foundUser);
		}
	}) 
	.catch(callback) // End of user findOne call
}));



module.exports = passport;
