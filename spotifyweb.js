var USERID = "";

function setInfo(text) {
        var info = document.getElementById("info");
        info.innerHTML = text;
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


function addTracksToPlaylist(playlist, tracks) {
        console.log("Adding tracks");
        if (tracks.length == 0) {
                console.log("genre not found", tracks);
                setInfo("Sorry no tracks matched this genre");
        } else {
                getAccessToken(function(access_token) {
                        var url = "https://api.spotify.com/v1/users/" +USERID+ "/playlists/" +playlist.id+ "/tracks?";
                        var uris = [];
                        tracks.forEach(function (track) {
                                uris.push(track.uri);
                        });
                        var params = {"uris":uris};
                        httpRequest("POST", {"Authorization": "Bearer " + access_token, "Content-Type": "application/json"}, 
                                url, params, function (http) {
                                        setInfo(playlist.name);
                                        document.getElementById("submit").innerHTML = "Go Again"
                                        var play = document.getElementById("play");
                                        play.style.display = "initial";
                                        document.getElementById("loading").style.display = "none";
                                        play.onclick = function() {
                                                window.open(playlist.uri);
                                        }
                        });    
                });
                
        }
}


function getTracks(genre, litness, playlist) {
        getAccessToken(function (access_token) {
                var url = "https://api.spotify.com/v1/recommendations?";
                var params = {
                        "limit":50,
                        "seed_genres": genre,
                        "min_energy": litness * 0.7,
                        "min_dancebility": litness * 0.25
                };
                var headers  = {"Authorization": "Bearer " + access_token};
                httpRequest("GET", headers, url, params, function(http) {
                        addTracksToPlaylist(playlist, JSON.parse(http.responseText).tracks);
                });

        });
}

function getPlaylistWebApi(genre, litness) {
        setInfo("Generating playlist...");
        document.getElementById("loading").style.display = "initial";
        if (!USERID) {
                getUser(function (user) {
                        USERID = user.id;
                        getPlaylistWebApi(genre, litness);
                        return;
                });
        } else {
                getAccessToken(function (access_token) {
                        var title = getTitle(litness);
                        var is_public = false;
                        var params = {
                                "name": title,
                                "public": is_public

                        };
                        var http = new XMLHttpRequest();
                        var url = "https://api.spotify.com/v1/users/" + USERID + "/playlists";
                        http.open("POST", url, true);
                        http.onreadystatechange = function() {
                                if (http.readyState == 4 && (http.status == 200 || http.status == 201)) {

                                        getTracks(genre, litness, JSON.parse(http.responseText));
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
