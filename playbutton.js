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

/*Gets the playlist data from echonest based on the litness level and the
 *chosen genre. Also calls the getPlayButton and getTitle methods to get and
 *set the playbutton and title in the html doc.
 */
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

/*Watches the modal links for a click and acts appropriately if clicked*/
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

/*Sets a backdrop using the html elem with id="cover" fades out if the cover
 *is clicked.
 */
function backdrop(target) {
        var cover = document.getElementById("cover");
        cover.style.display = "block";
        fadein(cover);
        cover.onclick = function() {
                fadeout(cover);
                slideout(target);
        }
}

/*Transitions the cover to fadeout*/
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

/*Slides out a modal from the window*/
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

/*Ensures that modals arrive horizontally centered on screen*/
function centerModals() {
        var modals = document.getElementsByClassName("modal");
        Array.prototype.forEach.call(modals, function (modal) {
                var mwidth = modal.getBoundingClientRect().width;
                var wwidth = window.innerWidth;
                modal.style.left = (wwidth/2-mwidth/2).toString() + "px";
        });
}

/*Slides in a modal from above the window*/
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

/*fades in the cover with animation*/
function fadein(cover) {
        var opacity = 0;
        if (cover.style.opacity != "") {
                opacity = parseFloat(cover.style.opacity);
        }
        opacity = opacity + 0.025;
        cover.style.opacity = opacity;
        if (opacity < 0.6) {
                window.requestAnimationFrame(function () {
                        fadein(cover);
                });
        }
}

/*Actives the fetch and excute cycle for the play button*/
function turnup() {
        var genre = document.getElementsByClassName("active")[0].innerHTML;
        genre = genre.toLowerCase();
        var litometer = document.getElementById("litometer");
        var litness = litometer.value;
        litness = litness - (litness % 0.1);
        getPlaylist(genre, litness);
};


/*Calls functions for watch once DOM is loaded*/
window.onload = function () {
        setActive();
        watchModals();
};
