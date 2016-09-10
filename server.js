var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var validator = require('validator'); 
var common = require('./common');

var client_id = "db2059a806b7465fb231d894936978c3";
var client_secret = "486e6c00156a4194bd4aab210d57a786";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname));

var redirect_uri = encodeURI("http://" + "howlit.me" + "/callback");

app.get("/login", function (req, res) {
        var scopes = 'playlist-read-private playlist-modify-private playlist-modify-public playlist-read-collaborative';
        var params = {
                "client_id": client_id,
                "response_type": "code",
                "scope": scopes,
                "redirect_uri": redirect_uri
        };
        var uri = common.uriFromObject(params);
        var url =  "https://accounts.spotify.com/authorize/?"+uri;
        url = url.slice(0, url.length - 1);
        return res.redirect(url);
});

app.get("/callback", function (req, res) {
        if (req.query.code == undefined) {
                console.log(req.query.error);
        } else {
                var params = {
                        url : "https://accounts.spotify.com/api/token",
                        form : {
                                "code": req.query.code,
                                "client_id": client_id,
                                "client_secret": client_secret,
                                "redirect_uri": redirect_uri,
                                "grant_type": "authorization_code"

                        },
                        json : true
                };
                request.post(params,function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                                var access_token = body.access_token;
                                var refresh_token = body.refresh_token;
                                res.redirect('/#' +access_token+ '&' +refresh_token);
                        } else {
				console.log(error, response.statusCode);
			}
                });
        }
});

app.get("/refresh_token", function (req, res) {
        var refresh_token = req.query.refresh_token;
        var params = {
                url : "https://accounts.spotify.com/api/token",
                form : {
                        "grant_type ": "refresh_token",
                        "refresh_token ": refresh_token,
                        "client_secret ": client_secret,
                        "client_id ": client_id
                },
                json: true
        };
        request.post(params, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                        res.send({"access_token": body.access_token});
                } else if (error) {
                        console.log(error);
                }
        });
});


app.listen(process.env.PORT || 5000); 
