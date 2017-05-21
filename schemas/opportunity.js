const mongoose = require("mongoose");

module.exports = mongoose.Schema({
    id: String,
    name: String,
    description: String,
    url: String,
    target: Number,
    equity: Number,
    logoImgUrl: String,
    coverImgUrl: String,

    // list of updates to amount raised over time.
    funding: [
        {
            timeFetched: { type: Date, default: Date.now },
            raised: Number,
            progress: Number
        }
    ]
})
