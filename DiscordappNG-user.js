// ==UserScript==
// @name         Fine-tune Discordapp
// @namespace    https://heeere.com/userscript
// @version      0.2
// @description  Quickly improve discord (Ctrl+S, custom always-on "aka", emoji import across servers)
// @author       You
// @match        https://discordapp.com/*
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    const TOKEN_KEY = 'tunedisc_token';
    const CUSTOMNAMES_KEY = 'tunedisc_customnames';
    //console.log(GM_getValue(TOKEN_KEY, ''))

    // Your code here...
    if (window.___l !== undefined) {
        document.removeEventListener('keydown', window.___l)
    }

    window.___l = (ev) => {
        if (ev.ctrlKey && ev.key == 's') {
            console.log('Ctrl+S')
            ev.preventDefault()
            document.querySelector('.button-1x2ahC:last-of-type').click()
        }
    }

    document.addEventListener('keydown', window.___l)

    let appendFragment = (parent, html) => {
        let r = document.createElement('div')
        parent.append(r)
        r.outerHTML = html
        let ch = parent.children
        return ch.item(ch.length - 1)
    }
    (function() {

        let s = 20
        let cog = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${200/254*s}px" height="${254/254*s}px" viewBox="0 0 875 1110">
                   <defs>
                   <path id="c" d="M 26 -248L-26 -248C-42 -223 -43 -197 -44 -174L-94 -154C-109 -175 -125 -184 -160 -197L-197 -160C-184 -125 -175 -109 -154 -94L-174 -44C-197 -43 -223 -42 -248 -26L-248 26C-223 42 -197 43 -174 44L-154 94C-175 109 -184 125 -197 160L-160 197C-125 184 -109 175 -94 154L-44 174C-43 197 -42 223 -26 248L26 248C42 223 43 197 44 174L94 154C109 175 125 184 160 197L197 160C184 125 175 109 154 94L174 44C197 43 223 42 248 26L248 -26C223 -42 197 -43 174 -44L154 -94C175 -109 184 -125 197 -160L160 -197C125 -184 109 -175 94 -154L44 -174C43 -197 42 -223 26 -248 zM0 -80C44 -80 80 -44 80 0C80 44 44 80 0 80C-44 80 -80 44 -80 0C-80 -44 -44 -80 0 -80z"/>
                   </defs>
                   <use xlink:href="#c" fill="currentColor" transform="translate(250 250)"/>
                   <use xlink:href="#c" fill="currentColor" transform="translate(555 555)rotate(22.5)"/>
                   <use xlink:href="#c" fill="currentColor" transform="translate(250 860)"/>
                   </svg>
                   `
        let style = ['#discordtuneConfig {',
                     '  margin: -10px; position: fixed; bottom: 5px; right: 5px; width: 20px; height: 20px;',
                     '  background: black; color: white; padding: 1mm; border-radius: 1mm;',
                     '  opacity: 0.5;',
                     '  transition: all 100ms linear;',
                     '}',
                     '#discordtuneConfig:hover {',
                     '  padding: 1cm 0 0 1cm;',
                     '  width: 200px; height: 200px;',
                     '  opacity: 1;',
                     '  transition: all 200ms linear;',
                     '  ',
                     '}',
                    ].join('\n')
        let panel = appendFragment(document.body, '<div id="discordtuneConfig""><style>'+style+'</style></div>')

        let cfg = appendFragment(panel, '<button style="border: 1px solid white; background: grey; color: white; padding: 0;" class="btn" >'+cog+'</button>')
        cfg.addEventListener('click', function () {
            let token = prompt('Enter your Discord user token, the "Authentication" header in /api requests.\n Don\'t know how to get it?\nhttps://discordhelp.net/discord-token', GM_getValue(TOKEN_KEY, ''))
            if (token != null) {
                GM_setValue(TOKEN_KEY, token)
            }
            let customNames = prompt('Enter a JSON object of custom names', GM_getValue(CUSTOMNAMES_KEY, ''))
            if (customNames != null) {
                GM_setValue(CUSTOMNAMES_KEY, customNames)
            }
        })

        let enrichDM = appendFragment(panel, '<br/><button style="border: 1px solid white" class="btn">enrich DM</button>')
        enrichDM.addEventListener('click', async function() {
            let tok = GM_getValue(TOKEN_KEY, '')
            if (tok == '') {
                alert("Need token")
                return
            }
            let customNames = GM_getValue(CUSTOMNAMES_KEY, '')
            if (customNames == '') {
                alert("Useless without customNames")
                return
            }
            customNames = JSON.parse(customNames)
            let customName = (id) => customNames[id] || '';
            let a = await fetch('https://discordapp.com/api/users/@me/channels?limit=50', { mode: 'cors', headers: { Authorization: tok } })
            let r = await a.json()
            document.querySelectorAll('#dicordtuneDMStyle').forEach(e => e.parentNode.remove(e))
            let dmCSSRules = (dm) => {
                let r = ''
                r += 'a[href="/channels/@me/'+dm.id+'"]:hover::after {'
                r += '  opacity: 1;'
                r += '}\n'
                r += 'a[href="/channels/@me/'+dm.id+'"]::after {'
                r += 'position: relative; top: -10px;'
                r += 'background: white; color: black; border: 1px solid green; font-size: 70%;'
                r += 'opacity: 0.2; '
                r += 'content: "'+dm.recipients.map(r => customName(r.id)).join('/')+'" ;' // TODO recipients id map
                r += '}'
                return r
            }
            appendFragment(panel, '<style id="dicordtuneDMStyle">'+r.map(dmCSSRules).join('\n')+'</style>');
        })


        // emoji importer, without nitro
        function pFileReader(file) {
            return new Promise((resolve, reject) => {
                var fr = new FileReader()
                fr.onload = () => { resolve(fr.result) }
                fr.readAsDataURL(file)
            })
        }
        async function getBase64FromImage(url) {
            let a = await fetch(url)
            let r = await pFileReader(await a.blob())
            window.r = r
            return r
        }
        async function addEmoji(name, imUrl, then = console.log) {
            let tok = GM_getValue(TOKEN_KEY, '')
            if (tok == '') {
                alert("Need token")
                return
            }
            let guildId = window.location.pathname.replace(/^\/channels\/([^/]*)\/.*$/, '$1')
            let url = `https://discordapp.com/api/v6/guilds/${guildId}/emojis`
            let a = await fetch(url, { method: 'POST', mode: 'cors', headers: { Authorization: tok, 'Content-Type': 'application/json' }, body: JSON.stringify({
                name,
                image: await getBase64FromImage(imUrl),
            })
                                     })
            let r = await a.text()
            then(r)
            return r
        }

        let kEmojis = '___emojiInterval'
        let importEmojis = appendFragment(panel, '<br/><button style="border: 1px solid white" class="btn">toggle emoji importer</button>')
        importEmojis.addEventListener('click', async function() {
            if (window[kEmojis]) {
                window.clearInterval(window[kEmojis])
                window[kEmojis] = null
                console.log('Cleared '+kEmojis)
            } else {
                window[kEmojis] = window.setInterval(() => {
                    document.querySelectorAll('[class*="emojiItem-"]').forEach(e => {
                        e.onclick = (ev) => {
                            let url = e.style['background-image']
                            url = url.replace(/^url\("(.*)"\)$/, '$1')
                            let n = document.querySelector('[class*="infoBarEmojiName-"]').textContent.replace(/:/g, '').replace(/~[0-9]+$/g, '')
                            n = prompt('Emoji Name', n)
                            if (n != null) {
                                addEmoji(n, url)
                                ev.stopPropagation()
                            }
                        }
                    })
                }, 330)
                console.log('Setup '+kEmojis)
            }
        })
    })()



})();
