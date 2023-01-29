// global.adminMail = "admin@admin.com"
// global.adminPassword = "1234"

require('./adminCode')

// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);
require('./config/session.config')(app)


// default value for title local
const capitalize = require("./utils/capitalize");
const projectName = "festival-wizard";

app.locals.appTitle = `${capitalize(projectName)} created with IronLauncher`;

// const adminCode = require('./routes/adminCode');
// app.use('/', adminCode)

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/", indexRoutes);

const authRoutes = require('./routes/auth.routes');
app.use('/', authRoutes)

const festivalRoutes = require('./routes/festival.routes');
app.use('/', festivalRoutes)

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
