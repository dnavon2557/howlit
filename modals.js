
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
/*Calls functions for watch once DOM is loaded*/
window.onload = function () {
        setActive(); //in playbutton module
        watchModals();
};