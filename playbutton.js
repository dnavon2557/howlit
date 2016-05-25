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
                return "J Chillin";
        } else if (litness >= 0) {
                return "Not Lit";
        }
}

function setCurrent() {
        var genres = document.getElementsByTagName("a");
        Array.prototype.forEach.call(genres, function(genre) {
                 genre.onclick = function () {
                        var active = document.getElementsByClassName("active")[0];
                        if (this.innerHTML != "About" && this.innerHTML != "Contact") {
                                if (active != null && active != undefined) {
                                        active.className = "";
                                }
                                this.className += " active";
                        }
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


function watchModals() {
        centerModals();
        var modal_links = document.getElementsByClassName("modal_link");
        Array.prototype.forEach.call(modal_links, function (link) {
                link.onclick = function () {
                        var target_id = this.dataset.target;
                        var target = document.getElementById(target_id);
                        backdrop(target); 
                        slidein(target);
                };
        });
}

function backdrop(target) {
        var cover = document.getElementById("cover");
        cover.style.display = "block";
        fadein(cover);
        cover.onclick = function() {
                fadeout(cover);
                slideout(target);
        }
}

function fadeout(cover) {
        var opacity = 0.6;
        opacity = parseFloat(cover.style.opacity);
        opacity = opacity - 0.015;
        cover.style.opacity = opacity;
        if (opacity > 0.000) {
                window.requestAnimationFrame(function () {
                        fadeout(cover);
                });
        }
        else {
                        cover.style.display= "none";
        }
}
function slideout(modal) {
        var top = 5;
        if (modal.style.top != "") {
                top = parseFloat(modal.style.top.slice(0, -1));
        }
        if (top > -10) {
                top -= 1.0;
        }
        if (top > -25) {
                top -= 2.0;
        }
        if (top > -60) {
                top -= 2.0;
                modal.style.top = top.toString() + "%";
                window.requestAnimationFrame(function () {
                        slideout(modal);
                });
        } 
}

function centerModals() {
        var modals = document.getElementsByClassName("modal");
        Array.prototype.forEach.call(modals, function (modal) {
                var mwidth = modal.getBoundingClientRect().width;
                var wwidth = window.innerWidth;
                modal.style.left = (wwidth/2-mwidth/2).toString() + "px";
        });
}


function slidein(modal) {
        var top = -60;
        if (modal.style.top != "") {
                top = parseFloat(modal.style.top.slice(0, -1));
        }
        if (top < -10) {
                top += 2;
        }
        if (top < -25) {
                top += 2;
        }
        if (top < 5) {
                top += 2.0;
                modal.style.top = top.toString() + "%";
                window.requestAnimationFrame(function () {
                        slidein(modal);
                });
        }
}

function fadein(modal) {
        var opacity = 0;
        if (modal.style.opacity != "") {
                opacity = parseFloat(modal.style.opacity);
        }
        opacity = opacity + 0.025;
        modal.style.opacity = opacity;
        if (opacity < 0.6) {
                window.requestAnimationFrame(function () {
                        fadein(modal);
                });
        }
}

window.onload = function () {
        setCurrent();
        watchModals();
};
function turnup() {
        var genre = document.getElementsByClassName("active")[0].innerHTML;
        genre = genre.toLowerCase();
        var litometer = document.getElementById("litometer");
        var litness = litometer.value;
        litness = litness - (litness % 0.1);
        getPlaylist(genre, litness);
};
