// ==UserScript==
// @name         Claroline Connect NG
// @namespace    https://heeere.com/userscript
// @version      0.1
// @description  Improve claroline connect
// @author       REmonet
// @match        https://claroline-connect.univ-st-etienne.fr/web/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let COLOR = '#d35400'
    let BRIGHT = '#0F0' //'#ffa502'
    let customStyle = document.createElement('style')
    document.body.previousElementSibling.append(customStyle)
    customStyle.textContent = `
.addedbutton {
  color: ${COLOR};
  position: relative;
  border: 2px solid ${COLOR};
  border-radius: 3px;
  margin: 0 2px;
  padding: 0.2em;
  cursor: pointer;
}
.addedicon .fa {
  margin: auto;
}
.addedicon {
  padding: 0  !important;
  --size: 30px;
  position: relative;
  display: inline-block;
  width: var(--size);
  height: var(--size);
  text-align: center;
  line-height: var(--size)  !important;
  background: #171515;
  border-radius: 50%;
  font-size: calc(var(--size) / 2);
  color: white;
  transition: .5s;
}
.addedicon::before {
  content: '';
  position: absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  border-radius:50%;
  background: ${COLOR};
  transition: .5s;
  transform: scale(.9);
  z-index: -1;
}
.addedicon:hover::before {
  transform: scale(1.5);
  box-shadow: 0 0 calc(var(--size) / 4) ${COLOR};
  filter: blur(3px);
}

.addedicon:hover {
  color: ${BRIGHT}  !important;
  box-shadow: 0 0 calc(var(--size) / 4) ${COLOR};
  text-shadow: 0 0 calc(var(--size) / 4) ${COLOR};
}

.dropdown-menu a[role="menuitem"]:hover {
  background: transparent  !important;
}
`

    // add a button in the bar
    let link = document.querySelector('ul.navbar-nav > li > a[href="/web/app.php/desktop/tool/properties/tools/parameters/menu"]')
    let li = document.createElement('li')
    link.parentElement.parentElement.appendChild(li)
    li.style = 'box-sizing: content-box;'
    let a = document.createElement('a')
    li.appendChild(a)
    a.classList.add('addedicon')
    a.href = '/web/app.php/message/message/show'
    a.title = 'Nouveau message'
    let icon = document.createElement('i')
    icon.classList.add('fa', 'fa-share-square')
    a.appendChild(icon)

    // add a button to each current workspace
    Array.from(document.querySelectorAll('a[role="menuitem"][href^="/web/app.php/workspaces"][title]'))
        .filter(a => a.href.endsWith('/open'))
        .forEach(a => {
        let code = a.title.replace(/.*\(([^()]*)\)$/, '$1')
        let aa = document.createElement('a')
        aa.classList.add('addedicon')
        let icon = document.createElement('i')
        icon.classList.add('fa', 'fa-share-square')
        aa.onclick = e => {
            localStorage.setItem('CCNG_message_group', code)
            window.location = '/web/app.php/message/message/show'
            e.preventDefault()
        }
        aa.append(icon)
        a.append(aa)
    })


    // improve the send form (if any)
    document.querySelectorAll('#message_form_to').forEach( inp => {
        if (localStorage.getItem('CCNG_message_group') !== null) {
            let code = localStorage.getItem('CCNG_message_group')
            localStorage.removeItem('CCNG_message_group')
            inp.value = '['+code+'];'
            document.querySelector('#message_form_object').value = '['+code.replace(/[ML]?[-0-9]*$/, '').toLowerCase()+'] '
        } else {
            let div = inp.parentNode.parentNode
            let add = document.createElement('div')
            add.classList.add('form-group', 'row')
            div.parentElement.insertBefore(add, div.nextElementSibling)
            add.innerHTML = '==>'

            Array.from(document.querySelectorAll('a[role="menuitem"][href^="/web/app.php/workspaces"][title]'))
                .filter(a => a.href.endsWith('/open'))
                .map(a => a.title.replace(/.*\(([^()]*)\)$/, '$1'))
                .forEach(code => {
                let button = document.createElement('a')
                button.classList.add('addedbutton')
                button.textContent = code
                button.onclick = e => {
                    inp.value += '['+code+'];'
                    e.preventDefault()
                }
                add.append(button)
            })
        }
    })
})();
