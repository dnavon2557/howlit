//Set global vars for api requests
var APIKEY = "MTZ7G9GPEB6G3QDOL";
var echoNest = "http://developer.echonest.com/"
var apiMethod = "api/v4/playlist/static?"


/* Returns the html for a iframe containing a songs from playlist (an array 
 * of songs) and the given title
 */
function getPlayButtonFor(title, playlist) {
        var iframe = '<iframe src="https://embed.spotify.com/?uri=spotify:trackset:PREFEREDTITLE:TRACKS&theme=white" width="640" height="520" frameborder="0" allowtransparency="true"></iframe>';
        var trackids = [];
        playlist.forEach(function(song) {
                var trackid = fidToSpid(song.tracks[0].foreign_id);
                trackids.push(trackid);
        });
        var tracks = trackids.join(',');
        iframe = iframe.replace('TRACKS', tracks);
        iframe = iframe.replace('PREFEREDTITLE', title)
        return iframe;
}

/* Interprets a foreign_id from a song and returns the spotify Id */
function fidToSpid(fid) {
        var fields = fid.split(':');
        return fields[fields.length - 1];
}


/*Returns a title based on the litness level of the litometer*/
function getTitle(litness) {
    litness = Math.ceil(litness * 8);
    switch (litness) {
        case 8:
            return "Turnt AF";
        case 7:
            return "Pretty Lit";
        case 6:
            return "Definitely Lit";
        case 5:
            return "Low Key Lit";
        case 4:
            return "Low Key";
        case 3:
            return "J Chillin";
        case 2:
            return "Not Lit";
        case 1:
            return "Sadboy";
    }
}

/*Sets the class of a clicked genre to "active" and resets the current active*/
function setActive() {
        var genres = document.getElementsByClassName("genre");
        Array.prototype.forEach.call(genres, function(genre) {
                 genre.onclick = function () {
                        var active = document.getElementsByClassName("active")[0];
                                if (active != null && active != undefined) {
                                        active.className = "genre";
                                }
                                this.className += " active";
                };
        });
               

}


/*Returns the URI string for an api request from an object containing paramters
 *and arguements. None of the paramters can be repeated and arguments are
 *assumed to be numbers or strings
 */
function uriFromObject(object) {
        var res = "";
        for (key in object) {
                res += encodeURIComponent(key) +"="+ encodeURIComponent(object[key]) + "&";
        }
        return res;
}

function getHottestArtist(genre) {
        var url = echoNest + "api/v4/artist/top_hottt?"
        var params = {
            api_key: APIKEY,
            results: 20,
            genre: genre,
            bucket: "terms",
            limit: true
        };
        var uri = uriFromObject(params);
        url +=uri+"bucket=id:spotify";

        var http = new XMLHttpRequest();
        http.open("GET", url, true);
        http.onreadystatechange = function () {
                if (http.readyState === 4) {
                        if (http.status === 200) {
                            console.log(http.responseText);

                        } 
                }
        };
        http.send(null);

}

/*Gets the playlist data from echonest based on the litness level and the
 *chosen genre. Also calls the getPlayButton and getTitle methods to get and
 *set the playbutton and title in the html doc.
 */
function getPlaylist(genre, litness) {
        var url = echoNest + apiMethod;
        var title = getTitle(litness);
        var energy = litness * 0.5;
        var params = {
                api_key: APIKEY,
                type:"genre-radio",
                results:"25",
                bucket: "tracks",
                limit:"true",
                variety: 1,
                genre: genre,
                min_danceability: energy / 2,
                min_energy: energy

        }
        var uri = uriFromObject(params);
        url +=uri+"bucket=id:spotify";

        var info = document.getElementById("info");
        info.innerHTML = "Generating playlist...";
        console.log(url);
        var http = new XMLHttpRequest();
        http.open("GET", url, true);
        http.onreadystatechange = function () {
                if (http.readyState === 4) {
                        if (http.status === 200) {
                                var playlist = JSON.parse(http.responseText).response.songs;
                                var playButton = getPlayButtonFor(title, playlist);
                                var span = document.getElementsByTagName("span")[0];
                                span.innerHTML = playButton;
                                document.getElementById("info").innerHTML = title;


                        } else {
                            var message = JSON.parse(http.responseText).response.status.message;
                            document.getElementById("info").innerHTML = message;

                        }
                }
        };
        http.send(null);

}


/*Actives the fetch and excute cycle for the play button*/
function turnup() {
        var genre = "";
        genre =  document.getElementById("search").value;
        genre = genre.trim();
        if (genre == "" || genre == null || genre == undefined) {
            var active = document.getElementsByClassName("active");
            if (active.length == 0) {
                return;
            }
            genre = active[0].innerHTML;
            if (genre == "Rap") {
                genre = "Pop Rap";
            }
        }
        genre = genre.toLowerCase();
        var litometer = document.getElementById("litometer");
        var litness = litometer.value;
        litness = litness;
        // getHottestArtist(genre);
        getPlaylist(genre, litness);
};

window.addEventListener("load", setActive);
