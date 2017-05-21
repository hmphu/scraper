const express = require("express");
const app = express();

// db connection
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const opportunitySchema = require("./schemas/opportunity");
const Opportunity = mongoose.model("Opportunity", opportunitySchema);

let dbUrl = process.env.MONGO || "mongodb://localhost/scraper";
mongoose.connect(dbUrl);
const db = mongoose.connection;

app.get("/api/opportunity/:id/", (req, res) => {
    let query = Opportunity.findOne({id: req.params.id});
    query.select("-_id -__v");
    query.exec().then(result => {
        res.status(200).json(result);
    });
});

app.get("/api/opportunity/", (req, res) => {
    let query = Opportunity.find();
    query.select("-_id -__v");
    query.exec().then(result => {
        res.status(200).json(result);
    });
});


// connect and start serving.
db.on("error", console.error.bind(console, "error connecting to mongo: "));
db.once("open", () => {
    app.listen(process.env.PORT || 3000, () => {
        console.log("Listening on " + (process.env.PORT || 3000));
    });
});
