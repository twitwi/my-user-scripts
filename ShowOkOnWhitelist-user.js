// ==UserScript==
// @name         Add OK on whitelisted sites.
// @namespace    https://heeere.com/userscript
// @version      0.1
// @description  fishing prevention
// @match        https://cas.univ-st-etienne.fr/*
// @grant        none
// ==/UserScript==

/* Add URLs above with @match to add the OK to more pages */

(function() {
    'use strict';

    let tag = document.createElement('div')
    tag.textContent = 'OK'
    let style = {
        position: "fixed",
        left: "0",
        top: "250px",
        width: "100px",
        height: "200px",
        color: "#00FF00",
        "text-shadow": "8px 8px 10px black",
        "font-size": "100px",
        "z-index": "1"
    }
    for (let k in style) {
        tag.style[k] = style[k]
    }
    document.body.prepend(tag)
})();

