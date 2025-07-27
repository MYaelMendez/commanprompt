const cli = document.getElementById('cli');
const cursor = document.getElementById('cursor');
const input = document.getElementById('input');
const universe = document.getElementById('universe');

const colors = ['#fff', '#00FF00', '#FFA500', '#800080', '#00FFFF', '#FF00FF'];
const emojis = ['⚫️', '🟢', '🍊', '🟣', '⚪️', '🗝️'];
const wordToEmoji = {
    'happy': '😊',
    'sad': '😢',
    'angry': '😠',
    'love': '❤️',
    'fire': '🔥',
    'star': '⭐',
    'music': '🎵',
    'sun': '☀️',
    'moon': '🌙',
    'rocket': '🚀'
};

function createParticle(x, y, emoji) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.fontSize = '2vw';
    particle.style.position = 'absolute';
    particle.textContent = emoji;
    particle.style.opacity = Math.random() * 0.5 + 0.5;
    universe.appendChild(particle);

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 2 + 1;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    let life = 100;
    function animateParticle() {
        life--;
        if (life <= 0) {
            universe.removeChild(particle);
            return;
        }
        particle.style.left = `${parseFloat(particle.style.left) + vx}px`;
        particle.style.top = `${parseFloat(particle.style.top) + vy}px`;
        particle.style.opacity = life / 100;
        requestAnimationFrame(animateParticle);
    }
    animateParticle();
}

function elasticEffect() {
    cli.style.transform = `scale(${1 + Math.random() * 0.1})`;
    setTimeout(() => cli.style.transform = 'scale(1)', 300);
}

function processCommand(command) {
    const idx = Math.floor(Math.random() * colors.length);
    cursor.style.color = colors[idx];
    input.style.color = colors[idx];
    cursor.textContent = emojis[idx];
    cli.style.border = `2px solid ${colors[idx]}`;
    cli.style.boxShadow = `0 0 20px ${colors[idx]}`;

    const words = command.split(' ');
    words.forEach(word => {
        if (wordToEmoji[word.toLowerCase()]) {
            createParticle(cli.offsetLeft + Math.random() * cli.offsetWidth, cli.offsetTop + Math.random() * cli.offsetHeight, wordToEmoji[word.toLowerCase()]);
        }
    });
}

input.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        processCommand(input.value);
        input.value = '';
    }
});

setInterval(() => {
    cursor.style.transform = `scale(${1 + Math.random() * 0.2})`;
    setTimeout(() => cursor.style.transform = 'scale(1)', 300);
}, 1000);
