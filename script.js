let score = 0, cursors = 0, cursorCost = 5, clickPower = 1, clickCost = 15;
let canSave = false, isOG = false, isAdmin = false, isSBActive = false;
let adminMult = 1, isMusicMuted = false, tutoStep = 0;
let multiplier = 1, comboCount = 0, comboTimer;

const badges = {
    "OG": { name: "OG", unlocked: false, icon: "🔥" },
    "INFINITE": { name: "INFINI", unlocked: false, icon: "♾️" },
    "AUTO": { name: "APP AUTO", unlocked: false, icon: "🤖" },
    "CLIQUEUR": { name: "CLIC", unlocked: false, icon: "🍪" },
    "CREATOR": { name: "CRÉATEUR", unlocked: false, icon: "👑" }
};

// --- SONS ---
const crunchSound = new Audio('sons/crunch.mp3');
const buySound = new Audio('sons/achat.mp3');
const errorSound = new Audio('sons/erreur.mp3');
const successSound = new Audio('sons/bravo.mp3');
const comboUpSound = new Audio('sons/combo_up.mp3'); // NOUVEAU SON COMBO
const bgMusic = new Audio('sons/musique_fond.mp3');
bgMusic.loop = true; bgMusic.volume = 0.4;
let activeSBSounds = [];

function init() {
    const sB = JSON.parse(localStorage.getItem('permBadges'));
    if (sB) { for (let k in sB) { if (badges[k]) badges[k].unlocked = sB[k]; } }
    
    canSave = localStorage.getItem('canSave') === 'true';
    document.getElementById('save-toggle').checked = canSave;

    if (canSave) {
        score = parseFloat(localStorage.getItem('cookieScore')) || 0;
        cursors = parseInt(localStorage.getItem('cookieCursors')) || 0;
        clickPower = parseInt(localStorage.getItem('cookieClickPower')) || 1;
        isOG = localStorage.getItem('isOG') === 'true';
        isAdmin = localStorage.getItem('isAdmin') === 'true';
        isSBActive = localStorage.getItem('isSB') === 'true';
        cursorCost = Math.floor(5 * Math.pow(1.3, cursors));
        clickCost = Math.floor(15 * Math.pow(1.4, clickPower - 1));
    }
    if (!localStorage.getItem('tutoFini')) { tutoStep = 1; updateTuto(); }
    renderBadges(); updateUI();
}

function updateUI() {
    document.getElementById('count').innerText = Math.floor(score).toLocaleString();
    document.getElementById('pps').innerText = cursors;
    document.getElementById('click-power').innerText = clickPower;
    document.getElementById('buy-cursor').innerText = `Prix : ${cursorCost}`;
    document.getElementById('buy-click').innerText = `Prix : ${clickCost}`;
    document.getElementById('og-badge-display').style.display = isOG ? "block" : "none";
    document.getElementById('admin-icon').style.display = isAdmin ? "block" : "none";
    document.getElementById('sound-icon').style.display = isSBActive ? "block" : "none";
    
    const cb = document.getElementById('combo-text');
    cb.innerText = `COMBO: x${multiplier}`;
    cb.className = "";
    if(multiplier >= 3) cb.classList.add('combo-high');
    else if(multiplier >= 2) cb.classList.add('combo-active');

    if (canSave) {
        localStorage.setItem('cookieScore', score); localStorage.setItem('cookieCursors', cursors);
        localStorage.setItem('cookieClickPower', clickPower); localStorage.setItem('isOG', isOG);
        localStorage.setItem('isAdmin', isAdmin); localStorage.setItem('isSB', isSBActive);
    }
}

document.getElementById('cookie').addEventListener('click', () => {
    if (!isMusicMuted && bgMusic.paused) bgMusic.play().catch(()=>{});
    if (tutoStep === 1) { tutoStep = 2; updateTuto(); }
    
    let oldMult = multiplier;
    comboCount++;
    clearTimeout(comboTimer);
    
    if(comboCount >= 50) multiplier = 5;
    else if(comboCount >= 30) multiplier = 3;
    else if(comboCount >= 10) multiplier = 2;
    else multiplier = 1;

    // Déclencher le son si le combo augmente
    if (multiplier > oldMult) {
        comboUpSound.currentTime = 0;
        comboUpSound.play().catch(()=>{});
    }

    comboTimer = setTimeout(() => { comboCount = 0; multiplier = 1; updateUI(); }, 1500);

    unlockBadge("CLIQUEUR");
    let gain = (clickPower * multiplier) * adminMult;
    if (isOG) gain *= 1000;
    score += gain;
    
    crunchSound.currentTime = 0; crunchSound.play().catch(()=>{});
    updateUI();
});

