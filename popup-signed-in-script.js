document.querySelector('#sign-out').addEventListener('click', function () {
    chrome.runtime.sendMessage({ message: 'logout' }, function (response) {
        if (response.message === 'success') window.close();
    });
});
/*
// conf par défaut:
let text = `Et non, le Fatard Club n'est pas en live :( `
//          <br>
//          Reviens quand l'icône sera en couleurs pour suivre nos aventures !`
let icon = 'red'
if (document) {
    const tag = document.getElementById('info')
    if (tag) tag.innerHTML = text
}
chrome.browserAction.setIcon({ path: `img/icon_${icon}.png` })
*/