// ==UserScript==
// @name         Instagram video controls
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Make videos and stories simpler to navigate
// @author       Rémi Emonet
// @match        https://www.instagram.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    setInterval(() => {
        document.querySelectorAll('video').forEach(v => {
            v.setAttribute('controls', true)
            v.style.zIndex = 1000
            /*
            v.parentElement.parentElement.parentElement.parentElement
             .querySelectorAll(':scope > div:nth-child(n+3)').forEach(e => {
                e.style.pointerEvents = 'none'
                e.style.opacity = '0.1'
            })
            */
        })
    }, 100)
})();