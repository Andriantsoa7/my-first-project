// La clé API
var CLE_API = "a1e3f9e9a97e1fd151ba5943e4a78b63";

// la liste de nos images GIF pour chaque type de météo
var CORRESPONDANCE_ICONES = {
    "01d": "gifs/sun.gif",
    "01n": "gifs/moon.gif",
    "02d": "gifs/sunsky.gif",
    "02n": "gifs/moonsky.gif",
    "03d": "gifs/cloud.gif",
    "03n": "gifs/cloud.gif",
    "04d": "gifs/cloud.gif",
    "04n": "gifs/cloud.gif",
    "09d": "gifs/heavyrain.gif",
    "09n": "gifs/heavyrain.gif",
    "10d": "gifs/rain.gif",
    "10n": "gifs/rain.gif",
    "11d": "gifs/orageux.gif",
    "11n": "gifs/orageux.gif",
    "13d": "gifs/snow.gif",
    "13n": "gifs/snow.gif",
    "50d": "gifs/fog.gif",
    "50n": "gifs/fog.gif"
};

// On récupère tous les éléments HTML dont on aura besoin
var divMeteo = document.getElementById('meteo-resultats');
var formulaire = document.getElementById('formulaire-recherche');
var champVille = document.getElementById('champ-ville');
var boutonGps = document.getElementById('bouton-gps');
var listeHistorique = document.getElementById('historique');
var chargeur = document.getElementById('chargement');
var divFond = document.querySelector('.fond-anime');

var boutonVider = document.getElementById('bouton-vider-historique');

// On charge l'historique sauvegardé dans le navigateur, ou une liste vide si y'a rien
var historiqueRecherches = JSON.parse(localStorage.getItem('historiqueMeteo')) || [];

// Fonction pour montrer le cercle qui tourne
function montrerChargement() {
    chargeur.style.display = 'flex';
    divMeteo.style.display = 'none';
}

// Fonction pour cacher le cercle qui tourne
function cacherChargement() {
    chargeur.style.display = 'none';
    divMeteo.style.display = 'block';
}

// Fonction pour afficher les infos météo dans la page
function afficherMeteo(donnees) {
    if (donnees.cod !== 200) {
        divMeteo.innerHTML = "<p style='color:red;'>Désolé, ville non trouvée !</p>";
        changerLeFond('defaut');
        return;
    }
    var nomVille = donnees.name;
    var temperature = Math.round(donnees.main.temp);
    var description = donnees.weather[0].description;
    var codeIcone = donnees.weather[0].icon;
    var cheminGif = CORRESPONDANCE_ICONES[codeIcone];
    divMeteo.innerHTML = `
        <h3>${nomVille}</h3>
        <img class="icone-meteo" src="${cheminGif}" alt="${description}">
        <div style="font-size:2em;">${temperature}°C</div>
        <div>${description}</div>
    `;
    changerLeFond(codeIcone);
}

function changerLeFond(codeIcone) {
    var nouveauFond;
    var code = codeIcone.substring(0, 2);

    switch (code) {
        case '01': nouveauFond = 'linear-gradient(120deg, #fceabb 0%, #f8b500 100%)'; break; // Ciel clair
        case '02': nouveauFond = 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)'; break; // Peu nuageux (bleu clair)
        case '03': nouveauFond = 'linear-gradient(120deg, #d7d2cc 0%, #a8c0d3 100%)'; break; // Nuages épars (bleu-gris)
        case '04': nouveauFond = 'linear-gradient(120deg, #bdc3c7 0%, #2c3e50 100%)'; break; // Ciel couvert (gris foncé)
        case '09': nouveauFond = 'linear-gradient(120deg, #6a85b6 0%, #bac8e0 100%)'; break; // Averses (bleu-gris plus clair)
        case '10': nouveauFond = 'linear-gradient(120deg, #4e54c8 0%, #8f94fb 100%)'; break; // Pluie continue (bleu plus intense)
        case '11': nouveauFond = 'linear-gradient(120deg, #232526 0%, #414345 100%)'; break; // Orage
        case '13': nouveauFond = 'linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)'; break; // Neige
        case '50': nouveauFond = 'linear-gradient(120deg, #cfd9df 0%, #e2ebf0 100%)'; break; // Brouillard
        default: nouveauFond = 'linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)'; break; // Par défaut
    }

    if (divFond.style.background === nouveauFond) return;
    divFond.style.opacity = 0;
    setTimeout(function() {
        divFond.style.background = nouveauFond;
        divFond.style.opacity = 1;
    }, 1500);
}

