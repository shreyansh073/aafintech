const User = require('../models/user');
const Deposit = require('../models/deposit');
const RecurringDeposit = require('../models/recurringDeposit');
const TermDeposit = require('../models/termDeposit')

const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_SECRET);

const generateSummary = async (user) => {
    console.log("generating summary");

    let netWorth = 0;

    let body = "Your monthly account summary: \n\n";

    body = body + "DEPOSITS: \n";
    for await (const deposit_id of user.deposit){
        const deposit = await Deposit.findOne({_id: deposit_id});
        body = body + `Account Number: ${deposit.maskedAccountNumber}\nCurrent Balance: ${deposit.Summary.currentBalance}\nPercentage Change: ${deposit.percentageChange()}%\n\n`;
        netWorth = netWorth + parseInt(deposit.Summary.currentBalance)
    }

    body = body + "TERM_DEPOSITS: \n";
    for await (const term_deposit_id of user.termDeposit){
        const term_deposit = await TermDeposit.findOne({_id: term_deposit_id});
        body = body + `Account Number: ${term_deposit.maskedAccountNumber}\nCurrent Balance: ${term_deposit.Summary.balance}\nPercentage Change: ${term_deposit.percentageChange()}%\n\n`;
        netWorth = netWorth + parseInt(term_deposit.Summary.balance)
    }

    body = body + "RECURRING_DEPOSITS: \n";
    for await (const recurring_deposit_id of user.recurringDeposit){
        const recurring_deposit = await RecurringDeposit.findOne({_id: recurring_deposit_id});
        body = body + `Account Number: ${recurring_deposit.maskedAccountNumber}\nCurrent Balance: ${recurring_deposit.Summary.balance}\nPercentage Change: ${recurring_deposit.percentageChange()}%\n\n`;
        netWorth = netWorth + parseInt(recurring_deposit.Summary.balance)
    }

    body = body + `NET WORTH: ${netWorth}`

    client.messages
    .create({
        body: body,
        from: '+15005550006',
        to: `${user.phone}`
    })
    .then(message => console.log(message.sid))
    .catch(error => console.log(error))
}

const summary = async () => {
    for await (const user of User.find()) {
        await generateSummary(user);
    }
}

module.exports = summary;