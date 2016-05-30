var BASE_URL = "https://accounts.spotify.com";
var CLIENTID = "db2059a806b7465fb231d894936978c3";
var CLIENTSECRET = "486e6c00156a4194bd4aab210d57a786";
var USERID = "";

function setInfo(text) {
        var info = document.getElementById("info");
        info.innerHTML = text;
}

function getAuthorization() {
        var scopes = 'playlist-read-private playlist-modify-private playlist-modify-public playlist-read-collaborative';
        var params = {
                client_id: CLIENTID,
                response_type: "code",
                scope: scopes,
                redirect_uri: "http://localhost:5000/callback"
        };
        var uri = uriFromObject(params);
        var url = BASE_URL + "/authorize/?"+uri;
        url = url.slice(0, url.length - 1);
        window.location = url;
}

function getTokensFromHash() {
        if(window.location.hash) {
                var hashes = window.location.hash.slice(1).split("&");
                var access_token = hashes[0];
                var refresh_token = hashes[1];
                return ( {access_token, refresh_token});
        }    
        return null;
}

function getAccessToken(callback) {
        var tokens = JSON.parse(localStorage.howlit);
        var refresh_token = tokens.refresh_token;
        var url = "/refresh_token?refresh_token=" +refresh_token;
        var http = new XMLHttpRequest();
        http.open("GET", url, true);
        http.onreadystatechange = function() {
               if (http.readyState === 4 && http.status === 200)  {
                        tokens.access_token = JSON.parse(http.responseText).access_token;
                        localStorage.howlit = JSON.stringify(tokens);
                        callback(tokens.access_token);
               } else if (http.readyState === 4) {
                        console.log(http);
               }
        };
        http.send(null);
}
function getUser(callback) {
        getAccessToken(function (access_token) {
                var http = new XMLHttpRequest();
                http.open("GET", "https://api.spotify.com/v1/me");
                http.setRequestHeader("Authorization","Bearer " + access_token);
                http.onreadystatechange =  function() {
                       if (http.readyState === 4 && http.status === 200)  {
                                callback(JSON.parse(http.responseText));
                       }
                };
                http.send(null);
        });
}

function httpRequest(type, headers, url, params, callback) {
        var queries = uriFromObject(params);
        if (type == "GET") {
                url += queries;
                params = null;
        } else {
                params = JSON.stringify(params);
        }
        var http = new XMLHttpRequest();
        http.open(type, url, true);
        for (key in headers){
                http.setRequestHeader(key, headers[key]);
        }
        http.onreadystatechange = function () {
                if (http.readyState == 4 && (http.status == 200 || http.status == 201)) {
                        callback(http);
                }
        }
        http.send(params);

}

function addTracksToPlaylist(playlist_id, tracks) {
        console.log("Adding tracks");
        if (tracks.length == 0) {
                console.log("genre not found", tracks);
                setInfo("Sorry no tracks matched this genre");
        } else {
                getAccessToken(function(access_token) {
                        var url = "https://api.spotify.com/v1/users/" +USERID+ "/playlists/" +playlist_id+ "/tracks?";
                        var uris = [];
                        tracks.forEach(function (track) {
                                uris.push(track.uri);
                        });
                        var params = {"uris":uris};
                        httpRequest("POST", {"Authorization": "Bearer " + access_token, "Content-Type": "application/json"}, url, params, function (http) {
                                // setInfo("Playlist generated!");
                        });    
                });
                
        }
}


function getTracks(genre, litness, playlist_id) {
        getAccessToken(function (access_token) {
                var url = "https://api.spotify.com/v1/recommendations?";
                var params = {
                        "limit":50,
                        "seed_genres": genre,
                        "min_energy": litness * 0.5,
                        "min_popularity": Math.ceil(80 * litness),
                        "min_dancebility": litness * 0.25
                };
                var headers  = {"Authorization": "Bearer " + access_token};
                httpRequest("GET", headers, url, params, function(http) {
                        addTracksToPlaylist(playlist_id, JSON.parse(http.responseText).tracks);
                });

        });
}

function getPlaylistWebApi(genre, litness) {
        if (!USERID) {
                getUser(function (user) {
                        USERID = user.id;
                        getPlaylistWebApi(genre, litness);
                        return;
                });
        } else {
                getAccessToken(function (access_token) {
                        var title = getTitle(litness);
                        setInfo(title);
                        var is_public = false;
                        var params = {
                                "name": title,
                                "public": is_public

                        };
                        // var params = uriFromObject(params);
                        var http = new XMLHttpRequest();
                        var url = "https://api.spotify.com/v1/users/" + USERID + "/playlists";
                        http.open("POST", url, true);
                        http.onreadystatechange = function() {
                                if (http.readyState == 4 && (http.status == 200 || http.status == 201)) {

                                        getTracks(genre, litness, JSON.parse(http.responseText).id);
                                }
                        }
                        http.setRequestHeader("Authorization", "Bearer " +access_token);
                        http.setRequestHeader("Content-Type", "application/json");
                        http.send(JSON.stringify(params));
                });
        }
}



function checkLoginStatus() {
        //check if tokens exist in hash of location
        var tokens = getTokensFromHash();
        //if they exist store them in localstorage and remove connect to spotify link
        if (tokens) {
                localStorage.howlit = JSON.stringify(tokens);
                document.getElementById("Rap").style.display = "none";
                document.getElementById("connect2spotify").style.display = "none";
                document.getElementById("search").style.display = "none";
                getPlaylist = getPlaylistWebApi;
        //otherwise check localstorage to see if they are already stored
        } else if (localStorage.howlit) {
                getPlaylist = getPlaylistWebApi;
                document.getElementById("connect2spotify").style.display = "none";
                document.getElementById("Rap").style.display = "none";
                document.getElementById("search").style.display = "none";
        }

}



window.addEventListener("load", checkLoginStatus);
