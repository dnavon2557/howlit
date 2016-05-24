var APIKEY = "MTZ7G9GPEB6G3QDOL";
var echoNest = "http://developer.echonest.com/"
var apiMethod = "api/v4/playlist/static?"
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

function fidToSpid(fid) {
        var fields = fid.split(':');
        return fields[fields.length - 1];
}
function getTitle(litness) {
        if (litness >= 7/8) {
                return "Turnt AF";
        } else if (litness >= 3/4) {
                return "Pretty Lit";
        } else if (litness >= 5/8) {
                return "Definitely Lit";
        } else if (litness >= 1/2) {
                return "Low Key Lit";
        } else if (litness >= 3/8) {
                return "Low Key";
        } else if (litness >= 1/4) {
                return "J Chillin'";
        } else if (litness >= 0) {
                return "Not Lit";
        }
}

function setCurrent() {
        var genres = document.getElementsByTagName("a");
        console.log(genres);
        Array.prototype.forEach.call(genres, function(genre) {
                 genre.onclick = function () {
                        var active = document.getElementsByClassName("active")[0];
                        if (active != null && active != undefined) {
                                active.className = "";
                        }
                        this.className += " active";
                };
        });
               

}

function uriFromObject(object) {
        var res = "";
        for (key in object) {
                res += encodeURIComponent(key) +"="+ encodeURIComponent(object[key]) + "&";
        }
        return res;
}

function getPlaylist(genre, litness) {
        var url = echoNest + apiMethod;
        var title = getTitle(litness);
        var tempo = 80 + (100 * litness);
        var params = {
                api_key: APIKEY,
                type:"genre-radio",
                results:"50",
                bucket: "tracks",
                limit:"true",
                genre:genre,
                // min_tempo:tempo,
                target_energy:litness

        }
        var uri = uriFromObject(params);
        url +=uri+"bucket=id:spotify";
        console.log(url);

        var info = document.getElementById("info");
        info.innerHTML = "Generating playlist...";
        var http = new XMLHttpRequest();
        http.open("GET", url, true);
        http.onreadystatechange = function () {
                if (http.readyState === 4) {
                        if (http.status === 200) {
                                var playlist = JSON.parse(http.responseText).response.songs;
                                console.log(playlist);
                                var playButton = getPlayButtonFor(title, playlist);
                                var span = document.getElementsByTagName("span")[0];
                                span.innerHTML = playButton;
                                document.getElementById("info").innerHTML = title;


                        }
                }
        };
        http.send(null);

}
window.onload = function () {
        setCurrent();
};
function turnup() {
        var genre = document.getElementsByClassName("active")[0].innerHTML;
        genre = genre.toLowerCase();
        var litometer = document.getElementById("litometer");
        var litness = litometer.value;
        litness = litness - (litness % 0.1);
        getPlaylist(genre, litness);
};
