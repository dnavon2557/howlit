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
        httpRequest("GET",'', url,'', function(http) {
                tokens.access_token =JSON.parse(http.responseText).access_token;
                localStorage.howlit =JSON.stringify(tokens);
                callback(tokens.access_token);
        });
}
function getUser(callback) {
        getAccessToken(function (access_token) {
                httpRequest("GET", {"Authorization":"Bearer " + access_token},
                        "http://api.spotify.com/v1/me", "", function (http) {
                                callback(JSON.parse(http.responseText));
                        });
        });
}
function addTracksToPlaylist(playlist, tracks) {
        if (tracks.length == 0) {
                console.log("genre not found", tracks);
                setInfo("Sorry no tracks matched this genre");
                return;
        } 
        getAccessToken(function(access_token) {
                var url = "https://api.spotify.com/v1/users/" +USERID+ 
                          "/playlists/" +playlist.id+ "/tracks?";
                var uris = [];
                tracks.forEach(function (track) {
                        uris.push(track.uri);
                });
                var params = {"uris":uris};
                var headers = {"Authorization" : "Bearer " + access_token, 
                               "Content-Type"  : "application/json"};
                httpRequest("POST", headers, url, params, function (http) 
                {
                        setInfo(playlist.name);
                        document.getElementById("submit").innerHTML= "Go Again";
                        var play = document.getElementById("play");
                        play.style.display = "initial";
                        document.getElementById("loading").style.display="none";
                        play.onclick = function() {
                                window.open(playlist.uri);
                        }
                });    
        });
        

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
                        var tracks = JSON.parse(http.responseText).tracks;
                        addTracksToPlaylist(playlist, tracks);
                });

        });
}
function getPlaylistWebApi(genre, litness) {
        setInfo("Generating playlist...");
        document.getElementById("loading").style.display = "initial";
        if (!USERID) {
                getUser(function (user) {
                        USERID = user.id;
                        return getPlaylistWebApi(genre, litness);
                });
        } else {
                getAccessToken(function (access_token) {
                        var title = getTitle(litness);
                        var is_public = false;
                        var params = {
                                "name": title,
                                "public": is_public

                        };
                        var url = "https://api.spotify.com/v1/users/" + USERID 
                                + "/playlists";
                        var headers = {"Authorization":"Bearer " + access_token,
                                        "Content-Type":"application/json"
                        };
                        httpRequest("POST", headers, url, params, function(http)
                        {
                                var playlist = JSON.parse(http.responseText);
                                getTracks(genre, litness, playlist);
                        });
                });
        }
}
function checkLoginStatus() {
        //check if tokens exist in hash of location
        var tokens = getTokensFromHash();
        //if they exist store them in localstorage and remove connect to spotify
        if (tokens) 
                localStorage.howlit = JSON.stringify(tokens);
        //check localstorage to see if they are already stored
        if (localStorage.howlit) {
                getPlaylist = getPlaylistWebApi;
                document.getElementById("connect2spotify").style.display="none";
                document.getElementById("Rap").style.display = "none";
                document.getElementById("search").style.display = "none";
        }


}
window.addEventListener("load", checkLoginStatus);
