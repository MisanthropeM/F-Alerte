const CLIENT_ID = encodeURIComponent("2v1htbe6nf2iw4usw6yktnjaph2cr5");
const REDIRECT_URI = encodeURIComponent("https://apknencahikclipfbionihmlodbkdglo.chromiumapp.org/");
const RESPONSE_TYPE = encodeURIComponent("token");
const STATE = encodeURIComponent('meet' + Math.random().toString(36).substring(2, 15));

let icon = 'red';
let is_live = false;
let ACCESS_TOKEN = document.cookie ? document.cookie.split(';')[0] : null;
let user_signed_in = !!ACCESS_TOKEN && ACCESS_TOKEN !== 'bruhmoment';
let interval_id = null;

//Création de l'url de demande de token
function create_twitch_endpoint() {
	let nonce = encodeURIComponent(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));

	let openid_url =
		`https://id.twitch.tv/oauth2/authorize
?client_id=${CLIENT_ID}
&redirect_uri=${REDIRECT_URI}
&response_type=${RESPONSE_TYPE}
&state=${STATE}
&nonce=${nonce}
`;
	return openid_url;
}
//&scope=${SCOPE}
//&claims=${CLAIMS}

if (user_signed_in) {
  chrome.browserAction.setPopup({ popup: "./popup-signed-in.html" });
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.message === "login") {
		if (user_signed_in) {
			console.log("User is already signed in.");
      chrome.browserAction.setPopup({ popup: "./popup-signed-in.html" }, () => {
        sendResponse({ message: "success" });
      })
		} else {
			// sign user in with Twitch
			chrome.identity.launchWebAuthFlow({
				url: create_twitch_endpoint(),
				interactive: true
			}, function (redirect_url) { //réponse de twitch
				if (chrome.runtime.lastError || redirect_url.includes('error=access_denied')) {
					sendResponse({ message: 'fail' });
				} else { //login successful
					ACCESS_TOKEN = redirect_url.substring(redirect_url.indexOf('access_token=') + 13);
					ACCESS_TOKEN = ACCESS_TOKEN.substring(0, ACCESS_TOKEN.indexOf('&'));
          user_signed_in = true;
          interval_id = setInterval(() => { //Vérification de la validité du token chaque heure
              fetch('https://id.twitch.tv/oauth2/validate', {
                  headers: {
                      'Authorization': 'OAuth ' + ACCESS_TOKEN
                  }
              }).then(res => {
                  console.log(res.status)
                  if (res.status === 401) { //Access denied
                    user_signed_in = false;
                    clearInterval(interval_id);
                  }
              }).catch(err => console.log(err))
          }, 3600000);
          chrome.browserAction.setPopup({ popup: "./popup-signed-in.html" }, () => {
              console.log('bruh')
              sendResponse({ message: "success" });
          })
          const now = new Date()
          now.setFullYear(now.getFullYear() + 10)
          document.cookie = ACCESS_TOKEN + `;expires=${now.toGMTString()}`
				}
			});
		}
		return true;
	} else if (request.message === "logout") {
		user_signed_in = false;
		chrome.browserAction.setPopup({ popup: "./popup.html" }, () => {
			sendResponse({ message: "success" });
		});
		return true;
	}
});

//Mise à jour des textes (titre, jeu de stream)
const check = async _ => {
    const response = await fetch('https://api.twitch.tv/helix/search/channels?query=lefatardclub', {
      method: 'GET',
      headers: {
        'client-id': '2v1htbe6nf2iw4usw6yktnjaph2cr5',
        'Authorization': 'Bearer ' + ACCESS_TOKEN
      }
    });
    //Configuration par défaut
    if (response && response.ok) { // Si la requête est passée:
      const read = await response.json()
      if (read.data && read.data[0].is_live) { // S'il y a stream, changer le texte et l'icone
        is_live = true
        icon = 'green'
      } else {
        is_live = false
        icon = 'red'
      }
    }
    
    chrome.browserAction.setIcon({ path: `img/icon_${icon}.png` })
}
  
check() // lancer une fois dès le début
setInterval(check, 5000) // puis toutes les 5 sec
  