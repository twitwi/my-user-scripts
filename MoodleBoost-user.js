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
    input.toggler { display: none; }
    .toggler { border: 1px solid chartreuse; }
    .toggler:not(:checked)+* { display: none; }
    .toggler ::before { content: "…"; background: chartreuse; }
`
    function elem(html, appendTo=undefined) {
        let e = document.createElement('section');
        e.innerHTML = html
        let ret = e.children[0]
        if (appendTo) appendTo.append(ret)
        return ret
    }
    function togglerFor(el, title="") {
        let id = 'toggler__'+Math.random()
        let lab = elem(`<label for="${id}" title="${title}" class="toggler">…</label>`)
        let cb = elem(`<input type="checkbox" id="${id}" class="toggler"/>`)
        el.parentElement.insertBefore(lab, el)
        el.parentElement.insertBefore(cb, el)
    }
    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    let courseId = new URLSearchParams(window.location.search).get('id')
    let sesskey = M.cfg.sesskey //document.querySelector('input[name=sesskey]').value

    let header = document.querySelector('#page-course-view-topics #page #page-header .card-body')
    if (header) {
        // add "grades" download for practice.heeere.com
        let csv = null
        let bar = elem('<div><span>enrichCAS: </span></div>', header)
        togglerFor(bar, 'EnrichCAS')
        let b = elem('<button>do copy emails</button>', bar)
        b.onclick = async function() {
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

    async function addTP(g, tp, sectionId, groupId=undefined, visible=0) {
        const av = {op: "&", c: [], showc: []}
        if (groupId) {
            av.c = [{"type": "group","id": groupId}]
            av.showc = [true]
        }
        await fetch("https://mood.univ-st-etienne.fr/course/modedit.php", {
            "credentials": "include",
            "headers": {
                "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:105.0) Gecko/20100101 Firefox/105.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "fr-FR,en-US;q=0.7,en;q=0.3",
                "Upgrade-Insecure-Requests": "1",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-User": "?1",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            //"referrer": "https://mood.univ-st-etienne.fr/course/modedit.php?add=assign&type=&course=1547&section=2&return=0&sr=0",
            body: new URLSearchParams({
                "mform_isexpanded_id_availability": "1",
                "mform_isexpanded_id_submissiontypes": "1",
                "completionunlocked": "1",
                "course": courseId,
                "coursemodule": "",
                "section": sectionId, //"2",
                "module": "1", // was empty in previous script
                "modulename": "assign",
                "instance": "",
                "add": "assign",
                "update": "0",
                "return": "0",
                "sr": "0",
                "sesskey": sesskey,
                "_qf__mod_assign_mod_form": "1",
                "mform_isexpanded_id_general": "1",
                "mform_isexpanded_id_feedbacktypes": "1",
                "mform_isexpanded_id_submissionsettings": "1",
                "mform_isexpanded_id_groupsubmissionsettings": "1",
                "mform_isexpanded_id_notifications": "0",
                "mform_isexpanded_id_modstandardgrade": "0",
                "mform_isexpanded_id_modstandardelshdr": "1",
                "mform_isexpanded_id_availabilityconditionsheader": "1",
                "mform_isexpanded_id_activitycompletionheader": "0",
                "mform_isexpanded_id_tagshdr": "0",
                "mform_isexpanded_id_plagiarismdesc": "0",
                "name": `G${g}-TP${tp}`,
                "introeditor[text]": `<p+dir="ltr"+style="text-align:+left;">Pour le Groupe G${g}, Rendu du TP${tp}<br></p>`,
                "introeditor[format]": "1",
                //"introeditor[itemid]": "378172195",
                "showdescription": "0",
                "introattachments": "977087541",
                "assignsubmission_file_enabled": "1",
                "assignsubmission_comments_enabled": "1",
                "assignsubmission_file_maxfiles": "1",
                "assignsubmission_file_maxsizebytes": "10485760",
                "assignsubmission_file_filetypes[filetypes]": ".zip",
                "submissiondrafts": "0",
                "requiresubmissionstatement": "0",
                "attemptreopenmethod": "untilpass",
                "maxattempts": "-1",
                "teamsubmission": "0",
                "sendnotifications": "0",
                "sendlatenotifications": "0",
                "sendstudentnotifications": "1",
                "grade[modgrade_type]": "none",
                "blindmarking": "0",
                "hidegrader": "0",
                "markingworkflow": "0",
                "visible": `${visible}`,
                "cmidnumber": `G${g}TP${tp}`,
                "groupmode": "0",
                "availabilityconditionsjson": JSON.stringify(av),
            "completion": "0",
            "tags": "_qf__force_multiselect_submission",
            "use_compilatio": "0",
            "submitbutton": "Enregistrer+et+afficher"
        }),
            "method": "POST",
            "mode": "cors",
    })
    }


    let groups = Object.fromEntries([...document.querySelectorAll('select[data-field-name="groups"] option:not([value="-1"])')].map(o => [o.textContent, o.value]))
    if (Object.entries(groups).length > 0) {
        let bar = elem('<div><span>copy groups to local storage for mass-RenduTP: </span></div>', header)
        let b = elem('<button>copy groups</button>', bar)
        b.onclick = async function() {
            localStorage.setItem('mass-rendu-groups', JSON.stringify(groups))
        }
    }

    document.querySelectorAll('li[data-sectionid]').forEach(s => {
        const sectionId = s.getAttribute('data-sectionid')
        const sectionRight = s.querySelector(':scope>div.right.side')
        let b = elem('<button title="Create Rendus TP">+</button>', sectionRight)
        togglerFor(b, 'CreateRendusTP');
        b.onclick = async function() {
            const groups = JSON.parse(localStorage.getItem('mass-rendu-groups') ?? "{}")
            let tps = prompt('Numéros de TPs (séparés par des espaces) ?', '1 2')
            if (tps == null) return
            tps = tps.trim().split(/ +/g)
            let gs = prompt('Groupes (séparés par des espaces)', Object.keys(groups).join(' ') || '3A 3Z')
            if (gs == null) return
            gs = gs.trim().split(/ +/g)
            let visible = prompt('Visible ?', '0')
            if (visible == null) return
            visible = parseInt(visible)

            for (const tp of tps) {
                for (const g of gs) {
                    const groupId = groups[g] ? parseInt(groups[g]) : undefined
                    console.log("Adding TP", tp, "for group", g, groupId)
                    await addTP(g, tp, sectionId, groupId, visible)
                }
            }
        }
    })

})();
