const mongoose = require('mongoose');

//to make any order, i would need a reference to the order table.
//to let the database know which product im going to order
//to achieve this functionality, i'll use the ref function

const OrderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    //providing the details about the product which im about to order
    //from the table "Product"
    product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', require: true},
    quantity: {type: Number, default: 1}
})


module.exports = mongoose.model('Order', OrderSchema)