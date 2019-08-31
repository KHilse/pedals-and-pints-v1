module.exports = (req, res, next) => {
	// If user is logged in
	if (req.user && req.user.admin) {
		// Cool, let them in
		next();
	} else if (req.user) {
		// If user is logged in but not admin
		req.flash("error", "Hey you aren't an admin, pound sand!");
		res.redirect("/profile");
	} else {
		// Otherwise, user is not logged in, not cool, don't let them in
		req.flash("error", "You must be logged in as an Admin to view this page");
		// Make them log in first
		res.redirect("/auth/login");
	}
}