// ---------------------
// Particles Background
// ---------------------
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 6 + 2;
    this.speedX = (Math.random() - 0.5) * 2;
    this.speedY = (Math.random() - 0.5) * 2;
    this.color = Math.random() > 0.5 ? "#FFD700" : "#FFFFFF";
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

const particlesArray = [];
for (let i = 0; i < 50; i++) {
  particlesArray.push(new Particle());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// ---------------------
// Countdown Timer
// ---------------------
const countdownDate = new Date("December 31, 2025 23:59:59").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = countdownDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("days").innerText = days.toString().padStart(2, '0');
  document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
  document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
  document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');

  if (distance < 0) {
    document.getElementById("countdown").innerText = "We're Live!";
  }
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ---------------------
// Email Collection
// ---------------------
const emailForm = document.getElementById("emailForm");

emailForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = emailForm.querySelector("input").value;

  let emails = JSON.parse(localStorage.getItem("emails")) || [];
  emails.push(email);
  localStorage.setItem("emails", JSON.stringify(emails));

  alert("Thanks! Your email has been saved.");
  emailForm.reset();
});

// ---------------------
// Music Control
// ---------------------
const bgMusic = document.getElementById("bgMusic");
if (bgMusic) {
  bgMusic.volume = 0.3; // خفف الصوت
  // لتشغيل الموسيقى عند أول ضغطة
  document.body.addEventListener("click", () => {
    bgMusic.play();
  }, { once: true });
}

// ---------------------
// Enhanced XO Game Functionality
// ---------------------
const gameModal = document.getElementById("gameModal");
const logo = document.getElementById("logo");
const closeGame = document.querySelector(".close-game");
const gameCells = document.querySelectorAll(".cell");
const gameStatus = document.getElementById("gameStatus");
const resetGameBtn = document.getElementById("resetGame");
const newGameBtn = document.getElementById("newGame");
const soundToggleBtn = document.getElementById("soundToggle");
const winningLine = document.getElementById("winningLine");
const particlesContainer = document.getElementById("particles");

// Score tracking
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");

let currentPlayer = "X";
let gameBoard = ["", "", "", "", "", "", "", "", ""];
let gameRunning = true;
let soundEnabled = true;
let scores = { X: 0, O: 0, draw: 0 };

const winPatterns = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6] // Diagonals
];

// Sound effects (using Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = 'sine') {
  if (!soundEnabled) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// Particle effects
function createParticles(x, y, count = 10) {
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.animationDelay = Math.random() * 0.5 + 's';
    particlesContainer.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 2000);
  }
}

// Initialize game
if (logo && gameModal) {
  logo.addEventListener("click", () => {
    console.log("Logo clicked! Opening enhanced game...");
    gameModal.style.display = "block";
    startGame();
    playSound(440, 0.2); // Opening sound
  });
} else {
  console.error("Logo or game modal not found!");
}

// Close game modal
if (closeGame && gameModal) {
  closeGame.addEventListener("click", () => {
    gameModal.style.display = "none";
    playSound(220, 0.2); // Closing sound
  });
}

// Close modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === gameModal) {
    gameModal.style.display = "none";
  }
});

// Sound toggle
if (soundToggleBtn) {
  soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? "🔊 صوت" : "🔇 صامت";
    soundToggleBtn.classList.toggle("muted", !soundEnabled);
    playSound(soundEnabled ? 660 : 220, 0.3);
  });
}

// New game button
if (newGameBtn) {
  newGameBtn.addEventListener("click", () => {
    resetScores();
    resetGame();
    playSound(550, 0.3);
  });
}

function startGame() {
  gameCells.forEach(cell => cell.addEventListener("click", cellClicked));
  if (resetGameBtn) resetGameBtn.addEventListener("click", resetGame);
  updateGameStatus();
  loadScores();
}