function chercherMeteoParVille(ville) {
    montrerChargement();
    var url = `https://api.openweathermap.org/data/2.5/weather?q=${ville}&appid=${CLE_API}&units=metric&lang=fr`;
    fetch(url)
        .then(function(reponse) { return reponse.json(); })
        .then(function(donnees) {
            cacherChargement();
            afficherMeteo(donnees);
            if (donnees.cod === 200) ajouterALhistorique(donnees.name);
        })
        .catch(function(erreur) {
            cacherChargement();
            divMeteo.innerHTML = "<p style='color:red;'>Erreur de réseau.</p>";
            changerLeFond('defaut');
        });
}

function chercherMeteoParCoords(latitude, longitude) {
    montrerChargement();
    var url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${CLE_API}&units=metric&lang=fr`;
    fetch(url)
        .then(function(reponse) { return reponse.json(); })
        .then(function(donnees) {
            cacherChargement();
            afficherMeteo(donnees);
            if (donnees.cod === 200) ajouterALhistorique(donnees.name);
        })
        .catch(function(erreur) {
            cacherChargement();
            divMeteo.innerHTML = "<p style='color:red;'>Erreur de réseau.</p>";
            changerLeFond('defaut');
        });
}

// --- GESTION DE L'HISTORIQUE ---

function ajouterALhistorique(ville) {
    if (!historiqueRecherches.includes(ville)) {
        historiqueRecherches.unshift(ville);
        if (historiqueRecherches.length > 5) historiqueRecherches.pop();
        localStorage.setItem('historiqueMeteo', JSON.stringify(historiqueRecherches));
        afficherHistorique();
    }
}

function afficherHistorique() {
    listeHistorique.innerHTML = '';
    historiqueRecherches.forEach(function(ville) {
        var li = document.createElement('li');
        li.textContent = ville;
        li.onclick = function() { chercherMeteoParVille(ville); };
        listeHistorique.appendChild(li);
    });
}

// MODIFICATION : Nouvelle fonction pour vider l'historique
function viderHistorique() {
    // On demande confirmation avant de tout effacer
    var confirmation = confirm("Voulez-vous vraiment effacer tout l'historique ?");
    if (confirmation) {
        historiqueRecherches = []; // On vide la liste
        localStorage.removeItem('historiqueMeteo'); // On supprime du stockage du navigateur
        afficherHistorique(); // On met à jour l'affichage (qui sera vide)
    }
}

// --- GESTION DES EVENEMENTS (CLICS, ETC.) ---

formulaire.onsubmit = function(evenement) {
    evenement.preventDefault();
    var ville = champVille.value.trim();
    if (ville) {
        chercherMeteoParVille(ville);
        champVille.value = '';
    }
};

boutonGps.onclick = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) { chercherMeteoParCoords(position.coords.latitude, position.coords.longitude); },
            function(erreur) {
                divMeteo.innerHTML = "<p style='color:red;'>Impossible d'accéder à votre position.</p>";
                changerLeFond('defaut');
            }
        );
    } else {
        alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
};


boutonVider.onclick = viderHistorique;


// --- INITIALISATION DE LA PAGE ---
afficherHistorique();
if (historiqueRecherches.length > 0) {
    chercherMeteoParVille(historiqueRecherches[0]);
} else {
    changerLeFond('defaut');
}