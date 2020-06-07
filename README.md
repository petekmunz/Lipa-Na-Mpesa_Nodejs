# Lipa Na Mpesa Online

A Nodejs implementation of Safaricom's Lipa na Mpesa Online Payment Api. Use this as a starting point template for your app.

## Requirements

Credentials are required including:

* Consumer Key
* Consumer Secret
* Passkey

The consumer key & secret can be obtained by registering for an account here [https://developer.safaricom.co.ke/](https://developer.safaricom.co.ke/) and once you have an account, the passkey can be got here [https://developer.safaricom.co.ke/test_credentials](https://developer.safaricom.co.ke/test_credentials)

## Installing

To automatically get the correct dependencies used in this project, ensure you have [Node.js](https://nodejs.org/en/download/) installed then:

1. Clone the project by running `git clone https://github.com/petekmunz/Lipa-Na-Mpesa_Nodejs.git` in your Git terminal.
2. In your terminal ensure you are in the directory `Lipa-Na-Mpesa_Nodejs` then run `npm install`

## Pre-requirements

* Create a .env file in the root directory with the following variables.

```
NODE_ENV=development
MYPORT=3000                 //You can set to your preferrable port
CONSUMER_KEY=******************
CONSUMER_SECRET=***************
PASSKEY=***************
SHORTCODE=174379            //This is the test shortcode
```

* In the [app.js](./app.js) file, replace the url here `"CallBackURL": "http://example.com/api/v1/c2bconfirmation"` with your actual callback url. The endpoint needs to be exposed to the internet if it is to receive a payload from Safaricom.

## Running

* Make a POST request to the `/mpesa` endpoint with a JSON with the parameters as in the example below

```
{
    "phoneNumber":"254722xxxxxx",
    "amount":11
}
```

When all the required variables have been input, a succesful request will result in a STK push as shown below

<img src="screenshot/successful_request.png" width="300"/> 
