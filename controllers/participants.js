const router = require("express").Router();

router.post("/add", (req, res) => {
	console.log("Adding participant to event");
})

module.exports = router;