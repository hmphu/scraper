const fetch = require("node-fetch");
const cheerio = require("cheerio");

// ORM and model import
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const opportunitySchema = require("./schemas/opportunity");
const Opportunity = mongoose.model("Opportunity", opportunitySchema);

// to be set to the cheerio object later.
let $ = null;

const baseurl = "https://www.crowdcube.com";
const crowdcubeUrl = baseurl + "/investments?order=date_activated";

// fetch the JSON-formatted string of investments.
async function getDataFromJsonCall(url) {
    let res = await fetch(url, {
        headers: { "x-requested-with": "XMLHttpRequest" }
    });
    if (res.status !== 200) {
        console.err("Bad response "+res.status);
        console.err(res.text());
        throw new Error();
    }
    let json = await res.json();
    return json;
}

// thanks http://stackoverflow.com/a/22021709/5678545
function unicodeToChar(text) {
    return text.replace(/\\u[\dA-F]{4}/gi, 
        function (match) {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16));
        });
}

// parse investment information from the <section> tag
function parseInvestment(investment) {

    let id = $(investment).data("opportunity-id");
    let name = $(investment).data("opportunity-name");
    let raised = parseInt($(investment).data("opportunity-raised"));
    let progress = parseInt($(investment).data("opportunity-progress"));
    let equity = parseFloat($(investment).data("opportunity-equity"));

    let url = baseurl + $(investment).find(".cc-card__link").attr("href");

    let targetEl = $(investment).find(".cc-card__raisedTotal");
    // parse target from "£999,999 target"
    let target = parseInt($(targetEl).text().match(/\d/g).join(""));

    let description = $(investment).find(".cc-card__body p").text();
    let imgUrl = $(investment).find(".cc-card__emblemImage").attr("src");
    // regex to replace "url("something.jpg");" with "something.jpg"
    let coverUrl = $(investment).find(".cc-card__cover").css("background-image").replace(/(url\('|'\);)/g, "");

    return {
        id: id,
        name: name,
        description: description,
        url: url,
        target: target,
        equity: equity,
        logoImgUrl: imgUrl,
        coverImgUrl: coverUrl,
        funding: [
            {
                raised: raised,
                progress: progress
            }
        ]
    };
}

// scrape the returned json object for each investment, then iterate over them
function scrape(html) {
    html = unicodeToChar(html);
    
    let investments = [];
    $ = cheerio.load(html);
    $(".cc-card").each((i, el) => {
        let investment = parseInvestment(el);
        investments.push(investment);
    });
    return investments;
}

async function main() {
    let done = false;
    let cursorNext = "";
    while (!done) {
        let url = crowdcubeUrl;
        // add cursor if neccesary.
        url = (cursorNext)? url + "&cursor=" + cursorNext : url;
        let data = await getDataFromJsonCall(url);
        let scrapedData = await scrape(data.content);

        //TODO: Save to mongo.db
        for (let x of scrapedData) {
            let query = Opportunity.findOne({id: x.id});
            let res = await query.exec();
            if (res === null) {
                let opp = new Opportunity(x);
                await opp.save();
            }
            else {
                res.funding.push(x.funding[0]);
                await res.save();
            }
        }
        cursorNext = data.cursorNext;
        done = (cursorNext == null);
    }
}

// connect to database.
mongoose.connect(process.env.MONGO? process.env.MONGO : "mongodb://localhost/scraper");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "error connecting to mongo: "));
db.once("open", () => {
    main(db).then(() => {
        console.log("All done!");
        process.exit(0);
    });
});
