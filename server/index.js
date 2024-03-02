const express = require('express')
const request = require('request');
const dotenv = require('dotenv');

const port = 8801

global.access_token = ''

dotenv.config()

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET

var spotify_redirect_uri = 'http://localhost:3000/auth/callback'

/* 
Function to generate a random state value in the authorization request
  to protect against attacks 
*/
var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Express is a lightweight Node.js web app framework 
var app = express();

// redirects users to log in to their Spotify accounts 
app.get('/auth/login', (req, res) => {

  var scope = "streaming user-read-email user-read-private"
  var state = generateRandomString(16);

  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state
  })

  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
})

app.get('/auth/callback', (req, res) => {

  var code = req.query.code;

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: spotify_redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
      'Content-Type' : 'application/x-www-form-urlencoded'
    },
    json: true
  };

  // make a post request to get the token with the authorization code  
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      // store access token locally 
      access_token = body.access_token;
      // redirect to /
      res.redirect('/')
    }
  });

})

// return the access token 
app.get('/auth/token', (req, res) => {
  res.json({ access_token: access_token})
})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