function checkCode() {
    const val = document.getElementById('code-input').value.trim().toUpperCase();
    let ok = false;
    const msg = document.getElementById('code-message');

    if (val === "STROMXSECRET123") { isAdmin = true; unlockBadge("CREATOR"); ok = true; }
    else if (val === "SOUNDBOARD") { isSBActive = true; ok = true; }
    else if (val === "OG") { isOG = true; unlockBadge("OG"); ok = true; }
    else if (val === "INFINITE") { score = 9e15; unlockBadge("INFINITE"); ok = true; }
    else if (val === "AUTO") { window.open("autoclicker.exe"); unlockBadge("AUTO"); ok = true; }

    if (ok) {
        successSound.play().catch(()=>{});
        msg.innerText = "Code activé !"; msg.style.color = "#2ecc71";
    } else {
        errorSound.play().catch(()=>{});
        msg.innerText = "Code invalide."; msg.style.color = "#e74c3c";
    }
    updateUI(); document.getElementById('code-input').value = "";
}

function toggleOverlay(id) {
    const el = document.getElementById(id);
    const visible = el.style.display === "flex";
    document.querySelectorAll('.overlay').forEach(ov => ov.style.display = 'none');
    if (!visible) {
        el.style.display = "flex";
        if(id === 'shop-overlay' && tutoStep === 2) { tutoStep = 3; updateTuto(); }
        if(id === 'badge-overlay' && tutoStep === 4) { tutoStep = 5; updateTuto(); }
    }
}

function playSB(id) {
    const s = new Audio(`sons/sb${id}.mp3`);
    activeSBSounds.push(s); s.play().catch(()=>{});
}
function stopAllSounds() { activeSBSounds.forEach(s => s.pause()); activeSBSounds = []; }

function adminGiveCookies() {
    const a = parseInt(document.getElementById('admin-cookie-input').value);
    if (!isNaN(a)) { score += a; successSound.play(); updateUI(); }
}
function adminAddClick() { clickPower += 10; successSound.play(); updateUI(); }
function adminToggleX5() {
    adminMult = (adminMult === 1) ? 5 : 1;
    document.getElementById('btn-x5').innerText = adminMult === 5 ? "Multi x5 (ON)" : "Multi x5 (OFF)";
    successSound.play();
}

function buyUpgrade() {
    if (score >= cursorCost) { 
        score -= cursorCost; cursors++; 
        cursorCost = Math.floor(5*Math.pow(1.3, cursors)); 
        buySound.play(); if(tutoStep===3){tutoStep=4;updateTuto();} 
        updateUI(); 
    } else errorSound.play();
}
function buyClickUpgrade() {
    if (score >= clickCost) { 
        score -= clickCost; clickPower++; 
        clickCost = Math.floor(15*Math.pow(1.4, clickPower-1)); 
        buySound.play(); if(tutoStep===3){tutoStep=4;updateTuto();} 
        updateUI(); 
    } else errorSound.play();
}

function unlockBadge(k) {
    if (badges[k] && !badges[k].unlocked) {
        badges[k].unlocked = true;
        const save = {}; for(let x in badges) save[x] = badges[x].unlocked;
        localStorage.setItem('permBadges', JSON.stringify(save)); renderBadges();
    }
}
function renderBadges() {
    const l = document.getElementById('badge-list'); l.innerHTML = "";
    for (let k in badges) l.innerHTML += `<div class="badge-item ${badges[k].unlocked?'unlocked':''}"><div>${badges[k].icon}</div>${badges[k].name}</div>`;
}

function toggleMusic() { isMusicMuted = !isMusicMuted; if(isMusicMuted) bgMusic.pause(); else bgMusic.play(); }
function toggleSaveLogic() { canSave = document.getElementById('save-toggle').checked; localStorage.setItem('canSave', canSave); }
function resetGame() { localStorage.removeItem('cookieScore'); location.reload(); }
function fullReset() { localStorage.clear(); location.reload(); }

function updateTuto() {
    const b = document.getElementById('tuto-bubble'); b.style.display = "block";
    if (tutoStep === 1) b.innerText = "Clique sur le Cookie !";
    else if (tutoStep === 2) b.innerText = "Ouvre la Boutique !";
    else if (tutoStep === 3) b.innerText = "Achète un bonus !";
    else if (tutoStep === 4) b.innerText = "Vérifie tes Badges !";
    else { b.style.display = "none"; localStorage.setItem('tutoFini', 'true'); }
}

setInterval(() => { if (cursors > 0) { score += cursors; updateUI(); } }, 1000);
init();