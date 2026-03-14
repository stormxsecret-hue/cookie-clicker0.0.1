// --- intro.js ---
document.addEventListener('DOMContentLoaded', () => {
    // Création de l'interface d'intro
    const introDiv = document.createElement('div');
    introDiv.id = 'intro-layer';
    introDiv.innerHTML = `
        <div class="intro-content">
            <h1 class="intro-title">COOKIE CLICKER</h1>
            <div class="loader-container">
                <img src="images/cookie.png" class="spinning-logo" alt="Logo">
                <p>Chargement...</p>
            </div>
            <button id="start-btn" style="display:none;">PLAY</button>
            <p class="creator-tag">Créateur : stormX</p>
        </div>
    `;
    document.body.appendChild(introDiv);

    // Après 10 secondes : on cache le chargement et on montre le bouton PLAY
    setTimeout(() => {
        document.querySelector('.loader-container').style.display = 'none';
        document.getElementById('start-btn').style.display = 'block';
    }, 10000);

    // Action du bouton PLAY
    document.getElementById('start-btn').addEventListener('click', () => {
        introDiv.style.opacity = '0';
        setTimeout(() => {
            introDiv.remove();
            // Lancer la musique du jeu ici si nécessaire
            if (typeof bgMusic !== 'undefined' && !isMusicMuted) bgMusic.play();
        }, 1000);
    });
});