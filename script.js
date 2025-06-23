let money = 1000;
let workers = 5;
let buildings = 0;
let busy = false;

let level = 1;
let villagersGoal = 100;
let villagersHelped = 0;
let lives = 3;
let gameOver = false;

let minibossActive = false;
let minibossLives = 3;
let minibossPowerupEarned = false;

let bossActive = false;
let bossLives = 5;
let bossPowerupEarned = false;

let playerLives = 3;
let powerupEarned = false;
let passiveIncomeMultiplier = 1;

const waterSolutions = [
  { name: "Well", cost: 200, villagersHelped: 30, emoji: "💧", buildTime: 3 },
  { name: "Rainwater Collector", cost: 100, villagersHelped: 10, emoji: "🌧️", buildTime: 2 },
  { name: "Water Filter", cost: 150, villagersHelped: 20, emoji: "🧃", buildTime: 2.5 },
  { name: "Bottled Water Delivery", cost: 50, villagersHelped: 5, emoji: "🚚", buildTime: 1 }
];

const facts = [
  "771 million people lack access to clean water.",
  "Every $40 donated can provide clean water to one person.",
  "Clean water reduces water-borne diseases by up to 50%.",
  "Women and children spend 200 million hours daily collecting water.",
  "Access to clean water improves education and health.",
  "Every well built can serve hundreds of people.",
  "Unsafe water kills more people than all forms of violence, including war.",
  "Clean water can help break the cycle of poverty.",
  "You can help make a difference—every action counts!"
];

// --- QTE Variables ---
let qteActive = false;
let qteAngle = 0;
let qteSpeed = 0.08;
let qteInterval;
let qteSuccessStart = 0;
let qteSuccessEnd = 0;
let currentBuildingIdx = null;

const quizQuestions = [
  {
    question: "What is the main mission of charity: water?",
    options: [
      "Provide clean water to people in need",
      "Build schools",
      "Plant trees",
      "Fight hunger"
    ],
    answer: 0
  },
  {
    question: "How many people lack access to clean water worldwide?",
    options: [
      "77 million",
      "771 million",
      "7.7 million",
      "1.2 billion"
    ],
    answer: 1
  },
  {
    question: "What does clean water help reduce?",
    options: [
      "Water-borne diseases",
      "Air pollution",
      "Traffic accidents",
      "Noise pollution"
    ],
    answer: 0
  },
  {
    question: "How much does it cost to provide clean water to one person, on average?",
    options: [
      "$400",
      "$40",
      "$4",
      "$4000"
    ],
    answer: 1
  },
  {
    question: "Which group is most affected by the water crisis?",
    options: [
      "Men",
      "Women and children",
      "Elderly",
      "Teenagers"
    ],
    answer: 1
  },
  {
    question: "What percentage of charity: water’s public donations go directly to water projects?",
    options: [
      "50%",
      "100%",
      "80%",
      "25%"
    ],
    answer: 1
  },
  {
    question: "What is a common result of providing clean water to a community?",
    options: [
      "Increased school attendance",
      "More pollution",
      "Less farming",
      "Higher taxes"
    ],
    answer: 0
  },
  {
    question: "What is a rainwater collector used for?",
    options: [
      "Collecting rain for drinking and daily use",
      "Catching fish",
      "Generating electricity",
      "Measuring rainfall"
    ],
    answer: 0
  },
  {
    question: "Unsafe water kills more people than which of the following?",
    options: [
      "All forms of violence, including war",
      "Car accidents",
      "Cancer",
      "Natural disasters"
    ],
    answer: 0
  },
  {
    question: "What is one way you can help solve the water crisis?",
    options: [
      "Donate to clean water charities",
      "Use more water at home",
      "Avoid drinking water",
      "Plant more trees"
    ],
    answer: 0
  }
];

