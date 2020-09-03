const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    phone: {
        type: Number,
        unique: true,
        required: true,
    },
    vua: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    status: {
        type: String,
        enum: ["NOT-VERIFIED","VERIFIED","VUA","CONSENT_REQUEST","SUBSCRIBED","UNSUBSCRIBED"]
    },
    consent: [{
        consentID: {
            type: String,
            required: true
        },
        consentHandle: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: ["ACTIVE", "PENDING", "PAUSED", "REVOKED", "EXPIRED"]
        },
        productID: {
            type: String,
            required: true
        },
        accountID: {
            type: String,
            required: true
        },
        aaId: {
            type: String,
            required: true
        },
        vua: {
            type: String,
            required: true
        },
        consentCreationData: {
            type: Date,
            required: true
        },
        accounts: [{
            fipName: String,
            fipId: String,
            accountType: {
                type: String,
                enum: ["DEFAULT","SAVINGS","CURRENT","GSTIN"],
                default: "DEFAULT"
            },
            linkReferenceNumber: String,
            maskedAccountNumber: String,
            fiType: {
                type: String,
                enum: ["DEPOSIT","TERM-DEPOSIT","RECURRING_DEPOSIT","MUTUAL_FUNDS","CREDIT_CARD","GSTN_GSTR1","GSTN_GSTR2A","GSTN_GSTR3B"]
            }
        }]
    }],
    deposit: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deposit'
    }],
    termDeposit: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TermDeposit'
    }],
    recurringDeposit: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RecurringDeposit'
    }],
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User