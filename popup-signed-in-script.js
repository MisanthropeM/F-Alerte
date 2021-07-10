document.querySelector('#sign-out').addEventListener('click', function () {
    chrome.runtime.sendMessage({ message: 'logout' }, function (response) {
        if (response.message === 'success') window.close();
    });
});

let ACCESS_TOKEN = document.cookie ? document.cookie.split(';')[0] : null;
let GAME = ''
let NAME = ''

let is_live = false

const check = async _ => {
  var isChecked=document.getElementById("togNotif").checked;
  console.log(isChecked)
  const response = await fetch('https://api.twitch.tv/helix/search/channels?query=lefatardclub', {
    method: 'GET',
    headers: {
      'client-id': '2v1htbe6nf2iw4usw6yktnjaph2cr5',
      'Authorization': 'Bearer ' + ACCESS_TOKEN
    }
  });
  //Configuration par défaut
  if (response && response.ok) { // Si la requête est passée :
    const read = await response.json()
    if (read.data && read.data[0].is_live) { // S'il y a stream, changer le texte et l'icone
      is_live = true
      const game = (read.data[0].game_name) ? read.data[0].game_name : 'Un jeu ?'
      GAME = game
      const name = (read.data[0].title) ? read.data[0].title : '(Y a pas de titre askip, dsl)'
      NAME = name
      text = `Boloss en stream détecté :
          <br>${name}
          <br>Jeu : ${game}`
    } else {
      is_live = false
    }
  }
  
  let blabla = 'Le Fatard Club est en LIVE sur ' + GAME + ' : ' + NAME
  text = (is_live) ? blabla : `Et non, le Fatard Club n'est pas en live :( `
  if (document) {
    const tag = document.getElementById('info')
    if (tag) tag.innerHTML = text
  }
}

check()
