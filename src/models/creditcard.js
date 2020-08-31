const mongoose = require('mongoose')
const validator = require('validator')

const holderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    dob: {
        type: Date,
        required: true,
    },
    mobile: {
        type: Number,
        required: true,
    },
    nominee: {
        type: String,
        required: true,
        enum: ["REGISTERED","NOT-REGISTERED"]
    },
    landline: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    dematId:{
        type: String,
        required: true
    },
    pan: {
        type: String,
        required: true,
        trim: true
    },
    ckycCompliance: {
        type: String,
        required: true,
        trim: true
    },
    Cards: [{
        cardType: {
            type: String,
            required: true,
            enum: ["MASTER_CARD", "VISA", "RUPAY", "OTHERS"]
        },
        primary: {
            type: String,
            required: true,
            enum: ["YES", "NO"]
        },
        issueDate: {
            type: String,
            required: true,
        },
        maskedCardNumber: {
            type: String,
            required: true
        }
    }]
})

const transactionSchema = new mongoose.Schema({
    txnId: {
        type: String,
        required: true,
        trim: true
    },
    txnType: {
        type: String,
        required: true,
        enum: ["CREDIT","DEBIT"]
    },
    txnDate: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: String,
        required: true,
        trim: true
    },
    statementDate: {
        type: String,
        required: true,
        trim: true
    },
    mcc: {
        type: String,
        required: true,
        trim: true
    },
    maskedCardNumber: {
        type: String,
        required: true,
        trim: true
    },
    narration: {
        type: String,
        required: true,
    },
    valueDate: {
        type: String,
        required: true,
        trim: true
    }
})

const creditCardSchema = new mongoose.Schema({
    accountNumber: {
        type: String,
        required: true,
        trim: true
    },
    linkReferenceNumber: {
        type: String,
        required: true,
        trim: true
    },
    credit_card_data: {
        Profile: {
            Holders: {
                Holder: [holderSchema]
            }
        },
        Summary: {
            currentDue: {
                type: String,
                required: true,
                trim: true
            },
            lastStatementDate: {
                type: String,
                required: true,
                trim: true
            },
            dueDate: {
                type: String,
                required: true,
                trim: true
            },
            previousDueAmount: {
                type: String,
                required: true,
                trim: true
            },
            totalDueAmount: {
                type: String,
                required: true,
                trim: true
            },
            minDueAmount: {
                type: String,
                required: true,
                trim: true
            },
            creditLimit: {
                type: String,
                required: true,
                trim: true
            },
            cashLimit: {
                type: String,
                required: true,
                trim: true
            },
            availableCredit: {
                type: String,
                required: true,
                trim: true
            },
            loyaltyPoints: {
                type: String,
                required: true,
                trim: true
            },
            financeCharges: {
                type: String,
                required: true,
                trim: true
            },
        },
        Transactions: {
            startDate: String,
            endDate: String,
            Transaction: [transactionSchema]
        }
    }
}, {
    timestamps: true
})

const CreditCard = mongoose.model('CreditCard', creditCardSchema)

module.exports = CreditCard