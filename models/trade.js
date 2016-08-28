var  mongoose = require('mongoose');

var tradeSchema = new mongoose.Schema({
    fromUser: String,
    toUser: String,
    book: String,
    status: String
});

var Trade = mongoose.model("Trade", tradeSchema);
module.exports = Trade;