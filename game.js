// Menu elements
const menuContainer = document.getElementById('menuContainer');
const gameContainer = document.getElementById('gameContainer');
const menuCanvas = document.getElementById('menuCanvas');
const twoPlayerBtn = document.getElementById('twoPlayerBtn');
const practiceBtn = document.getElementById('practiceBtn');
const backToMenuBtn = document.getElementById('backToMenu');

// Game elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const cueCanvas = document.getElementById('cueCanvas');
const cueCtx = cueCanvas.getContext('2d');
const tableContainer = document.getElementById('tableContainer');
const tableWrapper = document.getElementById('tableWrapper');
const canvasWrapper = document.getElementById('canvasWrapper');

// Configuration
const CONFIG = {
    tableWidth: 900,
    tableHeight: 500,
    railSize: 25,
    pocketRadius: 22,
    ballRadius: 12,
    friction: 0.985,
    minVelocity: 0.1,
    maxPower: 25,
    powerMultiplier: 0.15,
    deadZone: 35  // Distance before power starts building (angle-only zone)
};

// Responsive scaling
let scale = 1;
const CUE_OVERFLOW = 500; // How far cue canvas extends beyond game canvas

function calculateResponsiveSize() {
    const wrapper = tableWrapper;
    const containerPadding = window.innerWidth <= 480 ? 6 : (window.innerWidth <= 768 ? 10 : 20);
    const availableWidth = wrapper.clientWidth - (containerPadding * 2);
    const availableHeight = window.innerHeight * 0.65;
    
    const widthScale = availableWidth / CONFIG.tableWidth;
    const heightScale = availableHeight / CONFIG.tableHeight;
    
    scale = Math.min(widthScale, heightScale, 1);
    
    const scaledWidth = CONFIG.tableWidth * scale;
    const scaledHeight = CONFIG.tableHeight * scale;
    
    // Game canvas
    canvas.width = CONFIG.tableWidth;
    canvas.height = CONFIG.tableHeight;
    canvas.style.width = scaledWidth + 'px';
    canvas.style.height = scaledHeight + 'px';
    
    // Canvas wrapper - same size as game canvas for positioning reference
    canvasWrapper.style.width = scaledWidth + 'px';
    canvasWrapper.style.height = scaledHeight + 'px';
    
    // Cue canvas - extends beyond game canvas
    // Now positioned relative to canvas-wrapper which has NO padding
    cueCanvas.width = CONFIG.tableWidth + (CUE_OVERFLOW * 2);
    cueCanvas.height = CONFIG.tableHeight + (CUE_OVERFLOW * 2);
    cueCanvas.style.width = (cueCanvas.width * scale) + 'px';
    cueCanvas.style.height = (cueCanvas.height * scale) + 'px';
    cueCanvas.style.top = (-CUE_OVERFLOW * scale) + 'px';
    cueCanvas.style.left = (-CUE_OVERFLOW * scale) + 'px';
    
    return scale;
}

// Zoom functionality
let currentZoom = 1;
const minZoom = 0.5;
const maxZoom = 3;

function setZoom(newZoom) {
    currentZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
    tableContainer.style.transform = `scale(${currentZoom})`;
    document.getElementById('zoomLevel').textContent = Math.round(currentZoom * 100) + '%';
}

// Zoom buttons
document.getElementById('zoomIn').addEventListener('click', () => setZoom(currentZoom + 0.2));
document.getElementById('zoomOut').addEventListener('click', () => setZoom(currentZoom - 0.2));
document.getElementById('zoomReset').addEventListener('click', () => setZoom(1));

// Pinch-to-zoom handling
let initialPinchDistance = 0;
let initialZoom = 1;

function getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

tableWrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        e.preventDefault();
        initialPinchDistance = getDistance(e.touches);
        initialZoom = currentZoom;
    }
}, { passive: false });

tableWrapper.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = getDistance(e.touches);
        const zoomDelta = currentDistance / initialPinchDistance;
        setZoom(initialZoom * zoomDelta);
    }
}, { passive: false });

// Ball colors for standard 8-ball
const BALL_COLORS = {
    0: { color: '#FFFFFF', stripe: false, number: null },  // Cue ball
    1: { color: '#FFD700', stripe: false, number: 1 },     // Yellow
    2: { color: '#0000CD', stripe: false, number: 2 },     // Blue
    3: { color: '#FF0000', stripe: false, number: 3 },     // Red
    4: { color: '#4B0082', stripe: false, number: 4 },     // Purple
    5: { color: '#FF4500', stripe: false, number: 5 },     // Orange
    6: { color: '#006400', stripe: false, number: 6 },     // Green
    7: { color: '#8B0000', stripe: false, number: 7 },     // Maroon
    8: { color: '#000000', stripe: false, number: 8 },     // Black
    9: { color: '#FFF59D', stripe: false, number: 9 },     // Pastel Yellow
    10: { color: '#90CAF9', stripe: false, number: 10 },   // Pastel Blue
    11: { color: '#EF9A9A', stripe: false, number: 11 },   // Pastel Red/Pink
    12: { color: '#CE93D8', stripe: false, number: 12 },   // Pastel Purple/Lavender
    13: { color: '#FFCC80', stripe: false, number: 13 },   // Pastel Orange/Peach
    14: { color: '#A5D6A7', stripe: false, number: 14 },   // Pastel Green/Mint
    15: { color: '#E57373', stripe: false, number: 15 }    // Pastel Maroon/Rose
};