const bossQuestions = [
  {
    question: "In what year was charity: water founded?",
    options: ["2006", "2010", "2001", "2015"],
    answer: 0
  },
  {
    question: "Who is the founder of charity: water?",
    options: ["Scott Harrison", "Bill Gates", "Melinda French", "Greta Thunberg"],
    answer: 0
  },
  {
    question: "What is the 100% model of charity: water?",
    options: [
      "100% of public donations fund water projects",
      "100% of staff are volunteers",
      "100% of donations go to advertising",
      "100% of projects are in Africa"
    ],
    answer: 0
  },
  {
    question: "Which technology does charity: water use to track projects?",
    options: [
      "GPS and sensors",
      "Blockchain",
      "Drones",
      "AI robots"
    ],
    answer: 0
  },
  {
    question: "How many countries has charity: water worked in?",
    options: [
      "Over 29",
      "Only 1",
      "Over 100",
      "5"
    ],
    answer: 0
  },
  {
    question: "What is a major health benefit of clean water?",
    options: [
      "Reduces diarrhea-related deaths",
      "Increases tooth decay",
      "Causes more malaria",
      "Reduces eyesight"
    ],
    answer: 0
  }
];

// --- UI and Game Logic ---
function updateUI() {
  document.getElementById('money').textContent = money;
  document.getElementById('workers').textContent = workers;
  document.getElementById('buildings').textContent = buildings;
  document.getElementById('villager-progress').max = villagersGoal;
  document.getElementById('villager-progress').value = villagersHelped;
  document.getElementById('people-benefit').textContent = villagersHelped;
  document.getElementById('lives').textContent = lives;
  renderBuildings();
  renderVillagers();
  renderActions();
  if (document.getElementById('level-indicator')) {
    document.getElementById('level-indicator').textContent = `Level: ${level}`;
  }
  if (gameOver) {
    document.getElementById('message').textContent = "Game Over! Refresh to try again.";
    disableActions();
    return;
  }
  if (bossActive) {
    document.getElementById('message').textContent = "Boss battle!";
  } else if (minibossActive) {
    document.getElementById('message').textContent = "Miniboss battle!";
  } else if (villagersHelped >= villagersGoal && !minibossPowerupEarned && !bossPowerupEarned) {
    if (level % 3 === 0) {
      document.getElementById('message').textContent = "🎉 Level complete! Face the boss for a powerup!";
    } else {
      document.getElementById('message').textContent = "🎉 Level complete! Face the miniboss for a powerup!";
    }
  } else {
    document.getElementById('message').textContent = "";
  }
  checkBossOrMinibossTrigger();
}

function renderActions() {
  const actionsDiv = document.getElementById('actions');
  actionsDiv.innerHTML = '';

  // Buildings button
  const buildBtn = document.createElement('button');
  buildBtn.textContent = "🏗️ Buildings";
  buildBtn.className = "action-btn";
  buildBtn.onclick = showBuildingModal;
  actionsDiv.appendChild(buildBtn);

  // Hire worker button
  const hireBtn = document.createElement('button');
  hireBtn.textContent = "👷 Hire Workers ($100)";
  hireBtn.className = "action-btn hire-btn";
  hireBtn.onclick = hireWorkers;
  actionsDiv.appendChild(hireBtn);

  // Donate button
  const donateBtn = document.createElement('button');
  donateBtn.textContent = "Donate to charity: water";
  donateBtn.className = "action-btn donate-btn";
  donateBtn.onclick = () => window.open('https://charitywater.org', '_blank');
  actionsDiv.appendChild(donateBtn);
}

// --- Miniboss ---
function showMinibossModal() {
  minibossActive = true;
  minibossLives = 3;
  playerLives = 3;
  document.getElementById('boss-title').textContent = "Miniboss Challenge!";
  document.getElementById('boss-desc').textContent = "Answer questions to defeat the miniboss!";
  document.getElementById('boss-lives').textContent = minibossLives;
  document.getElementById('boss-modal').style.display = 'flex';
  document.getElementById('boss-quiz-feedback').textContent = '';
  document.getElementById('powerup-message').style.display = 'none';
  showMinibossQuestion();
}

function showMinibossQuestion() {
  if (!minibossActive) return;
  const q = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
  document.getElementById('boss-quiz-question').textContent = q.question;
  const optionsDiv = document.getElementById('boss-quiz-options');
  optionsDiv.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => handleMinibossAnswer(idx, q.answer);
    optionsDiv.appendChild(btn);
  });
}

