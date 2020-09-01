const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const router = new express.Router()

router.post('/sms', async (req,res) => {
    const twiml = new MessagingResponse();
    const message = "temp"; // this should be somewhere in the API
    const phone = "temp";   // this should be somewhere in the API

    // 1) Greeting, Ask for VUA
    // 2) Create consent, send instructions along with oneMoney URL
    // 3) Fallback message
    // 4) Error message
    //twiml.message('The Robots are coming! Head for the hills!');

    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
})

module.exports = router;
