const openBtn = document.getElementById("openBtn");
const messageBox = document.getElementById("messageBox");
const messageText = document.getElementById("birthdayMessage");
const bgMusic = document.getElementById("bgMusic");

const birthdayLines = [
  "🎂 Chúc mừng sinh nhật 🎉",
  "Chúc anh sinh nhật thật vui vẻ, bình an và tràn đầy năng lượng tích cực. Thêm một tuổi mới, không chỉ là thêm con số, mà còn là thêm trải nghiệm, thêm trưởng thành, thêm bản lĩnh.",
  "Chúc anh thêm nhiều bộ sưu tầm Gundam nữa",
  "Mong anh sẽ giảm béo thành công =))",
  "Chúc anh luôn hạnh phúc, vững vàng, và không quên mỉm cười dù đôi lúc cuộc sống có thử thách. Vì anh xứng đáng với tất cả những điều tốt đẹp nhất.",
  "Happy Birthday to You 🎈"
];

openBtn.addEventListener("click", () => {
  messageBox.style.display = "block";
  openBtn.style.display = "none";
  bgMusic.play();
  showMessageLineByLine();
});

let lineIndex = 0;

function showMessageLineByLine() {
  if (lineIndex >= birthdayLines.length) {
    startFireworks();
    return;
  }

  const line = birthdayLines[lineIndex];
  let i = 0;
  messageText.innerHTML += "<span id='line-" + lineIndex + "'></span><br><br>";

  const span = document.getElementById("line-" + lineIndex);

  const typing = setInterval(() => {
    if (i < line.length) {
      span.textContent += line.charAt(i);
      i++;
    } else {
      clearInterval(typing);
      lineIndex++;
      setTimeout(showMessageLineByLine, 500);
    }
  }, 50);
}

/* 🎇 Hiệu ứng pháo hoa nhẹ */
const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function random(min, max) { return Math.random() * (max - min) + min; }

let particles = [];

function createParticle() {
  const x = random(0, canvas.width);
  const y = random(0, canvas.height / 2);
  const size = random(1, 3);
  const color = `hsl(${random(0, 360)}, 100%, 70%)`;
  const speedY = random(1, 4);
  particles.push({ x, y, size, color, speedY });
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    p.y += p.speedY;
    if (p.y > canvas.height) p.y = random(0, canvas.height / 3);
  }
  requestAnimationFrame(drawParticles);
}

function startFireworks() {
  for (let i = 0; i < 80; i++) createParticle();
  drawParticles();
}