function handleMinibossAnswer(selected, correct) {
  if (!minibossActive) return;
  if (selected === correct) {
    minibossLives--;
    document.getElementById('boss-quiz-feedback').textContent = "Correct! Miniboss loses a life!";
    document.getElementById('boss-lives').textContent = minibossLives;
  } else {
    playerLives--;
    document.getElementById('boss-quiz-feedback').textContent = `Wrong! You lose a life! Lives left: ${playerLives}`;
  }
  if (minibossLives <= 0) {
    minibossPowerupEarned = true;
    minibossActive = false;
    confettiExplosion();
    document.getElementById('boss-quiz-options').innerHTML = "";
    document.getElementById('boss-quiz-feedback').textContent = "";
    document.getElementById('powerup-message').textContent = "You earned a powerup: Double passive income!";
    document.getElementById('powerup-message').style.display = 'block';
    setTimeout(() => {
      document.getElementById('boss-modal').style.display = 'none';
      powerupEarned = true;
      nextLevel();
    }, 2000);
    return;
  }
  if (playerLives <= 0) {
    minibossActive = false;
    gameOver = true;
    document.getElementById('boss-quiz-feedback').textContent = "Game Over! The miniboss defeated you!";
    document.getElementById('boss-quiz-options').innerHTML = "";
    setTimeout(() => {
      document.getElementById('boss-modal').style.display = 'none';
      updateUI();
      disableActions();
    }, 2000);
    return;
  }
  setTimeout(() => {
    document.getElementById('boss-quiz-feedback').textContent = "";
    showMinibossQuestion();
  }, 900);
}

// --- Boss ---
function showBossModal() {
  bossActive = true;
  bossLives = 5;
  playerLives = 3;
  document.getElementById('boss-title').textContent = "Boss Challenge!";
  document.getElementById('boss-desc').textContent = "Answer harder questions to defeat the boss!";
  document.getElementById('boss-lives').textContent = bossLives;
  document.getElementById('boss-modal').style.display = 'flex';
  document.getElementById('boss-quiz-feedback').textContent = '';
  document.getElementById('powerup-message').style.display = 'none';
  showBossQuestion();
}

function showBossQuestion() {
  if (!bossActive) return;
  const q = bossQuestions[Math.floor(Math.random() * bossQuestions.length)];
  document.getElementById('boss-quiz-question').textContent = q.question;
  const optionsDiv = document.getElementById('boss-quiz-options');
  optionsDiv.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => handleBossAnswer(idx, q.answer);
    optionsDiv.appendChild(btn);
  });
}

function handleBossAnswer(selected, correct) {
  if (!bossActive) return;
  if (selected === correct) {
    bossLives--;
    document.getElementById('boss-quiz-feedback').textContent = "Correct! Boss loses a life!";
    document.getElementById('boss-lives').textContent = bossLives;
  } else {
    playerLives--;
    document.getElementById('boss-quiz-feedback').textContent = `Wrong! You lose a life! Lives left: ${playerLives}`;
  }
  if (bossLives <= 0) {
    bossPowerupEarned = true;
    bossActive = false;
    confettiExplosion();
    document.getElementById('boss-quiz-options').innerHTML = "";
    document.getElementById('boss-quiz-feedback').textContent = "";
    document.getElementById('powerup-message').textContent = "You earned a powerup: Triple passive income!";
    document.getElementById('powerup-message').style.display = 'block';
    setTimeout(() => {
      document.getElementById('boss-modal').style.display = 'none';
      powerupEarned = true;
      nextLevel(true);
    }, 2000);
    return;
  }
  if (playerLives <= 0) {
    bossActive = false;
    gameOver = true;
    document.getElementById('boss-quiz-feedback').textContent = "Game Over! The boss defeated you!";
    document.getElementById('boss-quiz-options').innerHTML = "";
    setTimeout(() => {
      document.getElementById('boss-modal').style.display = 'none';
      updateUI();
      disableActions();
    }, 2000);
    return;
  }
  setTimeout(() => {
    document.getElementById('boss-quiz-feedback').textContent = "";
    showBossQuestion();
  }, 900);
}

// --- Trigger miniboss or boss after villagers goal ---
function checkBossOrMinibossTrigger() {
  if (villagersHelped >= villagersGoal && !minibossActive && !bossActive && !minibossPowerupEarned && !bossPowerupEarned) {
    if (level % 3 === 0) {
      showBossModal();
    } else {
      showMinibossModal();
    }
  }
}

