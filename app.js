const prettyjson = require('prettyjson'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    axios = require('axios'),
    config = require('./config'),
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    consumer_key = config.consumerKey,
    consumer_secret = config.secret,
    passkey = config.passkey,
    shortcode = config.shortcode,
    port = config.port,
    auth = "Basic " + Buffer.from(`${consumer_key}:${consumer_secret}`).toString("base64");

let oauth_token;

const prettyJsonOptions = {
    noColor: true
};
app.use(bodyParser.json());

async function getOauthToken() {
    try {
        let response = await axios.get(url, {
            headers: {
                "Authorization": auth
            }
        })
        oauth_token = response.data.access_token;
    } catch (error) {
        console.log("Auth Error: ", error.response);
    }
}

function startInterval(seconds) {
    setInterval(function () { getOauthToken() }, seconds * 1000);
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

app.post("/mpesa", function (req, res) {
    if (req.body.phoneNumber && req.body.amount) {
        let timestamp = formatDate();
        let url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            password = Buffer.from(shortcode + passkey + timestamp).toString("base64"),
            auth = "Bearer " + oauth_token;
        axios({
            method: 'POST',
            url: url,
            headers: {
                "Authorization": auth
            },
            data: {
                "BusinessShortCode": shortcode,                     //Your Business ShortCode
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": req.body.amount,                          //Amount to be paid
                "PartyA": req.body.phoneNumber,                     //Number sending funds
                "PartyB": shortcode,                                //Business ShortCode receiving funds   
                "PhoneNumber": req.body.phoneNumber,                //Number sending funds
                "CallBackURL": "http://example.com/api/v1/c2bconfirmation", //Your confirmation Url
                "AccountReference": "Example",                      //Name to display to receiver of STK Push
                "TransactionDesc": "Testing mpesa"                  //Description of Transaction
            }
        }).then(response => {
            res.status(200).send('Stk push sent to phone');
            let responseBody = response.data;
            //Using the above responseBody handle the data.
        }).catch(error => {
            res.status(500).send('There was an error');
            console.error(`LNMO error is: ${error}`);
        });
    } else {
        res.status(400).send('Bad request');
    }
});

// C2B ConfirmationURL - /api/v1/c2b/confirmation
app.post('/api/v1/c2b/confirmation', function (req, res) {
    console.log('-----------C2B CONFIRMATION REQUEST------------');
    console.log(prettyjson.render(req.body, prettyJsonOptions));
    console.log('-----------------------');

    let message = {
        "ResultCode": 0,
        "ResultDesc": "Success"
    };
    res.json(message);
});

//Get auth token then start server
getOauthToken().then(() => {
    //Token gotten successfully, we can now start to listen
    app.listen(port, function () {
        //Request New OAuth-Token after every 58mins since tokens expire after 1hr.
        startInterval(3499);
        console.log(`MPESA Server has started at port: ${port}`);
    });
});
