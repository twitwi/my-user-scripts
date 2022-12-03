// ==UserScript==
// @name         Moodle Boost
// @namespace    https://heeere.com/userscript
// @version      0.2
// @description  Improve Moodle UJM
// @author       REmonet
// @match        https://mood.univ-st-etienne.fr/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let COLOR = '#d35400'
    let BRIGHT = '#0F0' //'#ffa502'
    let customStyle = document.createElement('style')
    document.body.previousElementSibling.append(customStyle)
    customStyle.textContent = `
`
    function elem(html, appendTo=undefined) {
        let e = document.createElement('section');
        e.innerHTML = html
        let ret = e.children[0]
        if (appendTo) appendTo.append(ret)
        return ret
    }

    let courseId = new URLSearchParams(window.location.search).get('id')

    let header = document.querySelector('#page-course-view-topics #page #page-header .card-body')
    if (header) {
        // add "grades" download for practice.heeere.com
        let csv = null
        let bar = elem('<div><span>enrichCAS: </span></div>', header)
        console.log(bar)
        let b = elem('<button>do copy emails</button>', bar)
        b.onclick = async function() {
            let sesskey = document.querySelector('input[name=sesskey]').value
            let r = await fetch("https://mood.univ-st-etienne.fr/grade/export/txt/export.php", {
                "credentials": "include",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:105.0) Gecko/20100101 Firefox/105.0",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                    "Accept-Language": "fr-FR,en-US;q=0.7,en;q=0.3",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Upgrade-Insecure-Requests": "1",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-User": "?1"
                },
                "referrer": "https://mood.univ-st-etienne.fr/grade/export/txt/index.php?id="+courseId,
                "body": `mform_isexpanded_id_gradeitems=1&checkbox_controller1=0&mform_isexpanded_id_options=0&id=${courseId}&sesskey=${sesskey}&_qf__grade_export_form=1&itemids%5B5373%5D=0&itemids%5B5847%5D=0&itemids%5B4414%5D=0&export_feedback=0&export_onlyactive=0&export_onlyactive=1&display%5Breal%5D=0&display%5Breal%5D=1&display%5Bpercentage%5D=0&display%5Bletter%5D=0&decimals=2&separator=comma&submitbutton=T%C3%A9l%C3%A9charger`,
                "method": "POST",
                "mode": "cors"
            });
            let t = await r.text()
            csv = t.split('\n').filter((l,i)=>i>0&&l[0]!==undefined).map(l => l.split(','))
            await navigator.clipboard.writeText(csv.map(l => l[5]).join('\n'))
        }
        b = elem('<a target="_blank" href="https://dl.heeere.com/2022-09-13-ldap-resolve/">… visit this and paste/copy …</a>', bar)
        let ta = elem('<textarea></textarea>', bar)
        ta.oninput = async function() {
            let uid = {}
            ta.value.split('\n').map(l => l.split(',')).forEach(l => {
                uid[l[0]] = l[1]
            })
            await navigator.clipboard.writeText(csv.map(l => `enrichCAS display,etu-${uid[l[5]]},${l[1]} ${l[0].toUpperCase()}`.replace(/"/g,"")).join('\n') + '\napplyCASEnricher\n')
        }
        b = elem('<a target="_blank" href="https://practice.heeere.com/admin/users">… practice admin</a>', bar)
    }
    
})();