// --- Move to next level ---
function nextLevel(boss = false) {
  level++;
  villagersHelped = 0;
  buildings = 0;
  minibossPowerupEarned = false;
  bossPowerupEarned = false;
  if (boss) {
    passiveIncomeMultiplier = 3;
  } else {
    passiveIncomeMultiplier = 2;
  }
  villagersGoal += 50 * level;
  updateUI();
}

// --- Passive income ---
setInterval(() => {
  let passiveIncome = Math.floor(villagersHelped / 10) * passiveIncomeMultiplier;
  if (passiveIncome > 0) {
    money += passiveIncome;
    updateUI();
  }
}, 1000);

// --- Add level indicator to UI if not present ---
window.addEventListener('DOMContentLoaded', () => {
  updateUI();
});

// --- FACTS ---
function showRandomFact() {
  const fact = facts[Math.floor(Math.random() * facts.length)];
  document.getElementById('water-fact').textContent = fact;
}
setInterval(showRandomFact, 10000);

// --- GAMEPLAY ---
function hireWorkers() {
  if (money >= 100) {
    money -= 100;
    workers += 1;
    document.getElementById('message').textContent = "You hired a worker!";
  } else {
    document.getElementById('message').textContent = `You need $100 to hire a worker.`;
  }
  updateUI();
}

// --- Buildings Under Construction ---
let buildingsInProgress = []; // {solutionIdx, finishTime, startedAt}