// Game state
let balls = [];
let pockets = [];
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let dragEnd = { x: 0, y: 0 };
let gameState = 'menu'; // 'menu', 'aiming', 'moving', 'gameover'
let gameMode = 'practice'; // 'practice', 'twoPlayer'
let currentPlayerNumber = 1;
let pocketedBalls = [];
let debugMode = false;
let activeTouchId = null;
let gameInitialized = false;

// Menu canvas context
let menuCtx = null;

// Menu Functions
function initMenuCanvas() {
    if (!menuCtx) {
        menuCtx = menuCanvas.getContext('2d');
    }
    
    // Set menu canvas size
    menuCanvas.width = CONFIG.tableWidth;
    menuCanvas.height = CONFIG.tableHeight;
    
    // Calculate responsive size for menu
    const containerWidth = window.innerWidth * 0.9;
    const containerHeight = window.innerHeight * 0.9;
    const widthScale = containerWidth / CONFIG.tableWidth;
    const heightScale = containerHeight / CONFIG.tableHeight;
    const menuScale = Math.min(widthScale, heightScale, 1);
    
    const scaledWidth = CONFIG.tableWidth * menuScale;
    const scaledHeight = CONFIG.tableHeight * menuScale;
    
    menuCanvas.style.width = scaledWidth + 'px';
    menuCanvas.style.height = scaledHeight + 'px';
    
    drawMenuBackground();
}

function drawMenuBackground() {
    if (!menuCtx) return;
    
    // First draw the wooden table container (like the CSS .table-container background)
    const borderPadding = 20;
    const gradient = menuCtx.createLinearGradient(0, 0, CONFIG.tableWidth, CONFIG.tableHeight);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.5, '#654321');
    gradient.addColorStop(1, '#8B4513');
    
    // Fill entire canvas with wooden background
    menuCtx.fillStyle = gradient;
    menuCtx.fillRect(0, 0, CONFIG.tableWidth, CONFIG.tableHeight);
    
    // Add inner shadow/highlight for depth
    const shadowGradient = menuCtx.createLinearGradient(borderPadding, borderPadding, CONFIG.tableWidth - borderPadding, CONFIG.tableHeight - borderPadding);
    shadowGradient.addColorStop(0, 'rgba(255,255,255,0.1)');
    shadowGradient.addColorStop(0.5, 'rgba(0,0,0,0.1)');
    shadowGradient.addColorStop(1, 'rgba(0,0,0,0.2)');
    menuCtx.fillStyle = shadowGradient;
    menuCtx.fillRect(borderPadding/2, borderPadding/2, CONFIG.tableWidth - borderPadding, CONFIG.tableHeight - borderPadding);
    
    // Now draw the actual playing surface
    const r = CONFIG.railSize;
    
    // Table felt (green) - this should fill the inner area
    menuCtx.fillStyle = '#0d7a3e';
    menuCtx.fillRect(borderPadding, borderPadding, CONFIG.tableWidth - borderPadding*2, CONFIG.tableHeight - borderPadding*2);
    
    // Add felt texture gradient
    const feltGradient = menuCtx.createRadialGradient(
        CONFIG.tableWidth / 2, CONFIG.tableHeight / 2, 0,
        CONFIG.tableWidth / 2, CONFIG.tableHeight / 2, CONFIG.tableWidth / 2
    );
    feltGradient.addColorStop(0, 'rgba(20, 140, 70, 0.3)');
    feltGradient.addColorStop(1, 'rgba(0, 80, 40, 0.3)');
    menuCtx.fillStyle = feltGradient;
    menuCtx.fillRect(borderPadding, borderPadding, CONFIG.tableWidth - borderPadding*2, CONFIG.tableHeight - borderPadding*2);
    
    // Rails (cushions) - adjusted for border
    const railOffset = borderPadding;
    menuCtx.fillStyle = '#0a5c2e';
    // Top rail
    menuCtx.fillRect(railOffset + r + CONFIG.pocketRadius, railOffset, CONFIG.tableWidth / 2 - r - CONFIG.pocketRadius * 1.5, r);
    menuCtx.fillRect(CONFIG.tableWidth / 2 + CONFIG.pocketRadius * 0.5, railOffset, CONFIG.tableWidth / 2 - r - CONFIG.pocketRadius * 1.5, r);
    // Bottom rail
    menuCtx.fillRect(railOffset + r + CONFIG.pocketRadius, CONFIG.tableHeight - r - railOffset, CONFIG.tableWidth / 2 - r - CONFIG.pocketRadius * 1.5, r);
    menuCtx.fillRect(CONFIG.tableWidth / 2 + CONFIG.pocketRadius * 0.5, CONFIG.tableHeight - r - railOffset, CONFIG.tableWidth / 2 - r - CONFIG.pocketRadius * 1.5, r);
    // Left rail
    menuCtx.fillRect(railOffset, railOffset + r + CONFIG.pocketRadius, r, CONFIG.tableHeight - 2 * r - CONFIG.pocketRadius * 2 - borderPadding * 2);
    // Right rail
    menuCtx.fillRect(CONFIG.tableWidth - r - railOffset, railOffset + r + CONFIG.pocketRadius, r, CONFIG.tableHeight - 2 * r - CONFIG.pocketRadius * 2 - borderPadding * 2);
    
    // Draw pockets - adjusted for border
    menuCtx.fillStyle = '#000';
    const tempPockets = [
        { x: railOffset + r - 5, y: railOffset + r - 5 },                    // Top-left
        { x: CONFIG.tableWidth / 2, y: railOffset + r - 10 },   // Top-middle
        { x: CONFIG.tableWidth - r + 5 - railOffset, y: railOffset + r - 5 }, // Top-right
        { x: railOffset + r - 5, y: CONFIG.tableHeight - r + 5 - railOffset }, // Bottom-left
        { x: CONFIG.tableWidth / 2, y: CONFIG.tableHeight - r + 10 - railOffset }, // Bottom-middle
        { x: CONFIG.tableWidth - r + 5 - railOffset, y: CONFIG.tableHeight - r + 5 - railOffset } // Bottom-right
    ];
    
    for (const pocket of tempPockets) {
        menuCtx.beginPath();
        menuCtx.arc(pocket.x, pocket.y, CONFIG.pocketRadius, 0, Math.PI * 2);
        menuCtx.fill();
        
        // Pocket inner shadow
        const shadowGradient = menuCtx.createRadialGradient(
            pocket.x, pocket.y, CONFIG.pocketRadius * 0.5,
            pocket.x, pocket.y, CONFIG.pocketRadius
        );
        shadowGradient.addColorStop(0, 'rgba(0,0,0,0.8)');
        shadowGradient.addColorStop(1, 'rgba(30,30,30,1)');
        menuCtx.fillStyle = shadowGradient;
        menuCtx.beginPath();
        menuCtx.arc(pocket.x, pocket.y, CONFIG.pocketRadius, 0, Math.PI * 2);
        menuCtx.fill();
        menuCtx.fillStyle = '#000';
    }

    // Diamond markers on rails - adjusted for border
    menuCtx.fillStyle = '#FFF';
    const diamonds = [0.25, 0.5, 0.75];
    for (const d of diamonds) {
        // Top & Bottom diamonds
        if (d !== 0.5) {
            menuCtx.beginPath();
            menuCtx.arc(borderPadding + (CONFIG.tableWidth - borderPadding*2) * d, railOffset + r / 2, 3, 0, Math.PI * 2);
            menuCtx.fill();
            menuCtx.beginPath();
            menuCtx.arc(borderPadding + (CONFIG.tableWidth - borderPadding*2) * d, CONFIG.tableHeight - r / 2 - railOffset, 3, 0, Math.PI * 2);
            menuCtx.fill();
        }
    }
    // Side diamonds
    for (const d of [0.25, 0.5, 0.75]) {
        menuCtx.beginPath();
        menuCtx.arc(railOffset + r / 2, borderPadding + (CONFIG.tableHeight - borderPadding*2) * d, 3, 0, Math.PI * 2);
        menuCtx.fill();
        menuCtx.beginPath();
        menuCtx.arc(CONFIG.tableWidth - r / 2 - railOffset, borderPadding + (CONFIG.tableHeight - borderPadding*2) * d, 3, 0, Math.PI * 2);
        menuCtx.fill();
    }
    
    // Draw some decorative balls
    drawMenuBalls();
}

