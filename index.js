// Require in modules
require('dotenv').config();
const express = require('express');
const flash = require('connect-flash');
const layouts = require('express-ejs-layouts');
const methodOverride = require("method-override");
const moment = require('moment');
const passport = require('./config/passportConfig');
const session = require('express-session');
const db = require("./models");
const helmet = require("helmet");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sessionStore = new SequelizeStore({
	db: db.sequelize,
	expiration: 30 * 60 * 1000 // 30 minutes
})
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.mapboxAccessToken});


// Instantiate the express app
const app = express();

// Set up any middleware or settings
app.set('view engine', 'ejs');
app.use(layouts);
app.use(helmet());
app.use('/', express.static('static'));
app.use(express.urlencoded({ extended: false }));
app.use(session( {
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
	store: sessionStore
}));
sessionStore.sync();

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// CUSTOM MIDDLEWARE: write data to locals for every page
app.use((req, res, next) => {
	res.locals.alerts = req.flash();
	res.locals.currentUser = req.user; // user is added to req by passport
	res.locals.moment = moment;
	req.session.rideState = {};
	next();
})

// Controllers
app.use('/auth', require('./controllers/auth'));
app.use("/profile", require("./controllers/profile"));
app.use("/events", require("./controllers/events"));
app.use("/ride", require("./controllers/ride"));

// Routes
app.get('/', (req, res) => {
	db.event.findAll({
		where: { date: { [db.Sequelize.Op.gt]: new Date() - (1000 * 60 * 60 * 24 * 7) }},
		order: [['date', 'DESC']],
		limit: 5,
		include: [ { model: db.participant }]
	})
	.then(events => {
	    res.render('home', {
	    	events
	    });
	})
})

app.get('*', (req, res) => {
    res.render('404');
})

// LISTEN!
app.listen(process.env.PORT, () => {
    console.log("☕ Server is now running at port", process.env.PORT);
})