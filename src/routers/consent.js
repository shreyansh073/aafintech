const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth');
const Deposit = require('../models/deposit');
const axios = require('axios').default;
const router = new express.Router()

const headers = {
    'Content-Type': 'application/json', 
    'client_id': 'fp_test_76e22e33e129c70953f3017b237e91c33c91a285', 
    'client_secret': 'e29116aee490c76a4f56cf80595c68d0e38c83046f73cf80cd91db337964e28adfbca18c', 
    'organisationId': 'AAF0309', 
    'appIdentifier': 'AAFintech'
}

const baseUrl = "https://sandbox.moneyone.in/finpro_sandbox";

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        console.log(list[i].consentHandle)
        console.log(obj.consentHandle)
        if (list[i].consentHandle === obj.consentHandle) {
            return true;
        }
    }

    return false;
}

router.get('/consent/list', auth, async (req,res) => {
    const data = JSON.stringify({
        "partyIdentifierType":"MOBILE",
        "partyIdentifierValue":"1999999999",
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
        if(consent.status === "ACTIVE" && !containsObject(consent,req.user.consent)){
            req.user.consent = req.user.consent.concat(consent)
        }
    })
    await req.user.save()
    res.send(response.data)
})

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
            const deposit = new Deposit(account);
            await deposit.save();

            req.user.deposit = req.user.deposit.concat(deposit)
            req.user.save()
        }
    })
    res.send(response)
})


module.exports = router;