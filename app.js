const prettyjson = require('prettyjson'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    request = require('request'),
    consumer_key = "YOUR CONSUMER_KEY HERE",
    consumer_secret = "YOUR CONSUMER_SECRET HERE",
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    auth = "Basic " + Buffer.from(consumer_key + ":" + consumer_secret).toString("base64");

var oauth_token;

const prettyJsonOptions = {
    noColor: true
};
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function getOauthToken() {
    request(
        {
            url: url,
            headers: {
                "Authorization": auth
            }
        },
        function (error, response, body) {
            // TODO: Use the body object to extract OAuth access token
            let parsedData = JSON.parse(body);
            oauth_token = (parsedData["access_token"]);
        }
    );
}

function startInterval(seconds, callbackFun) {
    callbackFun();
    let intervalVar = setInterval(callbackFun, seconds * 1000);
    return intervalVar;
}

function pad2(n) { return n < 10 ? '0' + n : n }

function formatDate() {
    let date = new Date();
    let correctDate =
        date.getFullYear().toString() +
        pad2(date.getMonth() + 1) +
        pad2(date.getDate()) +
        pad2(date.getHours()) +
        pad2(date.getMinutes()) +
        pad2(date.getSeconds());
    return correctDate;
}

//Request New OAuth-Token on server start & after every 58mins(To be on the safe side) since tokens expire after 1hr.
startInterval(3499, getOauthToken);

app.get("/mpesa", function (req, res) {
    //Replace With Your Own Values Where Necessary
    let timestamp = formatDate();
    let url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        passwordVar = Buffer.from("YOUR BUSINESS_SHORTCODE" + "YOUR PASSKEY HERE" + timestamp).toString("base64"),
        auth = "Bearer " + oauth_token;
    request(
        {
            method: 'POST',
            url: url,
            headers: {
                "Authorization": auth
            },
            json: {
                "BusinessShortCode": "174379",              //Your Business ShortCode
                "Password": passwordVar,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": "11",                             //Amount to be paid
                "PartyA": "254722xxxxxx",                   //Number sending funds
                "PartyB": "174379",                         //Business ShortCode receiving funds   
                "PhoneNumber": "254722xxxxxx",              //Number sending funds
                "CallBackURL": "https://example.com/confirmation", //Your confirmation Url
                "AccountReference": "Example",              //Name to display to receiver of STK Push
                "TransactionDesc": "Testing mpesa"          //Description of Transaction
            }
        },
        function (error, response, body) {
            if (error) {
                //Handle the error
            } else {
                // TODO: Use the body object to extract the response

            }
        }
    )

});

// C2B ConfirmationURL - /api/v1/c2b/confirmation
app.post('/confirmation', function (req, res) {
    console.log('-----------C2B CONFIRMATION REQUEST------------');
    console.log(prettyjson.render(req.body, prettyJsonOptions));
    console.log('-----------------------');
    let message = req.body;
    //Handle the message data
    res.json(message);  //Sample handling, don't replicate in production
});

//Start Server
var port = process.env.PORT || 80;
app.listen(port, process.env.IP, function () {
    console.log("MPESA Server has started at port: " + port);
});