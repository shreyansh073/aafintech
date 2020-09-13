const User = require('../models/user');
const Deposit = require('../models/deposit');
const RecurringDeposit = require('../models/recurringDeposit');
const TermDeposit = require('../models/termDeposit')

//const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_SECRET);
const axios = require('axios').default;

const generateSummary = async (user) => {
    console.log("generating summary");

    let netWorth = 0;

    let body = "Your monthly account summary: \n\n";

    body = body + "DEPOSITS: \n";
    for await (const deposit_id of user.deposit){
        const deposit = await Deposit.findOne({_id: deposit_id});
        body = body + `Bank: ${deposit.bank}\nAccount Number: ${deposit.maskedAccountNumber}\nCurrent Balance: ${deposit.Summary.currentBalance}\nPercentage Change: ${await deposit.percentageChange()}%\n\n`;
        netWorth = netWorth + parseInt(deposit.Summary.currentBalance)
    }

    body = body + "TERM_DEPOSITS: \n";
    for await (const term_deposit_id of user.termDeposit){
        const term_deposit = await TermDeposit.findOne({_id: term_deposit_id});
        body = body + `Bank: ${term_deposit.bank}\nAccount Number: ${term_deposit.maskedAccountNumber}\nCurrent Balance: ${term_deposit.Summary.currentValue}\nPercentage Change: ${await term_deposit.percentageChange()}%\n\n`;
        netWorth = netWorth + parseInt(term_deposit.Summary.currentValue)
    }

    body = body + "RECURRING_DEPOSITS: \n";
    for await (const recurring_deposit_id of user.recurringDeposit){
        const recurring_deposit = await RecurringDeposit.findOne({_id: recurring_deposit_id});
        body = body + `Bank: ${recurring_deposit.bank}\nAccount Number: ${recurring_deposit.maskedAccountNumber}\nCurrent Balance: ${recurring_deposit.Summary.currentValue}\nPercentage Change: ${await recurring_deposit.percentageChange()}%\n\n`;
        netWorth = netWorth + parseInt(recurring_deposit.Summary.currentValue)
    }

    body = body + `NET WORTH: ${netWorth}`
    console.log(body)

    // client.messages
    // .create({
    //     body: body,
    //     from: '+15005550006',
    //     to: `+91-8249489314` //${user.phone}
    // })
    // .then(message => {
    //     console.log(message.sid);
    // })
    // .catch(error => console.log(error))

    let config = {
        method: 'get',
        url: `https://api.textlocal.in/send/?apikey=Ai7lm5cQEZs-0HoYDLGsVGB35E5oVwQyO8jbGfAKm1&numbers=${8504067605}&message=${body}&sender=TXTLCL`,
        headers: { 
          'Cookie': 'PHPSESSID=l2opp3fr2npk8u4tbb0f0spuo0'
        }
      };
      
      axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
      
}

const summary = async () => {
    for await (const user of User.find()) {
        await generateSummary(user);
    }
}

module.exports = summary;