const mongoose = require('mongoose')

const productScheman = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    price: Number,
    productImg: {type: String, required: true}
});

module.exports = mongoose.model('Product', productScheman);