const express = require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')

const api = express()

const port = process.env.PORT || 3000;

api.use(express.json())
api.use(userRouter)

api.listen(port, () => {
    console.log('Server is up on port ' + port)
})