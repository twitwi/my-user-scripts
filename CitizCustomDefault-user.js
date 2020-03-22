// ==UserScript==
// @name        Citiz Custom Default
// @namespace   https://heeere.com/userscript
// @match       https://service.citiz.fr/webapp/reservation/planning
// @version     1
// @run-at      document-idle
// @grant       none
// ==/UserScript==


let go = () => {
    document.querySelectorAll('h5').forEach((h5) => {
        h5.innerHTML += '(click to set defaults)'
        h5.addEventListener('click', () => {
            alert('deprecated')
        })
    })

    // deprecated...
        /*

    console.log("TRY");
    var defs = {
        'ctl00_cph_Graf1_CitySelect': 145,
        'ctl00_cph_Graf1_TimeRangeList': 172800,
        'ctl00_cph_Graf1_DistanceList': 1000,
        'ctl00_cph_Graf1_LocationSelect': 582,
    };

    var el;
    for (let k in defs) {
        el = document.getElementById(k);
        if (el === null) {
            console.log("USER SCRIPT, id not found", k);
            setTimeout(go, 500);
            return;
        }
        console.log("CITIZ set", k, defs[k]);
        el.value = defs[k];
        if (el.value != defs[k]) {
            console.log("USER SCRIPT, set did not work on key", k);
            setTimeout(go, 500);
            return;
        }
        el.onchange();
    }
    console.log("ALL OK");
    */
};

go()