function drawMenuBalls() {
    if (!menuCtx) return;
    
    const borderPadding = 20;
    const playAreaWidth = CONFIG.tableWidth - borderPadding * 2;
    const playAreaHeight = CONFIG.tableHeight - borderPadding * 2;
    
    // Draw some static balls for decoration - positioned within the play area
    const decorativeBalls = [
        { x: borderPadding + playAreaWidth * 0.2, y: borderPadding + playAreaHeight * 0.3, color: '#FFD700', number: 1 },
        { x: borderPadding + playAreaWidth * 0.8, y: borderPadding + playAreaHeight * 0.7, color: '#0000CD', number: 2 },
        { x: borderPadding + playAreaWidth * 0.3, y: borderPadding + playAreaHeight * 0.8, color: '#FF0000', number: 3 },
        { x: borderPadding + playAreaWidth * 0.7, y: borderPadding + playAreaHeight * 0.2, color: '#000000', number: 8 },
        { x: borderPadding + playAreaWidth * 0.5, y: borderPadding + playAreaHeight * 0.4, color: '#FFFFFF', number: null }
    ];
    
    decorativeBalls.forEach(ball => {
        const r = CONFIG.ballRadius;
        
        // Ball shadow
        menuCtx.fillStyle = 'rgba(0,0,0,0.3)';
        menuCtx.beginPath();
        menuCtx.ellipse(ball.x + 2, ball.y + 2, r, r * 0.8, 0, 0, Math.PI * 2);
        menuCtx.fill();
        
        // Ball base
        menuCtx.fillStyle = ball.color;
        menuCtx.beginPath();
        menuCtx.arc(ball.x, ball.y, r, 0, Math.PI * 2);
        menuCtx.fill();
        
        // Number circle
        if (ball.number !== null) {
            const numberRadius = r * 0.5;
            menuCtx.fillStyle = '#FFFFFF';
            menuCtx.beginPath();
            menuCtx.arc(ball.x, ball.y, numberRadius, 0, Math.PI * 2);
            menuCtx.fill();
            
            // Number text
            menuCtx.fillStyle = '#000';
            menuCtx.font = `bold ${r * 0.65}px Arial`;
            menuCtx.textAlign = 'center';
            menuCtx.textBaseline = 'middle';
            menuCtx.fillText(ball.number.toString(), ball.x, ball.y + 0.5);
        }
        
        // Glossy highlight
        const glossGradient = menuCtx.createRadialGradient(
            ball.x - r * 0.3, ball.y - r * 0.3, 0,
            ball.x - r * 0.3, ball.y - r * 0.3, r * 0.8
        );
        glossGradient.addColorStop(0, 'rgba(255,255,255,0.4)');
        glossGradient.addColorStop(1, 'rgba(255,255,255,0)');
        menuCtx.fillStyle = glossGradient;
        menuCtx.beginPath();
        menuCtx.arc(ball.x, ball.y, r, 0, Math.PI * 2);
        menuCtx.fill();
    });
}

