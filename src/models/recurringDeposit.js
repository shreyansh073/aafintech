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
        enum: ["OPENING","INTEREST","TDS","INSTALLMENT","CLOSING","OTHERS"]
    },
    mode: {
        type: String,
        required: true,
        enum: ["CASH", "ATM", "CARD", "UPI", "FT", "OTHERS"]
    },
    balance: {
        type: String,
        required: true,
        trim: true
    },
    transactionDateTime: {
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

const recurringDepositSchema = new mongoose.Schema({
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
        accountType: {
            type: String,
            required: true,
            enum: ["RECURRING","FLEXIBLE"],
        },
        branch: {
            type: String,
            required: true,
            trim: true
        },
        ifsc: {
            type: String,
            required: true,
            trim: true
        },
        openingDate: {
            type: String,
            trim: true
        }, 
        maturityDate: {
            type: String,
            trim: true
        }, 
        maturityAmount: {
            type: String,
            required: true,
            trim: true
        }, 
        description: {
            type: String,
            required: true,
            trim: true
        }, 
        interestPayout: {
            type: String,
            required: true,
            enum: ["MONTHLY","QUARTERLY","HALF-YEARLY","YEARLY","OnMaturity"]
        }, 
        interestRate: {
            type: String,
            required: true,
            trim: true
        }, 
        principalAmount: {
            type: String,
            required: true,
            trim: true
        }, 
        tenureDays: {
            type: String,
            required: true,
            trim: true
        }, 
        tenureMonths: {
            type: String,
            required: true,
            trim: true
        }, 
        tenureYears: {
            type: String,
            required: true,
            trim: true
        }, 
        interestComputation: {
            type: String,
            required: true,
            enum: ["SIMPLE","COMPOUND"]
        }, 
        compoundingFrequency: {
            type: String,
            required: true,
            enum: ["MONTHLY","QUARTERLY","HALF-YEARLY","YEARLY"]
        }, 
        interestPeriodicPayoutAmount: {
            type: String,
            required: true,
            trim: true
        }, 
        interestOnMaturity: {
            type: String,
            required: true,
            trim: true
        }, 
        currentValue: {
            type: String,
            required: true,
            trim: true
        }
    },
    Transactions: {
        startDate: String,
        endDate: String,
        Transaction: [transactionSchema]
    }
}, {
    timestamps: true
})

recurringDepositSchema.methods.percentageChange = async function(){
    const account = this;
    let date = new Date();
    date.setDate(date.getDate() - 30);
    const current_balance = parseInt(account.Summary.currentValue);
    let previous_balance = current_balance;
    for(const transaction of account.Transactions.Transaction){
        if(transaction.transactionTimestamp <= date){
            previous_balance = parseInt(transaction.balance);
            break;
        }
    }
    const percent = (current_balance-previous_balance)*100/previous_balance;
    return {percent: percent.toFixed(2), prev: previous_balance};
}

const RecurringDeposit = mongoose.model('RecurringDeposit', recurringDepositSchema)

module.exports = RecurringDeposit