// --- Building Modal UI ---
function showBuildingModal() {
  let modal = document.getElementById('building-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'building-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '1000';
    modal.innerHTML = `
      <div id="building-modal-content" style="background:#fff;padding:24px 32px;border-radius:12px;max-width:600px;width:90vw;max-height:80vh;overflow-y:auto;position:relative;">
        <button id="close-building-modal" style="position:absolute;top:8px;right:8px;font-size:1.2rem;">Back</button>
        <h2 style="text-align:center;">Available Buildings</h2>
        <div id="building-list" style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;"></div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('close-building-modal').onclick = () => {
      modal.style.display = 'none';
    };
  } else {
    modal.style.display = 'flex';
  }
  renderBuildingList();
}

function renderBuildingList() {
  const listDiv = document.getElementById('building-list');
  listDiv.innerHTML = '';
  waterSolutions.forEach((solution, idx) => {
    const canAfford = money >= solution.cost && workers >= 1;
    const card = document.createElement('div');
    card.style.width = '170px';
    card.style.borderRadius = '8px';
    card.style.padding = '12px';
    card.style.margin = '4px';
    card.style.background = canAfford ? '#e3fcec' : '#eee';
    card.style.opacity = canAfford ? '1' : '0.5';
    card.style.boxShadow = canAfford ? '0 2px 8px #b2dfdb' : 'none';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'center';
    card.style.cursor = canAfford ? 'pointer' : 'not-allowed';

    card.innerHTML = `
      <div style="font-size:2rem;">${solution.emoji}</div>
      <div style="font-weight:bold;margin:6px 0 2px 0;">${solution.name}</div>
      <div style="font-size:0.95rem;">Helps <b>${solution.villagersHelped}</b> villagers</div>
      <div style="font-size:0.95rem;">Cost: $${solution.cost}</div>
      <div style="font-size:0.95rem;">Build Time: ${solution.buildTime ? solution.buildTime : 3} sec</div>
    `;
    if (canAfford) {
      card.onclick = () => {
        document.getElementById('building-modal').style.display = 'none';
        buyBuildingWithQTE(idx);
      };
    }
    listDiv.appendChild(card);
  });
}

// --- QTE Flow for Building ---
function buyBuildingWithQTE(idx) {
  const solution = waterSolutions[idx];
  if (money < solution.cost || workers < 1) {
    document.getElementById('message').textContent = `You need $${solution.cost} and at least 1 worker to build a ${solution.name}.`;
    updateUI();
    return;
  }
  // Deduct money and worker only if QTE is successful!
  currentBuildingIdx = idx;
  startQTEForBuilding(idx);
}

function startQTEForBuilding(idx) {
  qteActive = true;
  document.getElementById('qte-modal').style.display = 'flex';
  document.getElementById('qte-result').textContent = '';
  qteAngle = 0;

  // QTE difficulty based on building
  let segmentDeg, speed;
  const solution = waterSolutions[idx];
  if (solution.name === "Well") {
    segmentDeg = 20;
    speed = 0.13;
  } else if (solution.name === "Water Filter") {
    segmentDeg = 35;
    speed = 0.11;
  } else if (solution.name === "Rainwater Collector") {
    segmentDeg = 50;
    speed = 0.09;
  } else if (solution.name === "Bottled Water Delivery") {
    segmentDeg = 70;
    speed = 0.07;
  } else {
    segmentDeg = 40;
    speed = 0.09;
  }

  qteSuccessStart = Math.random() * (360 - segmentDeg);
  qteSuccessEnd = qteSuccessStart + segmentDeg;
  qteSpeed = speed;

  drawQTEWheel();

  qteInterval = setInterval(() => {
    qteAngle = (qteAngle + qteSpeed) % (2 * Math.PI);
    drawQTEWheel();
  }, 16);
}

function stopQTEForBuilding() {
  clearInterval(qteInterval);
  let pointerDeg = ((qteAngle - Math.PI/2) * 180 / Math.PI) % 360;
  if (pointerDeg < 0) pointerDeg += 360;

  let start = qteSuccessStart % 360;
  let end = qteSuccessEnd % 360;

  let inSuccess = false;
  if (start < end) {
    inSuccess = pointerDeg >= start && pointerDeg <= end;
  } else {
    inSuccess = pointerDeg >= start || pointerDeg <= end;
  }

  if (inSuccess && currentBuildingIdx !== null) {
    document.getElementById('qte-result').textContent = "Success! Building started!";
    document.getElementById('qte-result').style.color = "#388e3c";
    setTimeout(() => {
      document.getElementById('qte-modal').style.display = 'none';
      qteActive = false;
      actuallyStartBuilding(currentBuildingIdx);
      currentBuildingIdx = null;
    }, 1000);
  } else {
    document.getElementById('qte-result').textContent = "Missed! Try again!";
    document.getElementById('qte-result').style.color = "#d32f2f";
    setTimeout(() => {
      document.getElementById('qte-modal').style.display = 'none';
      qteActive = false;
      currentBuildingIdx = null;
    }, 1200);
  }
}

// Attach QTE stop button
if (document.getElementById('qte-stop-btn')) {
  document.getElementById('qte-stop-btn').onclick = stopQTEForBuilding;
}

// --- QTE Drawing ---
function drawQTEWheel() {
  const canvas = document.getElementById('qte-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.translate(w/2, h/2);

  ctx.beginPath();
  ctx.arc(0, 0, 120, 0, 2 * Math.PI);
  ctx.fillStyle = "#b2ebf2";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.arc(0, 0, 120, qteSuccessStart * Math.PI/180, qteSuccessEnd * Math.PI/180);
  ctx.closePath();
  ctx.fillStyle = "#ffd600";
  ctx.fill();

  ctx.rotate(qteAngle);
  ctx.beginPath();
  ctx.moveTo(0, -130);
  ctx.lineTo(10, -110);
  ctx.lineTo(-10, -110);
  ctx.closePath();
  ctx.fillStyle = "#d32f2f";
  ctx.fill();

  ctx.restore();
}

// --- Actually start building after QTE success ---
function actuallyStartBuilding(idx) {
  const solution = waterSolutions[idx];
  if (money < solution.cost || workers < 1) {
    document.getElementById('message').textContent = `You need $${solution.cost} and at least 1 worker to build a ${solution.name}.`;
    updateUI();
    return;
  }
  money -= solution.cost;
  workers -= 1;
  const now = Date.now();
  const buildTime = solution.buildTime ? solution.buildTime : 3;
  buildingsInProgress.push({
    solutionIdx: idx,
    finishTime: now + buildTime * 1000,
    startedAt: now
  });
  document.getElementById('message').textContent = `Started building ${solution.name}!`;
  updateUI();
}

// --- Patch updateUI to show buildings in progress ---
const oldUpdateUI = updateUI;
updateUI = function() {
  oldUpdateUI();
  renderVillagerGoal();
  renderBuildingsInProgress();
};

// --- Show Villager Goal at the bottom ---
function renderVillagerGoal() {
  let goalDiv = document.getElementById('villager-goal');
  if (!goalDiv) {
    goalDiv = document.createElement('div');
    goalDiv.id = 'villager-goal';
    goalDiv.style.marginTop = "18px";
    goalDiv.style.textAlign = "center";
    goalDiv.style.fontWeight = "bold";
    goalDiv.style.fontSize = "1.1rem";
    document.getElementById('game-container').appendChild(goalDiv);
  }
  goalDiv.textContent = `Villager Goal: Help ${villagersHelped} / ${villagersGoal} villagers`;
}

// --- RENDERING ---
function renderBuildings() {
  const container = document.getElementById('building-visual');
  container.innerHTML = '';
  for (let i = 0; i < buildings; i++) {
    const span = document.createElement('span');
    span.className = 'building-icon placed';
    span.innerHTML = '<span class="building-emoji">🏠</span><span class="building-label">Building</span>';
    container.appendChild(span);
  }
}

function renderBuildingsInProgress() {
  let progressDiv = document.getElementById('buildings-in-progress');
  if (!progressDiv) {
    progressDiv = document.createElement('div');
    progressDiv.id = 'buildings-in-progress';
    progressDiv.style.margin = "12px 0";
    progressDiv.style.textAlign = "center";
    document.getElementById('game-container').appendChild(progressDiv);
  }
  if (buildingsInProgress.length === 0) {
    progressDiv.innerHTML = '';
    return;
  }
  progressDiv.innerHTML = '<b>Buildings Under Construction:</b><br>';
  const now = Date.now();
  buildingsInProgress.forEach(b => {
    const solution = waterSolutions[b.solutionIdx];
    const total = solution.buildTime ? solution.buildTime * 1000 : 3000;
    const elapsed = Math.min(now - b.startedAt, total);
    const percent = Math.floor((elapsed / total) * 100);
    progressDiv.innerHTML += `
      <div style="margin:4px 0;">
        ${solution.emoji} ${solution.name} - ${percent}% complete
        <progress value="${percent}" max="100" style="vertical-align:middle;width:120px;"></progress>
      </div>
    `;
  });
}

function renderVillagers() {
  const container = document.getElementById('villager-visual');
  container.innerHTML = '';
  const totalVillagers = 10;
  let mood = '😢';
  if (villagersHelped >= villagersGoal) {
    mood = '😃';
  } else if (villagersHelped >= villagersGoal / 2) {
    mood = '🙂';
  }
  for (let i = 0; i < totalVillagers; i++) {
    const span = document.createElement('span');
    span.className = 'villager-icon';
    span.textContent = mood;
    container.appendChild(span);
  }
}

function disableActions() {
  document.getElementById('actions').innerHTML = '';
}

// --- Check and handle building completion ---
function checkBuildingCompletion() {
  const now = Date.now();
  let completed = [];
  buildingsInProgress.forEach((b, i) => {
    if (now >= b.finishTime) {
      completed.push(i);
      const solution = waterSolutions[b.solutionIdx];
      villagersHelped += solution.villagersHelped;
      buildings += 1;
      workers += 1; // Return worker
      document.getElementById('message').textContent = `Completed ${solution.name}! Helped ${solution.villagersHelped} villagers.`;
    }
  });
  // Remove completed from in-progress
  for (let i = completed.length - 1; i >= 0; i--) {
    buildingsInProgress.splice(completed[i], 1);
  }
  updateUI();
}

setInterval(checkBuildingCompletion, 500);

// --- Initialize UI on page load ---
window.addEventListener('DOMContentLoaded', () => {
  updateUI();
});

// --- Title Screen and Level Select ---
let gameStarted = false;
let selectedLevel = 1;

// --- Show Title Screen ---
function showTitleScreen() {
  // Hide game UI
  document.getElementById('game-container').style.display = 'none';

  // Create or show title modal
  let modal = document.getElementById('title-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'title-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '2000';
    modal.innerHTML = `
      <div style="background:#fff;padding:32px 40px;border-radius:16px;max-width:400px;text-align:center;">
        <h1 style="margin-bottom:16px;">💧 Water Game</h1>
        <div style="margin-bottom:18px;">
          <label for="level-select"><b>Select Level:</b></label>
          <select id="level-select" style="margin-left:8px;padding:4px 8px;">
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
          </select>
        </div>
        <button id="play-btn" style="padding:10px 28px;font-size:1.2rem;border-radius:8px;background:#00bcd4;color:#fff;border:none;cursor:pointer;">Play</button>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('play-btn').onclick = startGameFromTitle;
    document.getElementById('level-select').onchange = function() {
      selectedLevel = parseInt(this.value, 10);
    };
  } else {
    modal.style.display = 'flex';
  }
}