function showMenu() {
    gameState = 'menu';
    menuContainer.style.display = 'block';
    gameContainer.style.display = 'none';
    initMenuCanvas();
}

function hideMenu() {
    menuContainer.style.display = 'none';
    gameContainer.style.display = 'flex';
}

function startGame(mode) {
    gameMode = mode;
    gameState = 'aiming';
    currentPlayerNumber = 1;
    hideMenu();
    
    if (!gameInitialized) {
        initializeGame();
        gameInitialized = true;
    } else {
        resetGame();
    }
    
    updatePlayerDisplay();
}

function resetGame() {
    initBalls();
    updatePocketedBallsDisplay();
    gameState = 'aiming';
    currentPlayerNumber = 1;
    document.getElementById('status').textContent = 'Your turn - Aim and shoot!';
}

function updatePlayerDisplay() {
    const playerElement = document.getElementById('currentPlayer');
    if (gameMode === 'practice') {
        playerElement.textContent = 'Practice Mode';
    } else {
        playerElement.textContent = `Player ${currentPlayerNumber}`;
    }
}

function switchPlayer() {
    if (gameMode === 'twoPlayer') {
        currentPlayerNumber = currentPlayerNumber === 1 ? 2 : 1;
        updatePlayerDisplay();
    }
}

function updateStatusMessage() {
    if (gameMode === 'practice') {
        document.getElementById('status').textContent = 'Your turn - Aim and shoot!';
    } else {
        document.getElementById('status').textContent = 'Your turn - Aim and shoot!';
    }
}

// Menu event listeners
twoPlayerBtn.addEventListener('click', () => startGame('twoPlayer'));
practiceBtn.addEventListener('click', () => startGame('practice'));
backToMenuBtn.addEventListener('click', showMenu);

// Initialize pockets
function initPockets() {
    const r = CONFIG.railSize;
    const w = CONFIG.tableWidth;
    const h = CONFIG.tableHeight;
    const offset = 5;
    
    pockets = [
        { x: r - offset, y: r - offset },                    // Top-left
        { x: w / 2, y: r - offset - 5 },                     // Top-middle
        { x: w - r + offset, y: r - offset },                // Top-right
        { x: r - offset, y: h - r + offset },                // Bottom-left
        { x: w / 2, y: h - r + offset + 5 },                 // Bottom-middle
        { x: w - r + offset, y: h - r + offset }             // Bottom-right
    ];
}

// Initialize balls in triangle formation
function initBalls() {
    balls = [];
    pocketedBalls = [];
    
    const startX = CONFIG.tableWidth * 0.3;
    const startY = CONFIG.tableHeight / 2;
    const r = CONFIG.ballRadius;
    const spacing = r * 2.1;
    
    // Triangle formation - 5 rows
    const triangleOrder = [
        [1],
        [11, 6],
        [2, 8, 10],
        [13, 3, 15, 7],
        [5, 4, 14, 12, 9]
    ];
    
    for (let i = 0; i < triangleOrder.length; i++) {
        const ballsInRow = triangleOrder[i];
        const rowOffset = -((ballsInRow.length - 1) / 2) * spacing;
        
        for (let j = 0; j < ballsInRow.length; j++) {
            const ballNum = ballsInRow[j];
            balls.push({
                id: ballNum,
                x: startX - i * spacing * 0.866,
                y: startY + rowOffset + j * spacing,
                vx: 0,
                vy: 0,
                rotation: 0,  // Total rotation (based on distance traveled)
                ...BALL_COLORS[ballNum]
            });
        }
    }
    
    // Cue ball on the right side
    balls.push({
        id: 0,
        x: CONFIG.tableWidth * 0.75,
        y: CONFIG.tableHeight / 2,
        vx: 0,
        vy: 0,
        rotation: 0,
        ...BALL_COLORS[0]
    });
}

// Get cue ball
function getCueBall() {
    return balls.find(b => b.id === 0);
}

