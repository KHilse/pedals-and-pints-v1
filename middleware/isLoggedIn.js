module.exports = (req, res, next) => {
	// If user is logged in
	if (req.user) {
		// Cool, let them in
		next();
	} else {	// Otherwise, user is not logged in, not cool, don't let them in
		req.flash("error", "You must be logged in to view this page");
		// Make them log in first
		res.redirect("/auth/login");
	}
}