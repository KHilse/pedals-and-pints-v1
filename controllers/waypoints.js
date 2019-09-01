const router = require("express").Router();


router.get("/search", (req, res) => {
	console.log("Searching for waypoint");
	res.send("Waypoint Search Stub");
})

router.post("/up", (req, res) => {
	console.log("Pushed waypoint up");
	res.redirect("/");	
})

router.post("/down", (req, res) => {
	console.log("Pushed waypoint down");
	res.redirect("/");
})


module.exports = router;