const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
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

router.post('/users', async (req, res) => {
    let user = await User.findOne({phone:req.body.phone, vua: req.body.vua})
    if(user){
        res.status(400).send("User already exists");
    }
    try {
        user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()

        const data = JSON.stringify({
            "partyIdentifierType":"MOBILE",
            "partyIdentifierValue":"1999999999", // use user's phone number instead
            "productID":"AAFINTECH001",
            "accountID":"AAFintech0073",
            "vua":"1999999999@onemoney" // user's vua instead
        })
    
        const config = {
            method: 'post',
            url: `${baseUrl}/v2/requestconsent`,
            headers: headers,
            data: data
        }
    
        const response = await axios(config)
        res.status(201).send({ user, token, consent_handle: response.data.data.consent_handle ,url: "https://aa-sandbox.onemoney.in/onemoney-webapp/auth/login" })
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'vua', 'phone']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})
module.exports = router