// --- Start Game from Title ---
function startGameFromTitle() {
  // Set level and reset all state
  level = selectedLevel;
  villagersGoal = 100 + (level - 1) * 50;
  villagersHelped = 0;
  lives = 3;
  money = 1000;
  workers = 5;
  buildings = 0;
  busy = false;
  gameOver = false;
  minibossActive = false;
  minibossLives = 3;
  minibossPowerupEarned = false;
  bossActive = false;
  bossLives = 5;
  bossPowerupEarned = false;
  playerLives = 3;
  powerupEarned = false;
  passiveIncomeMultiplier = 1;
  buildingsInProgress = [];
  document.getElementById('title-modal').style.display = 'none';
  document.getElementById('game-container').style.display = '';
  gameStarted = true;
  updateUI();
}

// --- Restart Level ---
function showRestartButton() {
  let restartDiv = document.getElementById('restart-div');
  if (!restartDiv) {
    restartDiv = document.createElement('div');
    restartDiv.id = 'restart-div';
    restartDiv.style.textAlign = 'center';
    restartDiv.style.marginTop = '18px';
    const btn = document.createElement('button');
    btn.textContent = "Restart Level";
    btn.style.padding = "10px 24px";
    btn.style.fontSize = "1.1rem";
    btn.style.borderRadius = "8px";
    btn.style.background = "#00bcd4";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.onclick = restartLevel;
    restartDiv.appendChild(btn);
    document.getElementById('game-container').appendChild(restartDiv);
  } else {
    restartDiv.style.display = '';
  }
}

