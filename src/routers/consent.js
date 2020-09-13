const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth');
const Deposit = require('../models/deposit');
const axios = require('axios').default;
const router = new express.Router()
const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_SECRET);

const headers = {
    'Content-Type': 'application/json', 
    'client_id': 'fp_test_76e22e33e129c70953f3017b237e91c33c91a285', 
    'client_secret': 'e29116aee490c76a4f56cf80595c68d0e38c83046f73cf80cd91db337964e28adfbca18c', 
    'organisationId': 'AAF0309', 
    'appIdentifier': 'AAFintech'
}

const baseUrl = "https://sandbox.moneyone.in/finpro_sandbox";

function containsConsentObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].consentHandle === obj.consentHandle) {
            return true;
        }
    }

    return false;
}

router.post('/consent/list', auth, async (req,res) => {
    //req.body contains user's phone number
    // const user = await User.findOne({phone: req.body.phone})
    // replace req.user with user everywhere in the endpoint

    const data = JSON.stringify({
        "partyIdentifierType":"MOBILE",
        "partyIdentifierValue":"1999999999", // use user's phone number instead
        "productID":"AAFINTECH001",
        "accountID":"AAFintech0073"
    })

    const config = {
        method: 'post',
        url: `${baseUrl}/v2/getconsentslist`,
        headers: headers,
        data: data
    }

    const response = await axios(config)
    const consentList = response.data.data
    consentList.map(async (consent) => {
        if(consent.status === "ACTIVE" && !containsConsentObject(consent,req.user.consent)){
            req.user.consent = req.user.consent.concat(consent)
            // client.messages
            // .create({
            //     body: 'Your subscription is complete. You will receive a monthly summary of your financial health from AAFintech',
            //     from: '+15005550006', // ${process.env.PHONE}
            //     to: `+91-8249489314` // ${req.user.phone}
            // })
            // .then(message => console.log(message.sid))
            // .catch(error => console.log(error))
            const body = "Your subscription is complete. You will receive a monthly summary of your financial health from AAFintech";
            let message_config = {
                method: 'get',
                url: `https://api.textlocal.in/send/?apikey=Ai7lm5cQEZs-0HoYDLGsVGB35E5oVwQyO8jbGfAKm1&numbers=${8249489314}&message=${body}&sender=TXTLCL`,
                headers: { 
                  'Cookie': 'PHPSESSID=l2opp3fr2npk8u4tbb0f0spuo0'
                }
              };
              
              axios(message_config)
              .then(function (response) {
                console.log(JSON.stringify(response.data));
              })
              .catch(function (error) {
                console.log(error);
              });
        }
    })
    await req.user.save()
    
    res.send(response.data)
})

// not required...will be deleted later
router.get('/consent/data', auth, async (req,res) => {
    const consentID = req.user.consent[0].consentID;
    console.log(consentID)
    const data = JSON.stringify({
        "consentID": `${consentID}`
    })

    const config = {
        method: 'post',
        url: `${baseUrl}/getallfidata`,
        headers: headers,
        data: data
    }

    let response = await axios(config)
    response = response.data.data
    response.map(async (account) => {
        if(account.Summary && account.Summary.type === "SAVINGS"){
            const d = await Deposit.find({linkReferenceNumber: account.linkReferenceNumber});
            //if(d)   continue;
            const deposit = new Deposit(account);
            await deposit.save();

            req.user.deposit = req.user.deposit.concat(deposit)
            req.user.save()
        }
    })
    res.send(response)
})


module.exports = router;