function cellClicked() {
  const index = this.dataset.index;

  if (gameBoard[index] !== "" || !gameRunning) return;

  // Add move with animation
  gameBoard[index] = currentPlayer;
  this.textContent = currentPlayer;
  this.classList.add("taken");
  
  // Play move sound
  playSound(currentPlayer === "X" ? 523 : 659, 0.15);
  
  // Create particles
  const rect = this.getBoundingClientRect();
  createParticles(rect.left + rect.width/2, rect.top + rect.height/2, 8);
  
  // Check for winner after a short delay for animation
  setTimeout(() => {
    checkGameWinner();
  }, 100);
}

function checkGameWinner() {
  let roundWon = false;
  let winningPattern = null;

  for (let i = 0; i < winPatterns.length; i++) {
    const [a, b, c] = winPatterns[i];
    if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
      roundWon = true;
      winningPattern = [a, b, c];
      break;
    }
  }

  if (roundWon) {
    // Highlight winning cells
    winningPattern.forEach(index => {
      gameCells[index].classList.add("winning");
    });
    
    // Show winning line
    showWinningLine(winningPattern);
    
    // Update score
    scores[currentPlayer]++;
    updateScores();
    
    // Play win sound
    playSound(880, 0.5, 'square');
    
    // Create celebration particles
    setTimeout(() => {
      createParticles(window.innerWidth/2, window.innerHeight/2, 20);
    }, 300);
    
    gameStatus.innerHTML = `🎉 اللاعب <span class="player-symbol">${currentPlayer}</span> فاز!`;
    gameRunning = false;
  } else if (!gameBoard.includes("")) {
    // Draw
    scores.draw++;
    updateScores();
    playSound(330, 0.4);
    gameStatus.innerHTML = "🤝 تعادل!";
    gameRunning = false;
  } else {
    // Switch player
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateGameStatus();
  }
}

function showWinningLine(pattern) {
  const [a, b, c] = pattern;
  const cellA = gameCells[a];
  const cellC = gameCells[c];
  
  const rectA = cellA.getBoundingClientRect();
  const rectC = cellC.getBoundingClientRect();
  const modalRect = gameModal.getBoundingClientRect();
  
  const startX = rectA.left - modalRect.left + rectA.width/2;
  const startY = rectA.top - modalRect.top + rectA.height/2;
  const endX = rectC.left - modalRect.left + rectC.width/2;
  const endY = rectC.top - modalRect.top + rectC.height/2;
  
  const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
  
  winningLine.style.left = startX + 'px';
  winningLine.style.top = startY + 'px';
  winningLine.style.width = length + 'px';
  winningLine.style.transform = `rotate(${angle}deg)`;
  winningLine.classList.add('show');
}

function updateGameStatus() {
  const playerSymbol = document.querySelector('.player-symbol');
  if (playerSymbol) {
    playerSymbol.textContent = currentPlayer;
  }
  gameStatus.innerHTML = `دور اللاعب <span class="player-symbol">${currentPlayer}</span>`;
}

function resetGame() {
  currentPlayer = "X";
  gameBoard = ["", "", "", "", "", "", "", "", ""];
  gameRunning = true;
  
  // Clear all cells
  gameCells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("taken", "winning");
  });
  
  // Hide winning line
  winningLine.classList.remove('show');
  
  // Clear particles
  particlesContainer.innerHTML = '';
  
  updateGameStatus();
  playSound(440, 0.2);
}

function resetScores() {
  scores = { X: 0, O: 0, draw: 0 };
  updateScores();
  saveScores();
}

function updateScores() {
  if (scoreX) scoreX.textContent = scores.X;
  if (scoreO) scoreO.textContent = scores.O;
  if (scoreDraw) scoreDraw.textContent = scores.draw;
}

function saveScores() {
  localStorage.setItem('xoGameScores', JSON.stringify(scores));
}

function loadScores() {
  const savedScores = localStorage.getItem('xoGameScores');
  if (savedScores) {
    scores = JSON.parse(savedScores);
    updateScores();
  }
}
