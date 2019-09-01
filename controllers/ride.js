const router = require("express").Router();
const db = require("../models");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.mapboxAccessToken});
const fetch = require("node-fetch");


router.post("/:eventId", (req, res) => {
	console.log("RIDE ROOT POST route");
	if (!(typeof req.app.locals.rideState == "object")) {
		req.app.locals.rideState = {
			waypoints: [],
			currentWaypoint: 0,
			rideStarted: false,
			rideCompleted: false
		}
	}
	res.redirect("/ride/" + req.params.eventId);
})


router.get("/:eventId", (req, res) => {
	console.log("RIDE INDEX GET route");
	db.event.findOne({
		where: { id : req.params.eventId },
		include: [{ model: db.waypoint }]
		})
	.then(event => {
		res.render("ride/ride", {
			event,
			rideState: req.app.locals.rideState
		})
	})

})

router.post("/:eventId/:waypointId/waypointcheckin", (req, res) => {

})

router.get("/:eventId/:waypointId/drinks/add", (req, res) => {
	console.log("ADDWAYPOINTS POST route, eventId", req.params.eventId);
	// Get existing waypoints to show on map
	db.waypoint.findByPk(req.params.waypointId)
	.then(waypoint => {
		// Use Untappd to get brewery info for searched brewery name
		var breweryFetchString = "https://api.untappd.com/v4/search/brewery?client_id=" + process.env.UNTAPPD_CLIENT_ID + "&client_secret=" + process.env.UNTAPPD_CLIENT_SECRET + "&q=";
			breweryFetchString += waypoint.name.replace(" ", "+");
			breweryFetchString = encodeURI(breweryFetchString);
		console.log("BREWERYFETCHSTRING:", breweryFetchString);

		var breweryInfo = {};
		fetch(breweryFetchString)
		.then(response => {
			return response.json()
		})
		.then(breweryJson => {
			var untappdId = breweryJson.response.brewery.items[0].brewery.brewery_id
			var beersFetchString = "https://api.untappd.com/v4/brewery/info/" + untappdId + "?client_id=" + process.env.UNTAPPD_CLIENT_ID + "&client_secret=" + process.env.UNTAPPD_CLIENT_SECRET;
			beersFetchString = encodeURI(beersFetchString);
			console.log("API call to fetch brewery info from ID:", beersFetchString);
			fetch(beersFetchString)
			.then(response => {
				return response.json()
			})
			.then(beersJson => {
				var beersList = beersJson.response.brewery.beer_list.items.map(item => {
					return item.beer.beer_name;
				})

				// Compile aggregated brewery data in an object
				breweryInfo = {
					untappdId: untappdId,
					name: beersJson.response.brewery.brewery_name,
					address: beersJson.response.brewery.location.brewery_address,
					city: beersJson.response.brewery.location.brewery_city,
					state: beersJson.response.brewery.location.brewery_state,
					beersList: beersList
				};
				console.log("BREWERYINFO ***", breweryInfo);
				// Use Mapbox to get the location and store it in the waypoint
				res.render("ride/add_drink", { 
					currentUserId: req.user.id,
					eventId: req.params.eventId,
					waypointId: req.params.waypointId,
					breweryInfo
				});

			})
			.catch(err => {
				console.log("Untappd API call (Info) failed in addwaypoints POST route", err);
			})
		})
		.catch(err => {
			console.log("Untappd API call (ID) failed in addwaypoints POST route", err);
		})
	})

})


router.post("/:eventId/:waypointId/drinks/add", (req, res) => {
	db.drink.create({
		name: req.body.beerChoice,
		brewery: req.body.breweryName,
		abv: 6.0,
		participantId: req.body.participantId,
		size: 16.0
	})
	.then(result => {
		res.redirect("/ride/" + req.params.eventId);
	})

})

module.exports = router;