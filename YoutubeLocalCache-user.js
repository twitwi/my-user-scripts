// ==UserScript==
// @name         Youtube local cache
// @namespace    http://tampermonkey.net/
// @version      0.4
// @require      https://unpkg.com/vue@3.2.45/dist/vue.global.js#sha256=ae2264d3dd08ed068d0709a8b8070644075df455aaca7858a7e3cccd299380df
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
    let blurYtLogo = () => {
        let sty = document.createElement('style')
        sty.innerText = `
#logo {
  filter: blur(5px);
  transition: filter 1s linear;
}
`
        document.head.append(sty)
    };
    let appStyle = () => {
        let sty = document.createElement('style')
        sty.innerText = `
#start>.app {
}
`
        document.head.append(sty)
    };

    let c = (n, att={}, sty={}, events={}, parent=null) => { let r = document.createElement(n) ; for (let i in att) r.setAttribute(i, att[i]) ; for (let i in sty) r.style[i] = sty[i] ; for (let i in events) r.addEventListener(i, events[i]) ; if (parent) parent.append(r) ; return r}


    let asyncLoadIndex = async () => {
        try {
            let req = await fetch(SV+'index.json', {
                mode: 'cors',
                cache: 'no-cache',
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
            appStyle()
            console.log(desc)
        } catch (e) {
            blurYtLogo()
        }
    };
    asyncLoadIndex()
    window.asyncLoadIndex = asyncLoadIndex

    let disabled = false
    document.addEventListener('keydown', (ev) => {
        console.log(ev)
        if (ev.key === 'Escape') {
            disabled = true
            setTimeout(() => { disabled = false; }, 1500)
        }
    })

    let interceptLink = (ev, a) => {
        if (disabled) return
        let vidid = new URL(a.href).searchParams.get('v')
        if (!(vidid in desc)) return true
        ev.preventDefault()
        ev.stopPropagation()
        let url = SV+desc[vidid][0]
        //window.location = url // navigate brutally

        let cont = c('div',
                     {},
                     {width: '100vw', height: '100vh', position: 'fixed', background: '#000000AF', padding: '0px', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'},
                     {click(ev) {if (ev.target.parentElement) ev.target.parentElement.removeChild(ev.target)}},
                     document.body)
        let vid = c('video',
                    {controls: true, autoplay: true, src: url},
                    {position: 'absolute', background: '#222222', maxWidth: '100%', maxHeight: '90%', minHeight: '90%', minWidth: '100%', boxSizing: 'border-box', },
                    {mousemove(ev) {vid.controls = true}, ended(ev) {if (cont.parentElement) cont.parentElement.removeChild(cont)}},
                    cont)
        vid.volume = 0.35 // my custom usual volume
        return false
    };

    window.Vue = Vue;
    let enrichAllLinks = () => {
        // custom list app
        if (document.querySelector('#start>.localcache-list') === null) {
            let start = document.querySelector('#start')
            let li = c('span',
                       {class: 'localcache-list', },
                       {},
                       {click() {
                           let vueapp = Vue.createApp({
                               template: `
                               <div style="position: fixed; left: 0; top: 50px; bottom: 0; width: 50%; background: chartreuse; zIndex: 10000; font-size: 20px;">
                               <h1>
                                 <span @click="closeMe">Locally Cached (click to close)</span>
                                 <button @click="n--">  -  </button>
                                 <button @click="n++">  +  </button> ({{n}} per line)
                                 <div @click="closeMe" style="float: right">×</div>
                               </h1>
                               <div style="height: calc(100% - 50px); overflow-y: scroll;">
                                 <a v-for="id in videoIds"
                                    :href="'/watch?v='+id"
                                    :style="{display: 'inline-block', width: (100/n)+'%', 'box-sizing': 'border-box'}">
                                   <img :src="'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg'" style="width: 100%" />
                                 </a>
                               </div>
                               </div>
                               `,
                               data: () => ({
                                   videoIds: Object.keys(desc),
                                   n: 5,
                               }),
                               methods: {
                                   closeMe() {
                                       vueapp.unmount()
                                   },
                               },
                           })
                           vueapp.mount(app)
                       }},
                      start)
            let app = c('div',
                        {class: 'app'},
                        {overflow: 'visible'}, {},
                        document.body)
            li.textContent = '🪣'
        }
        // actual link enriching
        document.querySelectorAll('a[href^="https://www.youtube.com/watch?v="], a[href^="/watch?v="]').forEach(a => {
            // process each link only once and for all
            if (a.enriched) return
            a.enriched = true
            a.addEventListener('click', (ev) => interceptLink(ev, a))
        })
        document.querySelectorAll('ytd-thumbnail').forEach(th => {
            if (th.enriched) return
            th.enriched = true
            let dl = document.createElement('span')
            dl.textContent = '📥'
            dl.style.overflow = 'visible'
            dl.style.width = '0'
            dl.style.zIndex = '10'
            dl.addEventListener('click', async () => {
                let id = th.__data.data.videoId
                await fetch(`${SV}___ytdl`, {
                    method: 'POST',
                    body: JSON.stringify({ id }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => response.json())
                    .then(data => console.log(data))
                    .then(asyncLoadIndex)
            })
            th.parentNode.insertBefore(dl, th)
        })
    };

    setInterval(enrichAllLinks, 1000);
})();

/*
#########################################################################################################

#!/bin/bash

set -e
index="index.json"

mkdir -p links/
cd links/
echo '{' > "$index"

for i in ../*'['???????????'].'* ; do
    link=$(echo "$i" |sed 's@^.*\[\(...........\)\][.]\([^.]*\)$@\1.\2@g')
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
echo '(cd links/ && python3 ../cors_http_server.py)'





#########################################################################################################




#!/usr/bin/env python

# Usage: python cors_http_server.py <port>

from http.server import HTTPServer, SimpleHTTPRequestHandler, test as test_orig
import subprocess
import json
import sys
def test (*args):
    test_orig(*args, port=int(sys.argv[1]) if len(sys.argv) > 1 else 7897, bind="0.0.0.0")

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.end_headers()
    def do_POST(self):
        if self.path == '/___ytdl':
            length = int(self.headers['Content-Length'])
            data = self.rfile.read(length)
            data = json.loads(data)
            ytid = data['id']
            with open('index.json') as f:
                existing = json.load(f)
            if ytid in existing.values():
                print(f'Received id: {ytid} -> already got it')
                msg = 'Already'
                log = ''
            else:
                print(f'Received id: {ytid} -> downloading...')
                msg = 'Download...'
                log = subprocess.check_output(['yt-dlp', ytid], cwd='..').decode('utf-8')
                subprocess.call(['./make-links.sh'], cwd='..')
            # Send a response
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps(dict(msg=msg, log=log)).encode('utf-8'))
        else:
            super().do_POST()
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type")
        SimpleHTTPRequestHandler.end_headers(self)

if __name__ == '__main__':
    test(CORSRequestHandler, HTTPServer)


*/
