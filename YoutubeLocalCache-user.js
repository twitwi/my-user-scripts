// ==UserScript==
// @name         Youtube local cache
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Use a local web server to server pre-downloaded youtube videos and propose them
// @author       twitwi
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let SV = 'http://localhost:7897/'
    let desc = {}

    let modifyYtLogo = () => {
        let sty = document.createElement('style')
        sty.innerText = `
#logo {
  filter: hue-rotate(240deg) brightness(130%);
  transition: filter 1s linear;
}
`
        document.head.append(sty)
    };

    let asyncLoadIndex = async () => {
        let req = await fetch(SV+'index.json', {
            mode: 'cors',
        })
        let o = await req.json()
        for (let k in o) {
            let v = o[k]
            if (!(v in desc)) {
                desc[v] = []
            }
            desc[v].push(k)
        }
        modifyYtLogo() // to show it loaded
        console.log(desc)
    };
    asyncLoadIndex()

    let interceptLink = (ev, a) => {
        console.log(a.href, a.enriched)
        let vidid = new URL(a.href).searchParams.get('v')
        if (!(vidid in desc)) return true
        ev.preventDefault()
        ev.stopPropagation()
        a.href = SV+desc[vidid][0]
        console.log(a.href)
        window.location = a.href
        return false
    };

    let enrichAllLinks = () => {
        document.querySelectorAll('a[href^="https://www.youtube.com/watch?v="], a[href^="/watch?v="]').forEach(a => {
            // process each link only once and for all
            if (a.enriched) return
            a.enriched = true
            a.addEventListener('click', (ev) => interceptLink(ev, a))
        })
    };

    setInterval(enrichAllLinks, 1000);
})();

/*
#!/bin/bash

set -e
index="index.json"

mkdir -p links/
cd links/
echo '{' > "$index"

for i in ../*-???????????.* ; do
    link=$(echo "$i" |sed 's@^.*-\(...........[.][^.]*\)$@\1@g')
    vidid=$(echo "$link" |sed 's@[.][^.]*$@@g')
    test -f "$link" || ln -s "$i" "./$link"
    echo "\"$link\": \"$vidid\"," >> "$index"
    printf '.'
done
echo


echo '"NONE": "NONE"' >> "$index"
echo '}' >> "$index"

echo maybe run:
echo
#echo 'PORT=7897 fff links/index.json'
echo 'python3 cors-http-server.py'
`



#!/usr/bin/env python

# Usage: python cors_http_server.py <port>

try:
    # try to use Python 3
    from http.server import HTTPServer, SimpleHTTPRequestHandler, test as test_orig
    import sys
    def test (*args):
        test_orig(*args, port=int(sys.argv[1]) if len(sys.argv) > 1 else 7897, bind="0.0.0.0")
except ImportError: # fall back to Python 2
    from BaseHTTPServer import HTTPServer, test
    from SimpleHTTPServer import SimpleHTTPRequestHandler

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)

if __name__ == '__main__':
    test(CORSRequestHandler, HTTPServer)

*/





