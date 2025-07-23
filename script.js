const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

// Görseller
const bgImage = new Image();
bgImage.src = "assets/dragon-bg.png";
const birdOpen = new Image();
birdOpen.src = "assets/bird-open.png";
const birdClosed = new Image();
birdClosed.src = "assets/bird-closed.png";

// Kuş nesnesi (velocity yok)
let bird = {
  x: 60,
  y: 150,
  width: 40,
  height: 40,
  gravity: 1.2, // sabit düşme miktarı
  lift: 45      // zıplama miktarı
};

let pipes = [];
let pipeWidth = 50;
let gap = 150;
let pipeFrequency = 210;
let frame = 0;
let score = 0;
let isGameOver = false;
let isFlapping = false;
let birdAngle = 0;

// Zıplama
function flap() {
  if (!isGameOver) {
    bird.y -= bird.lift;
    isFlapping = true;
  }
}

// Kontroller
document.addEventListener("keydown", e => {
  if (e.code === "Space") flap();
});
document.addEventListener("keyup", e => {
  if (e.code === "Space") isFlapping = false;
});
canvas.addEventListener("mousedown", () => flap());
canvas.addEventListener("mouseup", () => { isFlapping = false; });
canvas.addEventListener("touchstart", () => flap());
canvas.addEventListener("touchend", () => { isFlapping = false; });

// Yeniden başlat
restartBtn.addEventListener("click", () => {
  score = 0;
  pipes = [];
  bird.y = 150;
  frame = 0;
  isGameOver = false;
  restartBtn.style.display = "none";
  draw();
});

// Boru üret
function addPipe() {
  let top = Math.random() * (canvas.height - gap - 100);
  pipes.push({
    x: canvas.width,
    top,
    bottom: top + gap,
    passed: false
  });
}

// Boruları çiz
function drawPipes() {
  for (let p of pipes) {
    p.x -= 1.0;

    ctx.fillStyle = "green";
    ctx.fillRect(p.x, 0, pipeWidth, p.top);
    ctx.fillRect(p.x, p.bottom, pipeWidth, canvas.height - p.bottom);

    if (
      bird.x < p.x + pipeWidth &&
      bird.x + bird.width > p.x &&
      (bird.y < p.top || bird.y + bird.height > p.bottom)
    ) {
      gameOver();
      return;
    }

    if (!p.passed && p.x + pipeWidth < bird.x) {
      score++;
      p.passed = true;
    }
  }

  pipes = pipes.filter(p => p.x + pipeWidth > 0);
}

// Oyun bitirme
function gameOver() {
  isGameOver = true;
  ctx.fillStyle = "red";
  ctx.font = "50px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Skorun: " + score, canvas.width / 2, canvas.height / 2 + 50);

  restartBtn.style.display = "block";
}

// Ana döngü
function draw() {
  if (isGameOver) return;

  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

  // Sabit düşüş
  bird.y += bird.gravity;

  // Kuşun eğimi
  birdAngle = isFlapping ? -15 : Math.min(birdAngle + 1, 30);
  const currentBirdImage = isFlapping ? birdOpen : birdClosed;

  ctx.save();
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  ctx.rotate((birdAngle * Math.PI) / 180);
  ctx.drawImage(currentBirdImage, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
  ctx.restore();

  // Yerle çarpışma
  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    gameOver();
    return;
  }

  if (frame % pipeFrequency === 0) addPipe();
  frame++;
  drawPipes();

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Skor: " + score, 10, 50);

  requestAnimationFrame(draw);
}

draw();