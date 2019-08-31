const isLoggedIn = require("../middleware/isLoggedIn");
const isAdminLoggedIn = require("../middleware/isAdminLoggedIn");
const app = require("express");
const router = app.Router();

// ROUTES

router.get("/", isLoggedIn, (req, res) => {
	if (typeof currentUser === "object") {
		app.locals({
			currentUser: currentUser
		})		
	}
	res.render("profile/index");
})

router.get("/admin", isAdminLoggedIn, (req, res) => {
	app.locals({
		currentUser: currentUser
	})
	res.render("profile/admin");
})

module.exports = router;