function hideRestartButton() {
  let restartDiv = document.getElementById('restart-div');
  if (restartDiv) restartDiv.style.display = 'none';
}

function restartLevel() {
  villagersHelped = 0;
  lives = 3;
  money = 1000;
  workers = 5;
  buildings = 0;
  busy = false;
  gameOver = false;
  minibossActive = false;
  minibossLives = 3;
  minibossPowerupEarned = false;
  bossActive = false;
  bossLives = 5;
  bossPowerupEarned = false;
  playerLives = 3;
  powerupEarned = false;
  passiveIncomeMultiplier = 1;
  buildingsInProgress = [];
  hideRestartButton();
  updateUI();
}
// --- Patch updateUI to show/hide restart button on game over ---
updateUI = (function(oldUpdateUI) {
  return function() {
    oldUpdateUI();
    renderVillagerGoal();
    renderBuildingsInProgress();
    if (gameOver) {
      showRestartButton();
    } else {
      hideRestartButton();
    }
  };
})(updateUI);


// --- Show title screen on load ---
window.addEventListener('DOMContentLoaded', () => {
  showTitleScreen();
});

// --- Confetti Explosion ---
function confettiExplosion() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  const confettiCount = 120;
  const confetti = [];
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: -20,
      r: Math.random() * 6 + 4,
      d: Math.random() * confettiCount,
      color: `hsl(${Math.random() * 360}, 80%, 60%)`,
      tilt: Math.random() * 10 - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      tiltAngle: 0
    });
  }
  let angle = 0;
  let tiltAngle = 0;
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    angle += 0.01;
    tiltAngle += 0.1;
    for (let i = 0; i < confettiCount; i++) {
      let c = confetti[i];
      c.y += (Math.cos(angle + c.d) + 3 + c.r / 2) / 2;
      c.x += Math.sin(angle);
      c.tiltAngle += c.tiltAngleIncremental;
      c.tilt = Math.sin(c.tiltAngle) * 15;
      ctx.beginPath();
      ctx.lineWidth = c.r;
      ctx.strokeStyle = c.color;
      ctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
      ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 5);
      ctx.stroke();
    }
    frame++;
    if (frame < 90) {
      requestAnimationFrame(draw);
    } else {
      canvas.style.display = 'none';
    }
  }
  draw();
}
