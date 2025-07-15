// --- DATA ---
const workerTypes = ["Builder", "Technician", "Driver"];
let workers = [];
let buildings = 0;
let buildingsByType = {
  "Well": 0,
  "Rainwater Collector": 0,
  "Water Filter": 0,
  "Bottled Water Delivery": 0
};
let buildingsInProgress = [];
let money = 1000;
let villagersHelped = 0;
let villagersGoal = 50;
let lives = 3;
let level = 1;
let gameOver = false;
let minibossActive = false;
let bossActive = false;
let minibossPowerupEarned = false;
let bossPowerupEarned = false;
let passiveIncomeMultiplier = 1;
let playerLives = 3;
let bossLives = 5;
let minibossLives = 3;
let powerupEarned = false;
let currentBuildingIdx = null;
let qteActive = false;
let qteAngle = 0;
let qteSuccessStart = 0;
let qteSuccessEnd = 0;
let qteSpeed = 0.08;
let qteInterval;
let villagerAnimationActive = false;
let villagerAnimationTimeout = null;

// --- DIALOGUES ---
const villagerDialogues = {
  happy: [
    "Thank you for the clean water!",
    "Life is so much better now!",
    "I feel healthy and strong!",
    "Our village is thriving!",
    "You’re a hero to us!"
  ],
  neutral: [
    "Things are improving.",
    "I hope for more help soon.",
    "Clean water makes a difference.",
    "We’re grateful for your work.",
    "Can you help our neighbors too?"
  ],
  sad: [
    "We still need more help.",
    "Water is still hard to find.",
    "I wish things were better.",
    "Some days are tough.",
    "Please don’t forget us."
  ]
};

// --- FACTS ---
const facts = [
  "771 million people lack access to clean water.",
  "It costs about $40 to bring clean water to one person.",
  "Clean water reduces water-borne diseases by up to 50%.",
  "Women and girls spend 200 million hours daily collecting water.",
  "Access to clean water improves education and health.",
  "A single well can serve hundreds of people.",
  "Dirty water kills more people than all forms of violence, including war.",
  "Clean water can help break the cycle of poverty.",
  "You can make a difference—every action counts!"
];

// --- BUILDINGS ---
const waterSolutions = [
  { name: "Well", cost: 200, villagersHelped: 30, emoji: "💧", buildTime: 3, upgrades: [
    { name: "Deeper Well", cost: 120, villagersHelped: 20, description: "Reach more villagers with a deeper well." }
  ]},
  { name: "Rainwater Collector", cost: 100, villagersHelped: 10, emoji: "🌧️", buildTime: 2, upgrades: [
    { name: "Filtration System", cost: 80, villagersHelped: 10, description: "Cleaner rainwater for more villagers." }
  ]},
  { name: "Water Filter", cost: 150, villagersHelped: 20, emoji: "🧃", buildTime: 2.5, upgrades: [
    { name: "Advanced Filter", cost: 100, villagersHelped: 15, description: "Removes more contaminants." }
  ]},
  { name: "Bottled Water Delivery", cost: 50, villagersHelped: 5, emoji: "🚚", buildTime: 1, upgrades: [
    { name: "Larger Truck", cost: 60, villagersHelped: 10, description: "Deliver more water per trip." }
  ]}
];

// --- QUIZ QUESTIONS (stub) ---
const quizQuestions = [
  // Add your quiz questions here
];

const minibossQuestions = [
  {
    question: "What is the main benefit of clean water?",
    options: [
      { text: "Reduces disease", correct: true },
      { text: "Makes water taste better", correct: false }
    ]
  },
  {
    question: "Who is most affected by lack of clean water?",
    options: [
      { text: "Children", correct: true },
      { text: "Tourists", correct: false }
    ]
  },
  {
    question: "How does clean water help education?",
    options: [
      { text: "Kids miss less school", correct: true },
      { text: "Schools get more money", correct: false }
    ]
  }
];

const bossQuestions = [
  {
    question: "How many people lack access to clean water?",
    options: [
      { text: "771 million", correct: true },
      { text: "100 million", correct: false }
    ]
  },
  {
    question: "What is a common water-borne disease?",
    options: [
      { text: "Cholera", correct: true },
      { text: "Asthma", correct: false }
    ]
  },
  {
    question: "How much does it cost to bring clean water to one person?",
    options: [
      { text: "$40", correct: true },
      { text: "$400", correct: false }
    ]
  },
  {
    question: "Who spends 200 million hours daily collecting water?",
    options: [
      { text: "Women and girls", correct: true },
      { text: "Men and boys", correct: false }
    ]
  },
  {
    question: "What does clean water improve?",
    options: [
      { text: "Health and education", correct: true },
      { text: "Only taste", correct: false }
    ]
  }
];

