const app = require("express");
const router = app.Router();
const db = require("../models");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.mapboxAccessToken});
const fetch = require("node-fetch");


// INDEX route
router.get("/:userId", (req, res) => {
	db.event.findAll({
		where: {
			owner_id: req.user.id
		},
		include: [	{ model: db.participant },
					{ model: db.waypoint 	}]
	})
	.then(events => {
		console.log(`Found ${events.length} events`);
		res.render("events/index", { 
			currentUser: req.user,
			events });
	})
	.catch(err => {
		console.log("ERROR finding events for user: ", req.params.userId);
		res.redirect("/");
	})
})

// CREATE (NEW) route
router.get("/:userId/new", (req, res) => {
	res.render("events/new", { currentUser: req.user });
})

router.post("/:userId/new", (req, res) => {
	db.event.create({
		name: req.body.name,
		date: req.body.date,
		description: req.body.description,
		owner_id: req.params.userId
		})
	.then(event => {
		console.log("EVENT CREATED, now adding owner as participant");
		db.participant.findOne({
			where: {
				id: req.user.id
			}
		})
		.then(p => {
			event.addParticipant(p);
			res.redirect("/events/"+ req.params.userId + "/show/" + event.id);
		})

	})
	.catch(err => {
		console.log("ERROR creating new event", err);
	})
})

// SHOW (ONE) ROUTE
router.get("/:userId/show/:eventId", (req, res) => {
	console.log("Showing " + req.params.userId + "'s new event #" + req.params.eventId);
	db.event.findByPk(req.params.eventId)
	.then(event => {
		res.render("events/show", {
			event,
			currentUser: req.user
		})
	})
	.catch(err => {
		console.log("ERROR finding a particular event");
	})
})

// EDIT Route
router.put("/:userId/show/:eventId/edit", (req, res) => {
	var dateBits = req.body.date.split("-");
	var fixedDate = dateBits[1] + "/" + dateBits[2] + "/" + dateBits[0];
	db.event.findByPk(req.params.eventId)
	.then(event => {
		event.update({
			name: req.body.name,
			date: fixedDate,
			description: req.body.description
		})
		res.redirect("/" + req.params.userId + "/show/" + req.params.eventId);
	})
})


// DELETE Route

module.exports = router;