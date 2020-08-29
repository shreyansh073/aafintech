const express = require('express')
require('./db/mongoose')

const axios = require('axios');

const api = express()
const port = process.env.PORT || 2000;

const userRouter = require('./routers/user')
const consentRouter = require('./routers/consent')

api.use(express.json())
api.use(userRouter)
api.use(consentRouter)

api.listen(port, () => {
    console.log('Server is up on port ' + port)
})