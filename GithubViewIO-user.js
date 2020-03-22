// ==UserScript==
// @name        github view github.io
// @namespace   https://heeere.com/userscript
// @description Add a link to view gh-pages
// @include     https://github.com/*
// @version     1
// @grant       none
// ==/UserScript==


(function () {
    //var menu = document.querySelector('.repohead-details-container');
    var link = document.createElement('a')
    link.setAttribute('style', `
	position: fixed;
	top: 0;
	left: 0;
	z-index: 100;
	background: white;
	color: black;
	border-radius: 0 5px 5px 5px;
    `)
    link.onmouseover = e => {
        //e.preventDefault()
        link.href = document.location.toString().replace(/\/github.com\/([^\/]*)\/([^\/]*).*/, '/$1.github.io/$2')
    }
    link.textContent = '⇆ .io'
    link.title = 'Switch to github.io'
    document.body.prepend(link)
    //menu.appendChild(link);
})();