// --- GAMEPLAY ---
function hireWorkers() {
  if (money >= 100) {
    money -= 100;
    workers.push({
      name: "Worker " + (workers.length + 1),
      type: workerTypes[workers.length % workerTypes.length],
      fatigue: 0,
      trained: false,
      happy: 100,
      assigned: null
    });
    document.getElementById('message').textContent = "You hired a worker!";
  } else {
    document.getElementById('message').textContent = `You need $100 to hire a worker.`;
  }
  updateUI();
}

function setupWorkers() {
  workers = [];
  for (let i = 0; i < 5; i++) {
    workers.push({
      name: "Worker " + (i + 1),
      type: workerTypes[i % workerTypes.length],
      fatigue: 0,
      trained: false,
      happy: 100,
      assigned: null
    });
  }
}

// --- BUILDING MODAL ---
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
  const availableWorkers = workers.filter(w => w.assigned === null).length;
  waterSolutions.forEach((solution, idx) => {
    const canAfford = money >= solution.cost && availableWorkers >= 1;
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

// --- QTE ---
function buyBuildingWithQTE(idx) {
  const solution = waterSolutions[idx];
  if (money < solution.cost || workers.filter(w => w.assigned === null).length < 1) {
    document.getElementById('message').textContent = `You need $${solution.cost} and at least 1 worker to build a ${solution.name}.`;
    updateUI();
    return;
  }
  currentBuildingIdx = idx;
  startQTEForBuilding(idx);
}

function startQTEForBuilding(idx) {
  qteActive = true;
  document.getElementById('qte-modal').style.display = 'flex';
  document.getElementById('qte-result').textContent = '';
  qteAngle = 0;

  // Ensure the stop button always works
  const stopBtn = document.getElementById('qte-stop-btn');
  if (stopBtn) {
    stopBtn.onclick = stopQTEForBuilding;
  }

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

// --- BUILDING LOGIC ---
function actuallyStartBuilding(idx) {
  const solution = waterSolutions[idx];
  const availableWorkers = workers.filter(w => w.assigned === null);
  if (money < solution.cost || availableWorkers.length < 1) {
    document.getElementById('message').textContent = `You need $${solution.cost} and at least 1 available worker to build a ${solution.name}.`;
    updateUI();
    return;
  }
  money -= solution.cost;
  availableWorkers[0].assigned = idx;
  const now = Date.now();
  const buildTime = solution.buildTime ? solution.buildTime : 3;
  buildingsInProgress.push({
    solutionIdx: idx,
    finishTime: now + buildTime * 1000,
    startedAt: now,
    assignedWorkers: [workers.indexOf(availableWorkers[0])]
  });
  document.getElementById('message').textContent = `Started building ${solution.name}!`;
  updateUI();
}

// --- BUILDING COMPLETION ---
function checkBuildingCompletion() {
  const now = Date.now();
  let completed = [];
  buildingsInProgress.forEach((b, i) => {
    if (now >= b.finishTime) {
      completed.push(i);
      const solution = waterSolutions[b.solutionIdx];
      if (b.assignedWorkers) {
        b.assignedWorkers.forEach(idx => {
          if (workers[idx]) workers[idx].assigned = null;
        });
      }
      buildingsByType[solution.name] = (buildingsByType[solution.name] || 0) + 1;
      document.getElementById('message').textContent = `Completed ${solution.name}! Helped ${solution.villagersHelped} villagers.`;
      villagersHelped += solution.villagersHelped;
      checkMilestones();
    }
  });
  for (let i = completed.length - 1; i >= 0; i--) {
    buildingsInProgress.splice(completed[i], 1);
  }
  updateUI();
}
setInterval(checkBuildingCompletion, 1000);

// --- UI PATCH ---
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

function renderBuildings() {
  const container = document.getElementById('building-visual');
  container.innerHTML = '';
  let statusBar = document.createElement('div');
  statusBar.className = 'village-status-bar';
  statusBar.style.display = 'flex';
  statusBar.style.justifyContent = 'center';
  statusBar.style.gap = '24px';
  statusBar.style.marginBottom = '8px';
  statusBar.style.fontWeight = 'bold';
  statusBar.style.fontSize = '1.1rem';

  Object.keys(buildingsByType).forEach(type => {
    if (buildingsByType[type] > 0) {
      const solution = waterSolutions.find(s => s.name === type);
      const emoji = solution ? solution.emoji : '🏠';
      let item = document.createElement('span');
      item.innerHTML = `${emoji} ${type}: <b>${buildingsByType[type]}</b>`;
      statusBar.appendChild(item);
    }
  });

  if (statusBar.children.length === 0) {
    statusBar.innerHTML = `<span style="color:#888;">No buildings yet. Build something to help your villagers!</span>`;
  }

  container.appendChild(statusBar);
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
    const total = b.finishTime - b.startedAt;
    const elapsed = Math.min(now - b.startedAt, total);
    const percent = now >= b.finishTime ? 100 : Math.floor((elapsed / total) * 100);
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
  let villageSVG = `
    <svg width="700" height="120" viewBox="0 0 700 120" style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:0;">
      <rect width="700" height="120" fill="#e3f2fd"/>
      <ellipse cx="350" cy="120" rx="320" ry="40" fill="#9ccc65"/>
      ${hasBuildingType("Well") ? `<circle cx="120" cy="100" r="18" fill="#b3e5fc" stroke="#888" stroke-width="3"/><rect x="110" y="82" width="20" height="8" fill="#fffde7" stroke="#888" stroke-width="2"/>` : ""}
      ${hasBuildingType("Rainwater Collector") ? `<rect x="200" y="80" width="32" height="18" fill="#fffde7" stroke="#1976d2" stroke-width="2"/><rect x="210" y="70" width="12" height="10" fill="#64b5f6" stroke="#1976d2" stroke-width="2"/>` : ""}
      ${hasBuildingType("Water Filter") ? `<rect x="300" y="85" width="24" height="13" fill="#fffde7" stroke="#388e3c" stroke-width="2"/><ellipse cx="312" cy="91" rx="8" ry="5" fill="#b2dfdb" stroke="#388e3c" stroke-width="2"/>` : ""}
      ${hasBuildingType("Bottled Water Delivery") ? `<rect x="400" y="90" width="28" height="10" fill="#fffde7" stroke="#d32f2f" stroke-width="2"/><rect x="410" y="85" width="8" height="5" fill="#ffd600" stroke="#d32f2f" stroke-width="2"/>` : ""}
    </svg>
  `;
  container.style.position = "relative";
  container.innerHTML = villageSVG;

  const totalVillagers = 10;
  function hasBuildingType(name) {
    return buildingsByType[name] && buildingsByType[name] > 0;
  }
  let moodColor = '#888';
  let mouth = '';
  let eyeY = 25;
  let eyeRadius = 2.2;
  let leftEyebrow = '';
  let rightEyebrow = '';

  if (villagersHelped >= villagersGoal) {
    moodColor = '#388e3c';
    mouth = '<path d="M18 36 Q25 44 32 36" stroke="#388e3c" stroke-width="2" fill="none"/>';
    leftEyebrow = '<rect x="16" y="21" width="6" height="2" rx="1" fill="#388e3c" transform="rotate(-10 19 22)"/>';
    rightEyebrow = '<rect x="28" y="21" width="6" height="2" rx="1" fill="#388e3c" transform="rotate(10 31 22)"/>';
  } else if (villagersHelped >= villagersGoal / 2) {
    moodColor = '#1976d2';
    mouth = '<rect x="20" y="38" width="10" height="2" rx="1" fill="#1976d2"/>';
    leftEyebrow = '<rect x="16" y="21" width="6" height="2" rx="1" fill="#1976d2"/>';
    rightEyebrow = '<rect x="28" y="21" width="6" height="2" rx="1" fill="#1976d2"/>';
  } else {
    moodColor = '#d32f2f';
    mouth = '<path d="M18 42 Q25 34 32 42" stroke="#d32f2f" stroke-width="2" fill="none"/>';
    leftEyebrow = '<rect x="16" y="19" width="6" height="2" rx="1" fill="#d32f2f" transform="rotate(10 19 20)"/>';
    rightEyebrow = '<rect x="28" y="19" width="6" height="2" rx="1" fill="#d32f2f" transform="rotate(-10 31 20)"/>';
  }

  for (let i = 0; i < totalVillagers; i++) {
    const span = document.createElement('span');
    span.className = 'villager-icon';
    span.style.position = "relative";
    span.style.zIndex = "1";
    let moodKey;
    if (villagersHelped >= villagersGoal) {
      moodKey = "happy";
    } else if (villagersHelped >= villagersGoal / 2) {
      moodKey = "neutral";
    } else {
      moodKey = "sad";
    }
    const dialogueArr = villagerDialogues[moodKey];
    const dialogue = dialogueArr[Math.floor(Math.random() * dialogueArr.length)];
    const dialogueDiv = document.createElement('div');
    dialogueDiv.className = 'villager-dialogue';
    dialogueDiv.textContent = dialogue;
    dialogueDiv.style.position = 'absolute';
    dialogueDiv.style.bottom = '70px';
    dialogueDiv.style.left = '50%';
    dialogueDiv.style.transform = 'translateX(-50%)';
    dialogueDiv.style.background = 'rgba(255,255,255,0.95)';
    dialogueDiv.style.borderRadius = '8px';
    dialogueDiv.style.padding = '6px 12px';
    dialogueDiv.style.fontSize = '1rem';
    dialogueDiv.style.boxShadow = '0 2px 8px #bbb';
    dialogueDiv.style.whiteSpace = 'nowrap';
    dialogueDiv.style.display = 'none';
    dialogueDiv.style.pointerEvents = 'none';

    span.innerHTML = `
      <svg width="50" height="60" viewBox="0 0 50 60">
        <circle cx="25" cy="25" r="15" fill="#ffe0b2" stroke="#888" stroke-width="1"/>
        <circle cx="19" cy="${eyeY}" r="${eyeRadius}" fill="#222"/>
        <circle cx="31" cy="${eyeY}" r="${eyeRadius}" fill="#222"/>
        ${leftEyebrow}
        ${rightEyebrow}
        ${mouth}
        <rect x="17" y="40" width="16" height="18" rx="8" fill="${moodColor}" stroke="#888" stroke-width="1"/>
        <rect x="7" y="44" width="10" height="5" rx="2.5" fill="#ffe0b2" stroke="#888" stroke-width="1"/>
        <rect x="33" y="44" width="10" height="5" rx="2.5" fill="#ffe0b2" stroke="#888" stroke-width="1"/>
        <rect x="19" y="58" width="4" height="8" rx="2" fill="#888"/>
        <rect x="27" y="58" width="4" height="8" rx="2" fill="#888"/>
      </svg>
    `;
    span.appendChild(dialogueDiv);

    span.addEventListener('mouseenter', () => {
      if (!span.classList.contains('jump-once')) {
        span.classList.add('jump-once');
        setTimeout(() => span.classList.remove('jump-once'), 500);
      }
      dialogueDiv.style.display = 'block';
    });
    span.addEventListener('mouseleave', () => {
      dialogueDiv.style.display = 'none';
    });

    container.appendChild(span);
  }
}

// --- UI PATCH ---
function renderBuildingListSection() {
  let listDiv = document.getElementById('building-list-section');
  if (!listDiv) {
    listDiv = document.createElement('div');
    listDiv.id = 'building-list-section';
    listDiv.style.margin = "12px 0";
    listDiv.style.textAlign = "center";
    listDiv.style.fontWeight = "bold";
    listDiv.style.fontSize = "1.05rem";
    document.getElementById('game-container').appendChild(listDiv);
  }
  let html = `<div style="margin-bottom:6px;">Your Buildings:</div>`;
  Object.keys(buildingsByType).forEach(type => {
    if (buildingsByType[type] > 0) {
      html += `<div>${type}: <b>${buildingsByType[type]}</b></div>`;
    }
  });
  listDiv.innerHTML = html;
}

// --- WORKER LIST ---
function renderWorkerList() {
  let div = document.getElementById('worker-list');
  if (!div) {
    div = document.createElement('div');
    div.id = 'worker-list';
    div.style.margin = "12px 0";
    document.getElementById('game-container').appendChild(div);
  }
  div.innerHTML = `<b style="font-size:1.1rem;">Workers:</b><br>
    <div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;">${
      workers.map((w, i) => `
        <div style="
          background:#fff;
          border-radius:10px;
          box-shadow:0 2px 8px #b2dfdb;
          padding:12px 18px;
          min-width:170px;
          max-width:200px;
          font-size:1rem;
          text-align:left;
          display:flex;
          flex-direction:column;
          align-items:flex-start;
        ">
          <div style="font-weight:bold;">${w.name} <span style="font-size:0.9rem;color:#888;">(${w.type})</span></div>
          <div>Fatigue: <b>${w.fatigue}</b></div>
          <div>Trained: <b style="color:${w.trained ? '#388e3c' : '#d32f2f'}">${w.trained ? "Yes" : "No"}</b></div>
          <div>Happy: <b>${w.happy}</b></div>
          <div>Status: <b style="color:${w.assigned !== null ? '#1976d2' : '#388e3c'}">${w.assigned !== null ? "Assigned" : "Available"}</b></div>
          ${!w.trained ? `<button class="train-worker-btn" data-worker="${i}" style="margin-top:8px;">Train</button>` : ""}
        </div>
      `).join('')
    }</div>`;

  // Add event listeners for train buttons
  div.querySelectorAll('.train-worker-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = parseInt(btn.getAttribute('data-worker'));
      trainWorker(idx);
    };
  });
}

// --- TRAIN WORKER ---
function trainWorker(idx) {
  if (workers[idx] && !workers[idx].trained) {
    if (money >= 50) {
      money -= 50;
      workers[idx].trained = true;
      workers[idx].happy += 15;
      document.getElementById('message').textContent = `${workers[idx].name} is now trained!`;
    } else {
      document.getElementById('message').textContent = "You need $50 to train a worker.";
    }
    updateUI();
  }
}

// --- RANDOM WORKER EVENTS ---
function randomWorkerEvent() {
  if (gameMode !== "hard") return;
  const w = workers[Math.floor(Math.random() * workers.length)];
  const eventType = Math.random();
  if (eventType < 0.33) {
    w.happy -= 20;
    showMessage(`${w.name} is sick and needs rest!`);
  } else if (eventType < 0.66) {
    w.happy += 10;
    showMessage(`${w.name} is motivated!`);
  } else {
    w.happy -= 10;
    showMessage(`${w.name} wants a raise!`);
  }
  if (w.happy < 30) {
    showMessage(`${w.name} quit!`);
    workers = workers.filter(x => x !== w);
  }
}
setInterval(randomWorkerEvent, 15000);

// --- FACTS ---
function showRandomFact() {
  const fact = facts[Math.floor(Math.random() * facts.length)];
  document.getElementById('water-fact').textContent = fact;
}
setInterval(showRandomFact, 10000);

// --- GAME START ---
document.getElementById('normal-mode-btn').onclick = () => {
  gameMode = "normal";
  startGameFromTitle();
};
document.getElementById('hard-mode-btn').onclick = () => {
  gameMode = "hard";
  startGameFromTitle();
};

function startGameFromTitle() {
  money = 1000;
  villagersHelped = 0;
  lives = 3;
  level = 1;
  buildings = 0;
  gameOver = false;
  minibossActive = false;
  bossActive = false;
  minibossPowerupEarned = false;
  bossPowerupEarned = false;
  passiveIncomeMultiplier = 1;
  setupWorkers();
  document.getElementById('title-modal').style.display = 'none';
  document.getElementById('game-container').style.display = '';
  updateUI();
}

// --- PATCH updateUI ---
const oldUpdateUI = typeof updateUI === "function" ? updateUI : function(){};
function updateUI() {
  updateStatsBar();
  updateVillagerProgress();
  ensureBaseUI();

  // --- LEVEL PROGRESSION ---
  if (villagersHelped >= villagersGoal && !gameOver) {
    nextLevel();
    return; // Prevent further UI updates until next level is set
  }

  renderVillagerGoal();
  renderBuildingsInProgress();
  renderBuildingListSection();
  renderWorkerList();
  renderBuildings();
  renderVillagers();

  // --- BUTTONS: Place directly under villagers ---
  let btnDiv = document.getElementById('action-buttons');
  if (!btnDiv) {
    btnDiv = document.createElement('div');
    btnDiv.id = 'action-buttons';
    btnDiv.style.width = '100%';
    btnDiv.style.display = 'flex';
    btnDiv.style.justifyContent = 'center';
    btnDiv.style.gap = '18px';
    btnDiv.style.margin = '18px 0 28px 0';
    document.getElementById('game-container').appendChild(btnDiv);
  }
  btnDiv.innerHTML = `
    <button class="main-action-btn" id="hire-worker-btn">Hire Worker ($100)</button>
    <button class="main-action-btn" id="build-btn">Build Water Solution</button>
    <button class="main-action-btn" id="donate-btn">Donate!</button>
  `;

  document.getElementById('hire-worker-btn').onclick = hireWorkers;
  document.getElementById('build-btn').onclick = showBuildingModal;
  document.getElementById('donate-btn').onclick = function() {
    window.open('https://charitywater.org/donate', '_blank');
  };

  setupVillagerHover();
}

function updateStatsBar() {
  document.getElementById('money').textContent = money;
  document.getElementById('workers').textContent = workers.length;
  document.getElementById('buildings').textContent = Object.values(buildingsByType).reduce((a,b) => a+b, 0);
  document.getElementById('lives').textContent = lives;
}

function updateVillagerProgress() {
  let progress = document.getElementById('villager-progress');
  if (!progress) {
    progress = document.createElement('progress');
    progress.id = 'villager-progress';
    progress.max = villagersGoal;
    progress.value = villagersHelped;
    progress.style.display = 'block';
    progress.style.margin = '0 auto 12px auto';
    progress.style.width = '60%';
    document.getElementById('game-container').appendChild(progress);
  } else {
    progress.max = villagersGoal;
    progress.value = villagersHelped;
  }
}

// --- PASSIVE INCOME ---
setInterval(() => {
  let passiveIncome = Math.floor(villagersHelped / 10) * passiveIncomeMultiplier;
  if (passiveIncome > 0) {
    money += passiveIncome;
    updateUI();
  }
}, 1000);

// --- INIT ---
window.addEventListener('DOMContentLoaded', () => {
  updateUI();
});

function ensureBaseUI() {
  const container = document.getElementById('game-container');
  if (!document.getElementById('message')) {
    const msgDiv = document.createElement('div');
    msgDiv.id = 'message';
    msgDiv.style.textAlign = 'center';
    msgDiv.style.margin = '12px 0';
    msgDiv.style.fontWeight = 'bold';
    container.appendChild(msgDiv);
  }
  if (!document.getElementById('water-fact')) {
    const factDiv = document.createElement('div');
    factDiv.id = 'water-fact';
    factDiv.style.textAlign = 'center';
    factDiv.style.margin = '8px 0';
    factDiv.style.fontStyle = 'italic';
    container.appendChild(factDiv);
  }
  if (!document.getElementById('building-visual')) {
    const buildDiv = document.createElement('div');
    buildDiv.id = 'building-visual';
    buildDiv.style.margin = '12px 0';
    container.appendChild(buildDiv);
  }
  if (!document.getElementById('villager-visual')) {
    const villDiv = document.createElement('div');
    villDiv.id = 'villager-visual';
    villDiv.style.margin = '12px 0';
    container.appendChild(villDiv);
  }
  if (!document.getElementById('qte-modal')) {
    const qteDiv = document.createElement('div');
    qteDiv.id = 'qte-modal';
    qteDiv.style.position = 'fixed';
    qteDiv.style.top = '0';
    qteDiv.style.left = '0';
    qteDiv.style.width = '100vw';
    qteDiv.style.height = '100vh';
    qteDiv.style.background = 'rgba(0,0,0,0.7)';
    qteDiv.style.display = 'none';
    qteDiv.style.alignItems = 'center';
    qteDiv.style.justifyContent = 'center';
    qteDiv.style.zIndex = '1001';
    qteDiv.innerHTML = `
      <div style="background:#fff;padding:24px 32px;border-radius:12px;max-width:400px;width:90vw;position:relative;text-align:center;">
        <canvas id="qte-canvas" width="260" height="260" style="margin-bottom:12px;"></canvas>
        <div id="qte-result" style="font-weight:bold;font-size:1.2rem;"></div>
        <button id="qte-stop-btn" style="margin-top:12px;">Stop</button>
      </div>
    `;
    document.body.appendChild(qteDiv);
    qteDiv.querySelector('button').onclick = stopQTEForBuilding;
  }
  if (!document.getElementById('building-modal')) {
    const modal = document.createElement('div');
    modal.id = 'building-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.7)';
    modal.style.display = 'none';
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
  }
  renderBuildingList();
}

// --- LEVEL PROGRESSION ---
function nextLevel() {
  level += 1;
  villagersGoal += 50;
  villagersHelped = 0;
  lives += 1;
  document.getElementById('message').textContent = `Level up! Welcome to Level ${level}. New goal: Help ${villagersGoal} villagers.`;

  // Trigger miniboss at level 3
  if (level === 3 && !minibossActive) {
    minibossActive = true;
    showMinibossBattle();
    return;
  }

  // Trigger boss at level 5
  if (level === 5 && !bossActive) {
    bossActive = true;
    showBossBattle();
    return;
  }

  updateUI();
}

const milestones = [
  { value: 10, message: "Halfway to your first goal!" },
  { value: 25, message: "Great job! You're making a real impact." },
  { value: 50, message: "Goal reached! Level up!" },
  { value: 100, message: "Amazing! 100 villagers helped!" },
  { value: 250, message: "You're a water hero!" },
  { value: 500, message: "Unbelievable! 500 lives changed!" }
];
let shownMilestones = new Set();

function shuffleQuestions(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showMinibossBattle() {
  minibossQuestionIdx = 0;
  minibossQuestionsShuffled = shuffleQuestions([...minibossQuestions]);
  const modal = document.getElementById('boss-modal');
  modal.style.display = 'flex';
  document.getElementById('boss-lives').textContent = minibossLives;
  renderMinibossQuestion();
}

function renderMinibossQuestion() {
  const q = minibossQuestionsShuffled[minibossQuestionIdx % minibossQuestionsShuffled.length];
  document.getElementById('boss-quiz-question').textContent = "Miniboss: " + q.question;
  document.getElementById('boss-quiz-options').innerHTML = q.options.map((opt, i) =>
    `<button onclick="handleMinibossAnswer(${opt.correct})">${opt.text}</button>`
  ).join('');
  document.getElementById('boss-quiz-feedback').textContent = "";
}

function showBossBattle() {
  bossQuestionIdx = 0;
  bossQuestionsShuffled = shuffleQuestions([...bossQuestions]);
  const modal = document.getElementById('boss-modal');
  modal.style.display = 'flex';
  document.getElementById('boss-lives').textContent = bossLives;
  renderBossQuestion();
}

function renderBossQuestion() {
  const q = bossQuestionsShuffled[bossQuestionIdx % bossQuestionsShuffled.length];
  document.getElementById('boss-quiz-question').textContent = "Boss: " + q.question;
  document.getElementById('boss-quiz-options').innerHTML = q.options.map((opt, i) =>
    `<button onclick="handleBossAnswer(${opt.correct})">${opt.text}</button>`
  ).join('');
  document.getElementById('boss-quiz-feedback').textContent = "";
}

function handleMinibossAnswer(correct) {
  if (correct) {
    minibossLives -= 1;
    minibossQuestionIdx++;
    document.getElementById('boss-quiz-feedback').textContent = "Correct!";
    document.getElementById('boss-lives').textContent = minibossLives;
    if (minibossLives <= 0) {
      document.getElementById('boss-modal').style.display = 'none';
      minibossActive = false;
      minibossQuestionIdx = 0;
      document.getElementById('message').textContent = "You defeated the miniboss!";
      passiveIncomeMultiplier += 1;
      updateUI();
    } else {
      setTimeout(renderMinibossQuestion, 900);
    }
  } else {
    document.getElementById('boss-quiz-feedback').textContent = "Wrong! Try again.";
  }
}

function handleBossAnswer(correct) {
  if (correct) {
    bossLives -= 1;
    bossQuestionIdx++;
    document.getElementById('boss-quiz-feedback').textContent = "Correct!";
    document.getElementById('boss-lives').textContent = bossLives;
    if (bossLives <= 0) {
      document.getElementById('boss-modal').style.display = 'none';
      bossActive = false;
      bossQuestionIdx = 0;
      document.getElementById('message').textContent = "You defeated the boss!";
      passiveIncomeMultiplier += 2;
      updateUI();
    } else {
      setTimeout(renderBossQuestion, 900);
    }
  } else {
    document.getElementById('boss-quiz-feedback').textContent = "Wrong! Try again.";
  }
}

// Make handlers globally accessible for inline onclick
window.handleMinibossAnswer = handleMinibossAnswer;
window.handleBossAnswer = handleBossAnswer;

// --- UPGRADES ---
function showUpgradeModal(type) {
  const solution = waterSolutions.find(s => s.name === type);
  if (!solution || !solution.upgrades) return;
  let modal = document.getElementById('upgrade-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'upgrade-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '1002';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div style="background:#fff;padding:24px 32px;border-radius:12px;max-width:400px;width:90vw;position:relative;">
      <button onclick="document.getElementById('upgrade-modal').style.display='none'" style="position:absolute;top:8px;right:8px;">Close</button>
      <h2>Upgrade ${solution.name}</h2>
      ${solution.upgrades.map((upg, i) => `
        <div style="margin-bottom:12px;">
          <b>${upg.name}</b> - $${upg.cost}<br>
          <span>${upg.description}</span><br>
          <button onclick="buyUpgrade('${type}', ${i})">Buy Upgrade</button>
        </div>
      `).join('')}
    </div>
  `;
  modal.style.display = 'flex';
}

function buyUpgrade(type, idx) {
  const solution = waterSolutions.find(s => s.name === type);
  const upg = solution.upgrades[idx];
  if (money >= upg.cost) {
    money -= upg.cost;
    villagersHelped += upg.villagersHelped;
    document.getElementById('message').textContent = `Upgraded ${type}: ${upg.name}! Helped ${upg.villagersHelped} more villagers.`;
    document.getElementById('upgrade-modal').style.display = 'none';
    updateUI();
  } else {
    document.getElementById('message').textContent = "Not enough money for upgrade!";
  }
}
window.showUpgradeModal = showUpgradeModal;
window.buyUpgrade = buyUpgrade;

// --- STORIES ---
const villagers = [
  {
    name: "Amina",
    story: "Amina walks miles every day for water. She dreams of going to school, but collecting water takes all her time."
  },
  {
    name: "Samuel",
    story: "Samuel's family often gets sick from dirty water. He wishes for a well in his village so his siblings can be healthy."
  },
  {
    name: "Fatou",
    story: "Fatou lost her younger brother to waterborne disease. She hopes for clean water to protect her family."
  },
  {
    name: "Moses",
    story: "Moses helps his mother carry heavy water jugs. He wants to play soccer, but water comes first."
  },
  {
    name: "Grace",
    story: "Grace spends hours each day fetching water. She wants to become a teacher, but misses school often."
  }
];

// --- RANDOM GAME EVENTS ---
function randomGameEvent() {
  const events = [
    () => {
      money += 100;
      document.getElementById('message').textContent = "A donor gave $100!";
    },
    () => {
      if (workers.length > 0) {
        workers[0].happy -= 20;
        document.getElementById('message').textContent = `${workers[0].name} got sick due to bad water.`;
      }
    },
    () => {
      villagersHelped += 10;
      document.getElementById('message').textContent = "A rainstorm helped 10 villagers!";
    },
    () => {
      money -= 50;
      document.getElementById('message').textContent = "Unexpected repairs cost $50.";
    }
  ];
  const event = events[Math.floor(Math.random() * events.length)];
  event();
  updateUI();
}
setInterval(randomGameEvent, 60000); // 60000 ms = 1 minute

// --- RANDOM VILLAGER STORIES ---
function renderVillagerStory() {
  let storyDiv = document.getElementById('villager-story');
  if (!storyDiv) {
    storyDiv = document.createElement('div');
    storyDiv.id = 'villager-story';
    storyDiv.style.margin = "18px 0";
    storyDiv.style.textAlign = "center";
    storyDiv.style.background = "#fffde7";
    storyDiv.style.borderRadius = "10px";
    storyDiv.style.padding = "16px";
    storyDiv.style.boxShadow = "0 2px 8px #b2dfdb";
    // Insert right after villager-visual
    const villagerVisual = document.getElementById('villager-visual');
    if (villagerVisual && villagerVisual.parentNode) {
      villagerVisual.parentNode.insertBefore(storyDiv, villagerVisual.nextSibling);
    } else {
      document.getElementById('game-container').appendChild(storyDiv);
    }
  }
  const villager = villagers[Math.floor(Math.random() * villagers.length)];
  storyDiv.innerHTML = `<b>${villager.name}'s Story:</b><br><span style="font-size:1.05rem;">${villager.story}</span>`;
}
setInterval(renderVillagerStory, 20000);

renderVillagerStories();

function canBuildUpgrade(upgradeType) {
  if (upgradeType === "Deeper Well") {
    return workers.some(w => w.type === "Builder" && w.trained);
  }
  if (upgradeType === "Filtration System" || upgradeType === "Advanced Filter") {
    return workers.some(w => w.type === "Technician" && w.trained);
  }
  if (upgradeType === "Larger Truck") {
    return workers.some(w => w.type === "Driver" && w.trained);
  }
  return true;
}

function playSound(id) {
  const audio = document.getElementById(id);
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }
}

// --- MILESTONES ---
function checkMilestones() {
  milestones.forEach(m => {
    if (villagersHelped >= m.value && !shownMilestones.has(m.value)) {
      document.getElementById('message').textContent = m.message;
      playSound('audio-win'); // Optional: play a sound for milestones
      shownMilestones.add(m.value);
    }
  });
}