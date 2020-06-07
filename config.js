const dotenv = require('dotenv');

//Set up your environment variables from the .env file
dotenv.config();
module.exports = {
    consumerKey: process.env.CONSUMER_KEY,
    secret: process.env.CONSUMER_SECRET,
    passkey: process.env.PASSKEY,
    shortcode: process.env.SHORTCODE,
    port: process.env.MYPORT
};