// Draw the table
function drawTable() {
    const r = CONFIG.railSize;
    
    // Table felt (green)
    ctx.fillStyle = '#0d7a3e';
    ctx.fillRect(0, 0, CONFIG.tableWidth, CONFIG.tableHeight);
    
    // Add felt texture gradient
    const gradient = ctx.createRadialGradient(
        CONFIG.tableWidth / 2, CONFIG.tableHeight / 2, 0,
        CONFIG.tableWidth / 2, CONFIG.tableHeight / 2, CONFIG.tableWidth / 2
    );
    gradient.addColorStop(0, 'rgba(20, 140, 70, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 80, 40, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.tableWidth, CONFIG.tableHeight);
    
    // Rails (cushions)
    ctx.fillStyle = '#0a5c2e';
    // Top rail
    ctx.fillRect(r + CONFIG.pocketRadius, 0, CONFIG.tableWidth / 2 - r - CONFIG.pocketRadius * 1.5, r);
    ctx.fillRect(CONFIG.tableWidth / 2 + CONFIG.pocketRadius * 0.5, 0, CONFIG.tableWidth / 2 - r - CONFIG.pocketRadius * 1.5, r);
    // Bottom rail
    ctx.fillRect(r + CONFIG.pocketRadius, CONFIG.tableHeight - r, CONFIG.tableWidth / 2 - r - CONFIG.pocketRadius * 1.5, r);
    ctx.fillRect(CONFIG.tableWidth / 2 + CONFIG.pocketRadius * 0.5, CONFIG.tableHeight - r, CONFIG.tableWidth / 2 - r - CONFIG.pocketRadius * 1.5, r);
    // Left rail
    ctx.fillRect(0, r + CONFIG.pocketRadius, r, CONFIG.tableHeight - 2 * r - CONFIG.pocketRadius * 2);
    // Right rail
    ctx.fillRect(CONFIG.tableWidth - r, r + CONFIG.pocketRadius, r, CONFIG.tableHeight - 2 * r - CONFIG.pocketRadius * 2);
    
    // Draw pockets
    ctx.fillStyle = '#000';
    for (const pocket of pockets) {
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, CONFIG.pocketRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Pocket inner shadow
    for (const pocket of pockets) {
        const shadowGradient = ctx.createRadialGradient(
            pocket.x, pocket.y, CONFIG.pocketRadius * 0.5,
            pocket.x, pocket.y, CONFIG.pocketRadius
        );
        shadowGradient.addColorStop(0, 'rgba(0,0,0,0.8)');
        shadowGradient.addColorStop(1, 'rgba(30,30,30,1)');
        ctx.fillStyle = shadowGradient;
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, CONFIG.pocketRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Diamond markers on rails
    ctx.fillStyle = '#FFF';
    const diamonds = [0.25, 0.5, 0.75];
    for (const d of diamonds) {
        // Top
        if (d !== 0.5) {
            ctx.beginPath();
            ctx.arc(CONFIG.tableWidth * d, r / 2, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        // Bottom
        if (d !== 0.5) {
            ctx.beginPath();
            ctx.arc(CONFIG.tableWidth * d, CONFIG.tableHeight - r / 2, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    // Side diamonds
    for (const d of [0.25, 0.5, 0.75]) {
        ctx.beginPath();
        ctx.arc(r / 2, CONFIG.tableHeight * d, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(CONFIG.tableWidth - r / 2, CONFIG.tableHeight * d, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Head string (line where cue ball is placed)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(CONFIG.tableWidth * 0.75, r);
    ctx.lineTo(CONFIG.tableWidth * 0.75, CONFIG.tableHeight - r);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Draw a ball
function drawBall(ball) {
    const r = CONFIG.ballRadius;
    const circumference = 2 * Math.PI * r;
    
    // Pocketing animation: shrink and darken
    let scale = 1;
    let darkness = 0;
    if (ball.pocketing) {
        // Shrink from 100% to 30%
        scale = 1 - (ball.pocketProgress * 0.7);
        // Darken progressively (0 to 0.7)
        darkness = ball.pocketProgress * 0.7;
    }
    
    const drawRadius = r * scale;
    
    // Calculate rotation phase (0 to 2π, wrapping)
    const phase = (ball.rotation % circumference) / circumference * Math.PI * 2;
    
    // Offset oscillates with sine, visibility with cosine
    const offsetAmount = Math.sin(phase) * drawRadius * 0.4;
    const visibility = Math.cos(phase);  // 1 = front, -1 = back
    
    // Get movement direction (or default to 0,0 when stopped)
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    let dirX = 0, dirY = 0;
    if (speed > 0.1) {
        dirX = ball.vx / speed;
        dirY = ball.vy / speed;
    }
    
    // Texture offset in movement direction
    const textureOffsetX = dirX * offsetAmount;
    const textureOffsetY = dirY * offsetAmount;
    
    // Ball shadow (smaller when pocketing)
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(ball.x + 2 * scale, ball.y + 2 * scale, drawRadius, drawRadius * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball base color
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, drawRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Number circle - FIXED SIZE relative to ball, only position animates
    if (ball.number !== null && visibility > -0.5) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, drawRadius, 0, Math.PI * 2);
        ctx.clip();
        
        const numberRadius = drawRadius * 0.5;
        
        const numX = ball.x + textureOffsetX;
        const numY = ball.y + textureOffsetY;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(numX, numY, numberRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Number text
        ctx.fillStyle = '#000';
        ctx.font = `bold ${drawRadius * 0.65}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ball.number.toString(), numX, numY + 0.5);
        
        ctx.restore();
    }
    
    // Glossy highlight (fixed position - doesn't rotate)
    if (!ball.pocketing) {
        const glossGradient = ctx.createRadialGradient(
            ball.x - drawRadius * 0.3, ball.y - drawRadius * 0.3, 0,
            ball.x - drawRadius * 0.3, ball.y - drawRadius * 0.3, drawRadius * 0.8
        );
        glossGradient.addColorStop(0, 'rgba(255,255,255,0.4)');
        glossGradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glossGradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, drawRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Darkness overlay for pocketing animation
    if (darkness > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, drawRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw aiming line and cue stick
function drawAimingLine() {
    cueCtx.clearRect(0, 0, cueCanvas.width, cueCanvas.height);
    
    if (!isDragging || gameState !== 'aiming') return;
    
    const cueBall = getCueBall();
    if (!cueBall) return;
    
    const dx = dragStart.x - dragEnd.x;
    const dy = dragStart.y - dragEnd.y;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);
    
    // Power only builds after passing dead zone
    const effectiveDistance = Math.max(0, dragDistance - CONFIG.deadZone);
    const power = Math.min(effectiveDistance * CONFIG.powerMultiplier, CONFIG.maxPower);
    const angle = Math.atan2(dy, dx);
    
    // Draw dead zone indicator on game canvas
    const inDeadZone = dragDistance <= CONFIG.deadZone;
    ctx.strokeStyle = inDeadZone ? 'rgba(255, 255, 100, 0.6)' : 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cueBall.x, cueBall.y, CONFIG.deadZone, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Label when in dead zone
    if (inDeadZone) {
        ctx.fillStyle = 'rgba(255, 255, 100, 0.8)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('AIM', cueBall.x, cueBall.y - CONFIG.deadZone - 8);
    }
    
    // Offset positions for cue canvas
    // With canvas-wrapper having no padding, offset is simply CUE_OVERFLOW
    const ballX = cueBall.x + CUE_OVERFLOW;
    const ballY = cueBall.y + CUE_OVERFLOW;
    
    // Draw cue stick
    const stickLength = 200;
    const stickStart = {
        x: ballX - Math.cos(angle) * (CONFIG.ballRadius + 10 + power * 3),
        y: ballY - Math.sin(angle) * (CONFIG.ballRadius + 10 + power * 3)
    };
    const stickEnd = {
        x: stickStart.x - Math.cos(angle) * stickLength,
        y: stickStart.y - Math.sin(angle) * stickLength
    };
    
    // Cue stick shadow
    cueCtx.strokeStyle = 'rgba(0,0,0,0.3)';
    cueCtx.lineWidth = 10;
    cueCtx.lineCap = 'round';
    cueCtx.beginPath();
    cueCtx.moveTo(stickStart.x + 3, stickStart.y + 3);
    cueCtx.lineTo(stickEnd.x + 3, stickEnd.y + 3);
    cueCtx.stroke();
    
    // Cue stick body
    cueCtx.strokeStyle = '#d4a056';
    cueCtx.lineWidth = 8;
    cueCtx.beginPath();
    cueCtx.moveTo(stickStart.x, stickStart.y);
    cueCtx.lineTo(stickEnd.x, stickEnd.y);
    cueCtx.stroke();
    
    // Cue tip
    cueCtx.strokeStyle = '#4a90d9';
    cueCtx.lineWidth = 8;
    cueCtx.beginPath();
    cueCtx.moveTo(stickStart.x, stickStart.y);
    cueCtx.lineTo(stickStart.x - Math.cos(angle) * 15, stickStart.y - Math.sin(angle) * 15);
    cueCtx.stroke();
    
    // Aiming line - on game canvas
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(cueBall.x, cueBall.y);
    ctx.lineTo(cueBall.x + Math.cos(angle) * 300, cueBall.y + Math.sin(angle) * 300);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Power indicator
    const powerPercent = (power / CONFIG.maxPower) * 100;
    ctx.fillStyle = powerPercent > 70 ? '#ff4444' : powerPercent > 40 ? '#ffaa00' : '#44ff44';
    ctx.fillRect(20, CONFIG.tableHeight - 30, powerPercent * 2, 15);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, CONFIG.tableHeight - 30, 200, 15);
    
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Power', 20, CONFIG.tableHeight - 35);
}

// Physics update
function updatePhysics() {
    let allStopped = true;
    
    for (const ball of balls) {
        if (Math.abs(ball.vx) > CONFIG.minVelocity || Math.abs(ball.vy) > CONFIG.minVelocity) {
            allStopped = false;
            
            ball.x += ball.vx;
            ball.y += ball.vy;
            
            // Update rotation based on distance traveled
            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            ball.rotation += speed;
            
            ball.vx *= CONFIG.friction;
            ball.vy *= CONFIG.friction;
            
            if (Math.abs(ball.vx) < CONFIG.minVelocity) ball.vx = 0;
            if (Math.abs(ball.vy) < CONFIG.minVelocity) ball.vy = 0;
        }
        
        // Hard boundary
        if (ball.x < 0) { ball.x = CONFIG.railSize + CONFIG.ballRadius; ball.vx = Math.abs(ball.vx) * 0.3; }
        if (ball.x > CONFIG.tableWidth) { ball.x = CONFIG.tableWidth - CONFIG.railSize - CONFIG.ballRadius; ball.vx = -Math.abs(ball.vx) * 0.3; }
        if (ball.y < 0) { ball.y = CONFIG.railSize + CONFIG.ballRadius; ball.vy = Math.abs(ball.vy) * 0.3; }
        if (ball.y > CONFIG.tableHeight) { ball.y = CONFIG.tableHeight - CONFIG.railSize - CONFIG.ballRadius; ball.vy = -Math.abs(ball.vy) * 0.3; }
    }
    
    // Ball-to-ball collisions
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            checkBallCollision(balls[i], balls[j]);
        }
    }
    
    // Wall collisions
    for (const ball of balls) {
        checkWallCollision(ball);
    }
    
    // Pocket detection - start pocketing animation
    for (const ball of balls) {
        if (ball.pocketing) continue; // Skip balls already being pocketed
        
        const pocket = checkPocket(ball);
        if (pocket) {
            // Start pocketing animation
            ball.pocketing = true;
            ball.pocketProgress = 0;
            ball.targetPocket = { x: pocket.x, y: pocket.y };
        }
    }
    
    // Update pocketing animations
    const POCKET_DURATION = 18; // frames (~0.3 seconds at 60fps)
    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        if (!ball.pocketing) continue;
        
        ball.pocketProgress += 1 / POCKET_DURATION;
        
        // Pull toward pocket center with acceleration
        const pullStrength = 0.3 + ball.pocketProgress * 0.5;
        ball.x += (ball.targetPocket.x - ball.x) * pullStrength;
        ball.y += (ball.targetPocket.y - ball.y) * pullStrength;
        
        // Keep some momentum but slow down
        ball.vx *= 0.85;
        ball.vy *= 0.85;
        
        // Animation complete - remove ball
        if (ball.pocketProgress >= 1) {
            const pocketedBall = balls.splice(i, 1)[0];
            if (pocketedBall.id !== 0) {
                pocketedBalls.push(pocketedBall);
                updatePocketedBallsDisplay();
            } else {
                // Cue ball pocketed - respawn after delay
                setTimeout(() => {
                    balls.push({
                        id: 0,
                        x: CONFIG.tableWidth * 0.75,
                        y: CONFIG.tableHeight / 2,
                        vx: 0,
                        vy: 0,
                        rotation: 0,
                        ...BALL_COLORS[0]
                    });
                }, 500);
            }
        }
    }
    
    // Check if all balls stopped (including no pocketing animations in progress)
    const anyPocketing = balls.some(b => b.pocketing);
    if (gameState === 'moving' && allStopped && !anyPocketing) {
        gameState = 'aiming';
        
        // Switch player in 2-player mode
        if (gameMode === 'twoPlayer') {
            switchPlayer();
        }
        
        updateStatusMessage();
    }
}

// Check ball collision
function checkBallCollision(b1, b2) {
    // Skip if either ball is being pocketed
    if (b1.pocketing || b2.pocketing) return;
    
    const dx = b2.x - b1.x;
    const dy = b2.y - b1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = CONFIG.ballRadius * 2;
    
    if (dist < minDist && dist > 0) {
        // Normalize collision vector
        const nx = dx / dist;
        const ny = dy / dist;
        
        // Relative velocity
        const dvx = b1.vx - b2.vx;
        const dvy = b1.vy - b2.vy;
        
        // Relative velocity along collision normal
        const dvn = dvx * nx + dvy * ny;
        
        // Don't resolve if balls are separating
        if (dvn > 0) {
            // Update velocities (equal mass elastic collision)
            b1.vx -= dvn * nx;
            b1.vy -= dvn * ny;
            b2.vx += dvn * nx;
            b2.vy += dvn * ny;
            
            // Separate balls
            const overlap = minDist - dist;
            b1.x -= overlap * nx / 2;
            b1.y -= overlap * ny / 2;
            b2.x += overlap * nx / 2;
            b2.y += overlap * ny / 2;
        }
    }
}

// Check wall collision
function checkWallCollision(ball) {
    // Skip if ball is being pocketed
    if (ball.pocketing) return;
    
    const r = CONFIG.ballRadius;
    const rail = CONFIG.railSize;
    
    // Check if near a pocket
    for (const pocket of pockets) {
        const dx = ball.x - pocket.x;
        const dy = ball.y - pocket.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < CONFIG.pocketRadius + 5) {
            return; // Skip wall collision near pockets
        }
        
        if (dist < CONFIG.pocketRadius * 1.5) {
            const toPocketX = pocket.x - ball.x;
            const toPocketY = pocket.y - ball.y;
            const dotProduct = ball.vx * toPocketX + ball.vy * toPocketY;
            if (dotProduct > 0) {
                return; // Moving toward pocket, skip wall collision
            }
        }
    }
    
    // Left wall
    if (ball.x - r < rail) {
        ball.x = rail + r;
        ball.vx = -ball.vx * 0.8;
    }
    // Right wall
    if (ball.x + r > CONFIG.tableWidth - rail) {
        ball.x = CONFIG.tableWidth - rail - r;
        ball.vx = -ball.vx * 0.8;
    }
    // Top wall
    if (ball.y - r < rail) {
        ball.y = rail + r;
        ball.vy = -ball.vy * 0.8;
    }
    // Bottom wall
    if (ball.y + r > CONFIG.tableHeight - rail) {
        ball.y = CONFIG.tableHeight - rail - r;
        ball.vy = -ball.vy * 0.8;
    }
}

// Check if ball is in pocket - returns pocket or null
function checkPocket(ball) {
    // Skip balls that are already being pocketed
    if (ball.pocketing) return null;
    
    for (const pocket of pockets) {
        const dx = ball.x - pocket.x;
        const dy = ball.y - pocket.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < CONFIG.pocketRadius) {
            return pocket; // Return the pocket location
        }
    }
    return null;
}

// Update pocketed balls display
function updatePocketedBallsDisplay() {
    const container = document.getElementById('pocketedBallsContainer');
    container.innerHTML = '';
    
    pocketedBalls.forEach(ball => {
        const ballEl = document.createElement('div');
        ballEl.className = 'mini-ball' + (ball.stripe ? ' stripe' : '');
        
        if (ball.stripe) {
            // No more stripes - just show the color (this branch kept for safety)
            ballEl.style.background = ball.color;
        } else {
            ballEl.style.background = ball.color;
        }
        
        const numEl = document.createElement('div');
        numEl.className = 'number';
        numEl.textContent = ball.number;
        ballEl.appendChild(numEl);
        
        container.appendChild(ballEl);
    });
}

// Draw debug info
function drawDebug() {
    if (!debugMode) return;
    
    const r = CONFIG.ballRadius;
    const rail = CONFIG.railSize;
    
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    // Wall boundaries
    ctx.beginPath();
    ctx.moveTo(rail + r, 0);
    ctx.lineTo(rail + r, CONFIG.tableHeight);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(CONFIG.tableWidth - rail - r, 0);
    ctx.lineTo(CONFIG.tableWidth - rail - r, CONFIG.tableHeight);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, rail + r);
    ctx.lineTo(CONFIG.tableWidth, rail + r);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.tableHeight - rail - r);
    ctx.lineTo(CONFIG.tableWidth, CONFIG.tableHeight - rail - r);
    ctx.stroke();
    
    // Pocket zones
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    for (const pocket of pockets) {
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, CONFIG.pocketRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner safe zone (cyan)
        ctx.strokeStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, CONFIG.pocketRadius + 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Outer guide zone (orange dashed)
        ctx.strokeStyle = '#ff8800';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, CONFIG.pocketRadius * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Pocket center
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ffff00';
    }
    
    // Ball collision circles and velocity vectors
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    for (const ball of balls) {
        // Ball collision boundary
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, CONFIG.ballRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Ball center point
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Velocity vector (green line)
        if (ball.vx !== 0 || ball.vy !== 0) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(ball.x, ball.y);
            ctx.lineTo(ball.x + ball.vx * 10, ball.y + ball.vy * 10);
            ctx.stroke();
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 1;
        }
    }
    
    // Debug text
    ctx.fillStyle = '#ff0000';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('DEBUG MODE (X to toggle)', CONFIG.tableWidth - 10, CONFIG.tableHeight - 10);
    ctx.fillText(`Rail size: ${rail}px`, CONFIG.tableWidth - 10, CONFIG.tableHeight - 30);
    ctx.fillText(`Ball radius: ${r}px`, CONFIG.tableWidth - 10, CONFIG.tableHeight - 50);
    ctx.fillText(`Pocket radius: ${CONFIG.pocketRadius}px`, CONFIG.tableWidth - 10, CONFIG.tableHeight - 70);
}

// Main draw function
function draw() {
    ctx.clearRect(0, 0, CONFIG.tableWidth, CONFIG.tableHeight);
    
    drawTable();
    
    for (const ball of balls) {
        drawBall(ball);
    }
    
    drawAimingLine();
    drawDebug();
}

// Game loop
function gameLoop() {
    if (gameState !== 'menu') {
        updatePhysics();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

// Get canvas coordinates from event
function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CONFIG.tableWidth / rect.width;
    const scaleY = CONFIG.tableHeight / rect.height;
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

// Input handling - Mouse
canvas.addEventListener('mousedown', (e) => {
    if (gameState !== 'aiming') return;
    
    const coords = getCanvasCoords(e);
    const cueBall = getCueBall();
    if (!cueBall) return;
    
    isDragging = true;
    dragStart = { x: cueBall.x, y: cueBall.y };
    dragEnd = coords;
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    dragEnd = getCanvasCoords(e);
});

document.addEventListener('mouseup', (e) => {
    if (!isDragging || gameState !== 'aiming') {
        isDragging = false;
        return;
    }
    
    shoot();
    isDragging = false;
});

// Input handling - Touch
canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    if (gameState !== 'aiming') return;
    
    e.preventDefault();
    
    const coords = getCanvasCoords(e);
    const cueBall = getCueBall();
    if (!cueBall) return;
    
    activeTouchId = e.touches[0].identifier;
    isDragging = true;
    dragStart = { x: cueBall.x, y: cueBall.y };
    dragEnd = coords;
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    if (e.touches[0].identifier !== activeTouchId) return;
    
    e.preventDefault();
    dragEnd = getCanvasCoords(e);
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    if (!isDragging || gameState !== 'aiming') {
        isDragging = false;
        activeTouchId = null;
        return;
    }
    
    e.preventDefault();
    shoot();
    isDragging = false;
    activeTouchId = null;
}, { passive: false });

canvas.addEventListener('touchcancel', (e) => {
    isDragging = false;
    activeTouchId = null;
});

// Shoot function
function shoot() {
    const cueBall = getCueBall();
    if (!cueBall) return;
    
    const dx = dragStart.x - dragEnd.x;
    const dy = dragStart.y - dragEnd.y;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);
    
    // Power only builds after passing dead zone
    const effectiveDistance = Math.max(0, dragDistance - CONFIG.deadZone);
    const power = Math.min(effectiveDistance * CONFIG.powerMultiplier, CONFIG.maxPower);
    
    if (power > 0.5) {
        const angle = Math.atan2(dy, dx);
        cueBall.vx = Math.cos(angle) * power;
        cueBall.vy = Math.sin(angle) * power;
        
        gameState = 'moving';
        document.getElementById('status').textContent = 'Balls in motion...';
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'x' || e.key === 'X') {
        debugMode = !debugMode;
    }
    if (e.key === 'q' || e.key === 'Q') {
        if (isDragging) {
            isDragging = false;
        }
    }
});

// Responsive resize
function handleResize() {
    calculateResponsiveSize();
}

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 100);
});

// Show appropriate instructions
function updateInstructions() {
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
    document.querySelector('.desktop-instructions').style.display = isMobile ? 'none' : 'inline';
    document.querySelector('.mobile-instructions').style.display = isMobile ? 'inline' : 'none';
}

// Game initialization function
function initializeGame() {
    initPockets();
    initBalls();
    calculateResponsiveSize();
    updateInstructions();
    window.addEventListener('resize', updateInstructions);
    window.addEventListener('resize', () => {
        if (gameState === 'menu') {
            initMenuCanvas();
        } else {
            handleResize();
        }
    });
}

// Initialize
showMenu(); // Start with menu
gameLoop();