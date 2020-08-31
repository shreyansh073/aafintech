const User = require('../models/user')

const generateSummary = (user) => {
    console.log("generating summary")
}

const summary = async () => {
    for await (const user of User.find()) {
        await generateSummary(user);
    }
}

module.exports = summary;