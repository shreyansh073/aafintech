const express = require('express')
require('./db/mongoose')
const cron = require("node-cron");

const api = express()
const port = process.env.PORT || 2000;

// Routers

const userRouter = require('./routers/user')
const consentRouter = require('./routers/consent')

api.use(express.json())
api.use(userRouter)
api.use(consentRouter)

// Workers

const update = require('./workers/updateDatabase')
cron.schedule("0 0 * * *", function() {
    console.log("running a task every minute");
    update();
});

const summary = require('./workers/summaryReport')

cron.schedule("0 0 1 * *", function() {
    console.log("running a task every month");
    summary();
});

//create express server

api.listen(port, () => {
    console.log('Server is up on port ' + port)
})