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
})

const transactionSchema = new mongoose.Schema({
    txnId: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: mongoose.Decimal128,
        required: true,
    },
    narration: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ["CREDIT","DEBIT"]
    },
    mode: {
        type: String,
        required: true,
        enum: ["CASH", "ATM", "CARD", "UPI", "FT", "OTHERS"]
    },
    currentBalance: {
        type: String,
        required: true,
        trim: true
    },
    transactionTimestamp: {
        type: Date,
        required: true,
    },
    valueDate: {
        type: String,
        required: true,
        trim: true
    },
    reference: {
        type: String,
        required: true,
        trim: true
    },
})

const depositSchema = new mongoose.Schema({
    maskedAccountNumber: {
        type: String,
        required: true,
        trim: true
    },
    linkReferenceNumber: {
        type: String,
        required: true,
        trim: true
    },
    bank: {
        type: String,
        required: true,
        trim: true 
    },
    Profile: {
        Holders: {
            type: {
                type: String,
                enum: ["SINGLE","JOINT"],
                default: "SINGLE",
                required: true,
            },
            Holder: [holderSchema]
        }
    },
    Summary: {
        currentBalance: {
            type: String,
            required: true,
            trim: true
        },
        currency: {
            type: String,
        },
        exchgeRate: {
            type: String,
        },
        type: {
            type: String,
            required: true,
            enum: ["CURRENT","SAVINGS"],
            default: "SAVINGS"
        },
        branch: {
            type: String,
            required: true,
            trim: true
        },
        facility: {
            type: String,
            required: true,
            enum: ["OD","CC"],
            default: "OD"
        },
        ifscCode: {
            type: String,
            required: true,
            trim: true
        },
        micrCode: {
            type: String,
            required: true,
            trim: true
        },
        openingDate: {
            type: String,
            required: true,
            trim: true
        },
        currentODLimit: {
            type: String,
            required: true,
            trim: true
        },
        drawingLimit: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            required: true,
            enum: ["ACTIVE","INACTIVE"],
            default: "INACTIVE"
        },    
        Pending: [{
            amount:{
                type: mongoose.Decimal128,
                required: true
            },
            transactionType: {
                type: String,
                enum: ["CREDIT","DEBIT"]
            }
        }]    
    },
    Transactions: {
        startDate: String,
        endDate: String,
        Transaction: [transactionSchema]
    }
}, {
    timestamps: true
})

depositSchema.methods.percentageChange = async function(){
    const deposit = this;
    let date = new Date();
    date.setDate(date.getDate() - 30);
    const current_balance = parseInt(deposit.Summary.currentBalance);
    let previous_balance = current_balance;
    for(const transaction of deposit.Transactions.Transaction){
        if(transaction.transactionTimestamp <= date){
            previous_balance = parseInt(transaction.currentBalance);
            break;
        }
    }
    const percent = (current_balance-previous_balance)*100/previous_balance;
    return {percent: percent.toFixed(2), prev: previous_balance};
}

const Deposit = mongoose.model('Deposit', depositSchema)

module.exports = Deposit