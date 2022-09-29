
const mongoose = require('mongoose');
const { Schema } = mongoose;

const BillSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    billno: {
        type: String,
        required: true,
        unique: true,
    },
    product: {
        type: String,
        required: true,

    },
    price: {
        type: String,
        required: true,


    }
});
const Bill = mongoose.model('Bill', BillSchema);
module.exports = Bill;



