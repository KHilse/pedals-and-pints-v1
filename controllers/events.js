const app = require("express");
const router = app.Router();
const db = require("../models");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.mapboxAccessToken});
const fetch = require("node-fetch");
const methodOverride = require("method-override");
router.use(methodOverride('_method'));

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
		console.log("EVENT CREATED, now adding owner as participant", req.params.userId);
		db.participant.findByPk(req.params.userId)
		.then(p => {
			console.log("Adding owner", p.username);
			event.addParticipant(p)
			.then(result => {
				res.redirect("/events/"+ req.params.userId + "/show/" + event.id);
			})
			.catch(err => {
				console.log("Couldn't add the owner as an event participant");
			})
		})
		.catch(err => {
			console.log("Couldn't find owner by id to attach to event");
		})
	})
	.catch(err => {
		console.log("ERROR creating new event", err);
	})
})

// SHOW (ONE) ROUTE
router.get("/:userId/show/:eventId", (req, res) => {
	console.log("Showing " + req.params.userId + "'s new event #" + req.params.eventId);
	db.participant.findAll()
	.then(participants => {
		db.event.findOne({where: { id: req.params.eventId },
						 include: [ { model: db.participant }, { model: db.waypoint }] })
		.then(event => {
			console.log("Found event with waypoints and participants");
			res.render("events/show", {
				event,
				participants,
				currentUser: req.user
			})
		})
		.catch(err => {
			console.log("ERROR finding a particular event");
		})		
	})
})

// EDIT Route
router.put("/:userId/show/:eventId", (req, res) => {
	console.log("EVENTS/EDIT PUT route");
	var dateBits = req.body.date.split("-");
	var fixedDate = dateBits[1] + "/" + dateBits[2] + "/" + dateBits[0];
	db.event.findByPk(req.params.eventId)
	.then(event => {
		event.update({
			name: req.body.name,
			date: fixedDate,
			description: req.body.description
		})
		res.redirect("/events/" + req.params.userId + "/show/" + req.params.eventId);
	})
})


// DELETE Route
router.delete("/:userId/show/:eventId", (req, res) => {
	console.log("EVENTS/EDIT DELETE route");
	db.event.destroy({ where: { id: req.params.eventId }})
	.then(event => {
		res.redirect("/events/" + req.params.userId);
	})
})


// PARTICIPANTS Routes

// Add Participant
router.post("/:userId/show/:eventId/participants/add", (req, res) => {
	db.participant.findByPk(req.body.id)
	.then(participant => {
		db.event.findByPk(req.params.eventId)
		.then(event => {
			event.addParticipant(participant);
			res.redirect("/events/" + req.params.userId + "/show/" + req.params.eventId);			
		})
	})
})

// WAYPOINTS Routes

router.get("/:userId/show/:eventId/waypoints/add", (req, res) => {
	console.log("ADDWAYPOINTS GET");
	var userId = req.params.userId;
	var eventId = req.params.eventId;
	console.log("EVENTID:", eventId);
	db.waypoint.findAll({
		where: { eventId: eventId }
	})
	.then(waypoints => {
		console.log("ADDWAYPOINTS THEN", waypoints.length);
		var markers = [];
		markers = waypoints.map(wp => {
			var markerObj = {
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [wp.long, wp.lat]
					},
				"properties": {
					"title": wp.name,
					"icon": "beer"
					}
			}
			return JSON.stringify(markerObj);
		});
		console.log("MARKERS", markers);
		console.log("EVENTID 2:", eventId);
		res.render("events/addwaypoint", {
			userId,
			eventId,
			mapboxAccessToken: process.env.mapboxAccessToken,
			markers
		})
	})
	.catch(err => {
		console.log("ERROR getting all waypoints that match event", eventId, err);
	})
})

router.post("/:userId/show/:eventId/waypoints/add", (req, res) => {
	console.log("ADDWAYPOINTS POST route, eventId", req.params.eventId);
	// Get existing waypoints to show on map
	db.waypoint.findAll({
		where: { eventId: req.params.eventId }
	})
	.then(waypoints => {
		var markers = waypoints.map(wp => {
			var markerObj = {
				"type": "Feature",
				"geometry": {
					"type": "Point",
					"coordinates": [wp.long, wp.lat]
					},
				"properties": {
					"title": wp.name,
					"icon": "beer"
					}
			}
			return JSON.stringify(markerObj);
		});

		// Use Untappd to get brewery info for searched brewery name
		var breweryFetchString = "https://api.untappd.com/v4/search/brewery?client_id=" + process.env.UNTAPPD_CLIENT_ID + "&client_secret=" + process.env.UNTAPPD_CLIENT_SECRET + "&q=";
			breweryFetchString += req.body.waypointName.replace(" ", "+");
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
				var query = `${breweryInfo.name}, ${breweryInfo.city}`;
				geocodingClient.forwardGeocode({
					query,
					types: ["poi"]
				})
				.send()
				.then((response) => {
					// TODO: send all of the matches instead of just the first one
					// and update searchresults.ejs to match
					console.log("MAPBOX response");

					var match = response.body.features[0];
					breweryInfo.lat = match.center[1];
					breweryInfo.long = match.center[0];



					// This info goes into the form that POSTs to /waypointadd
					res.render("events/addwaypoint", {
						userId: req.params.userId,
						eventId: req.params.eventId,
						breweryInfo,
						markers,
						mapboxAccessToken: process.env.mapboxAccessToken
					})
				})
				.catch(err => {
					console.log("Mapbox Geocode API call failed in addwaypoints POST route", err);
				})
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

router.post("/:userId/show/:eventId/waypoints/waypointadd", (req, res) => {
	console.log("WAYPOINTADD:", req.body);
	db.waypoint.create({
		name: req.body.breweryName,
		address: req.body.breweryAddress,
		city: req.body.breweryCity,
		state: req.body.breweryState,
		untappd_id: Number(req.body.untappd_id), // TODO: get actual id
		stop_number: 1,
		eventId: Number(req.params.eventId),
		long: Number(req.body.long),
		lat: Number(req.body.lat)
	})
	.then(() => {
		res.redirect("/events/" + req.params.userId + "/show/" + req.params.eventId + "/waypoints/add");
	})
})


module.exports = router;