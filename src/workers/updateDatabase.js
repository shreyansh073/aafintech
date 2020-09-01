const axios = require('axios').default;
const User = require('../models/user')
const Deposit = require('../models/deposit')
const CreditCard = require('../models/creditcard')
const TermDeposit = require('../models/termDeposit')
const RecurringDeposit = require('../models/recurringDeposit')

const headers = {
    'Content-Type': 'application/json', 
    'client_id': 'fp_test_76e22e33e129c70953f3017b237e91c33c91a285', 
    'client_secret': 'e29116aee490c76a4f56cf80595c68d0e38c83046f73cf80cd91db337964e28adfbca18c', 
    'organisationId': 'AAF0309', 
    'appIdentifier': 'AAFintech'
}

const baseUrl = "https://sandbox.moneyone.in/finpro_sandbox";

const updateUser = async (user) => {
    const consentID = user.consent[0].consentID;
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
        if(!account.Summary){
            return;
        }
        if(["CURRENT","SAVINGS"].indexOf(account.Summary.type) > -1){
            const d = await Deposit.findOne({linkReferenceNumber: account.linkReferenceNumber});
            if(d){
                const _id = d._id;
                await User.replaceOne({_id}, account)
            }
            else{
                const deposit = new Deposit(account);
                await deposit.save();

                user.deposit = user.deposit.concat(deposit)
                user.save()
            }
        }
        else if(["FIXED","SWEEP","TAX-SAVING","FCNR"].indexOf(account.Summary.accountType) > -1){
            const d = await TermDeposit.findOne({linkReferenceNumber: account.linkReferenceNumber});
            if(d){
                const _id = d._id;
                await User.replaceOne({_id}, account)
            }
            else{
                const termDeposit = new TermDeposit(account);
                await termDeposit.save();

                user.termDeposit = user.termDeposit.concat(termDeposit)
                user.save()
            }
        }
        else if(["RECURRING","FLEXIBLE"].indexOf(account.Summary.accountType) > -1){
            const d = await RecurringDeposit.findOne({linkReferenceNumber: account.linkReferenceNumber});
            if(d){
                const _id = d._id;
                await User.replaceOne({_id}, account)
            }
            else{
                const recurringDeposit = new RecurringDeposit(account);
                await recurringDeposit.save();

                user.recurringDeposit = user.recurringDeposit.concat(recurringDeposit)
                user.save()
            }
        }
    })
}

const update = async () => {
    for await (const user of User.find()) {
        await updateUser(user);
    }
}

module.exports = update;

