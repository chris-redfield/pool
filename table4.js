// Donut Table Configuration (Large navigable table)
// Modular design for building complex table shapes

const TABLE4_CONFIG = {
    // Overall table dimensions (large for navigation)
    tableWidth: 1600,
    tableHeight: 1000,

    // Inner hole (donut center)
    innerHole: {
        x: 600,      // Left position of hole
        y: 350,      // Top position of hole
        width: 400,  // Hole width
        height: 300  // Hole height
    },

    // Standard properties
    railSize: 25,
    pocketRadius: 22,
    ballRadius: 12,
    friction: 0.985,
    minVelocity: 0.1,
    maxPower: 25,
    powerMultiplier: 0.15,
    deadZone: 35
};

// Modular building blocks for future expansion
const TableModule = {
    // Helper to create a rectangular zone
    createRectZone(x, y, width, height) {
        return {
            x, y, width, height,
            left: x,
            right: x + width,
            top: y,
            bottom: y + height
        };
    },

    // Helper to create wall segments
    createWallSegments(zone, railSize) {
        return {
            top: { x1: zone.left, y: zone.top + railSize, x2: zone.right, isHorizontal: true },
            bottom: { x1: zone.left, y: zone.bottom - railSize, x2: zone.right, isHorizontal: true },
            left: { x: zone.left + railSize, y1: zone.top, y2: zone.bottom, isHorizontal: false },
            right: { x: zone.right - railSize, y1: zone.top, y2: zone.bottom, isHorizontal: false }
        };
    }
};

// Initialize pockets for donut table
function initPocketsTable4() {
    const cfg = TABLE4_CONFIG;
    const r = cfg.railSize;
    const offset = 5;
    const pockets = [];

    // Outer perimeter pockets
    const outerW = cfg.tableWidth;
    const outerH = cfg.tableHeight;

    // Top edge - 4 pockets
    pockets.push(
        { x: r - offset, y: r - offset },                    // Top-left corner
        { x: outerW * 0.33, y: r - offset - 5 },            // Top-left third
        { x: outerW * 0.67, y: r - offset - 5 },            // Top-right third
        { x: outerW - r + offset, y: r - offset }           // Top-right corner
    );

    // Right edge - 4 pockets
    pockets.push(
        { x: outerW - r + offset + 5, y: outerH * 0.25 },   // Right upper
        { x: outerW - r + offset + 5, y: outerH * 0.5 },    // Right middle
        { x: outerW - r + offset + 5, y: outerH * 0.75 }    // Right lower
    );

    // Bottom edge - 4 pockets
    pockets.push(
        { x: outerW - r + offset, y: outerH - r + offset }, // Bottom-right corner
        { x: outerW * 0.67, y: outerH - r + offset + 5 },   // Bottom-right third
        { x: outerW * 0.33, y: outerH - r + offset + 5 },   // Bottom-left third
        { x: r - offset, y: outerH - r + offset }           // Bottom-left corner
    );

    // Left edge - 3 pockets (avoiding corner duplicates)
    pockets.push(
        { x: r - offset - 5, y: outerH * 0.25 },            // Left upper
        { x: r - offset - 5, y: outerH * 0.5 },             // Left middle
        { x: r - offset - 5, y: outerH * 0.75 }             // Left lower
    );

    // Inner hole pockets (around the donut hole) - 4 pockets, one per side center
    const hole = cfg.innerHole;

    // Top edge of hole - 1 pocket (center)
    pockets.push(
        { x: hole.x + hole.width * 0.5, y: hole.y + r - offset - 5 }
    );

    // Right edge of hole - 1 pocket (center)
    pockets.push(
        { x: hole.x + hole.width - r + offset + 5, y: hole.y + hole.height * 0.5 }
    );

    // Bottom edge of hole - 1 pocket (center)
    pockets.push(
        { x: hole.x + hole.width * 0.5, y: hole.y + hole.height - r + offset + 5 }
    );

    // Left edge of hole - 1 pocket (center)
    pockets.push(
        { x: hole.x + r - offset - 5, y: hole.y + hole.height * 0.5 }
    );

    return pockets;
}

// Draw the donut table
function drawTable4(ctx, config) {
    const r = config.railSize;
    const woodThickness = 10;
    const hole = config.innerHole;

    // 1. Draw wood frame background for OUTER table
    const woodGradient = ctx.createLinearGradient(0, 0, config.tableWidth, config.tableHeight);
    woodGradient.addColorStop(0, '#8B4513');
    woodGradient.addColorStop(0.5, '#654321');
    woodGradient.addColorStop(1, '#8B4513');

    ctx.fillStyle = woodGradient;
    ctx.fillRect(0, 0, config.tableWidth, config.tableHeight);

    // 2. Draw dark green cushion layer (outer rails)
    ctx.fillStyle = '#0a5c2e';
    // Outer cushion
    ctx.fillRect(woodThickness, woodThickness,
                 config.tableWidth - woodThickness * 2, r - woodThickness);
    ctx.fillRect(woodThickness, config.tableHeight - r,
                 config.tableWidth - woodThickness * 2, r - woodThickness);
    ctx.fillRect(woodThickness, woodThickness,
                 r - woodThickness, config.tableHeight - woodThickness * 2);
    ctx.fillRect(config.tableWidth - r, woodThickness,
                 r - woodThickness, config.tableHeight - woodThickness * 2);

    // 3. Draw green felt (playable area)
    ctx.fillStyle = '#0d7a3e';
    // Outer playable area (with hole cut out)
    ctx.fillRect(r, r, config.tableWidth - r * 2, config.tableHeight - r * 2);

    // Create wooden frame INSIDE the donut hole (frame effect with hollow center)
    const holeWoodGradient = ctx.createLinearGradient(
        hole.x, hole.y,
        hole.x + hole.width, hole.y + hole.height
    );
    holeWoodGradient.addColorStop(0, '#8B4513');   // Same as outer wood
    holeWoodGradient.addColorStop(0.5, '#654321');
    holeWoodGradient.addColorStop(1, '#8B4513');

    // Draw rounded wooden rectangle
    const holeRadius = 15;
    ctx.fillStyle = holeWoodGradient;
    ctx.beginPath();
    ctx.roundRect(hole.x, hole.y, hole.width, hole.height, holeRadius);
    ctx.fill();

    // Cut out the center to create frame effect (hollow center)
    // Match the visual thickness of outer border including container padding
    // Outer border appears thick due to: container padding (20px) + wood + cushion
    const frameWidth = 50; // Thick wooden frame to match outer border visual thickness
    const innerHoleX = hole.x + frameWidth;
    const innerHoleY = hole.y + frameWidth;
    const innerHoleWidth = hole.width - frameWidth * 2;
    const innerHoleHeight = hole.height - frameWidth * 2;

    ctx.fillStyle = '#1a1a2e'; // Background color for hollow center
    ctx.beginPath();
    ctx.roundRect(innerHoleX, innerHoleY, innerHoleWidth, innerHoleHeight, holeRadius);
    ctx.fill();

    // Now draw inner hole cushion directly at hole edges
    ctx.fillStyle = '#0a5c2e';
    // Top cushion of hole - starts right at hole edge
    ctx.fillRect(hole.x, hole.y, hole.width, r);
    // Bottom cushion of hole - starts right at hole edge
    ctx.fillRect(hole.x, hole.y + hole.height - r, hole.width, r);
    // Left cushion of hole - starts right at hole edge
    ctx.fillRect(hole.x, hole.y, r, hole.height);
    // Right cushion of hole - starts right at hole edge
    ctx.fillRect(hole.x + hole.width - r, hole.y, r, hole.height);

    // 4. Add felt texture gradient
    ctx.save();
    const gradient = ctx.createRadialGradient(
        config.tableWidth / 2, config.tableHeight / 2, 0,
        config.tableWidth / 2, config.tableHeight / 2, config.tableWidth / 2
    );
    gradient.addColorStop(0, 'rgba(20, 140, 70, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 80, 40, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(r, r, config.tableWidth - r * 2, config.tableHeight - r * 2);
    ctx.restore();

    // 5. Draw pockets
    const pockets = initPocketsTable4();

    // Pocket holes
    ctx.fillStyle = '#000';
    for (const pocket of pockets) {
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, config.pocketRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Pocket shadows for depth
    for (const pocket of pockets) {
        const shadowGradient = ctx.createRadialGradient(
            pocket.x, pocket.y, config.pocketRadius * 0.5,
            pocket.x, pocket.y, config.pocketRadius
        );
        shadowGradient.addColorStop(0, 'rgba(0,0,0,0.8)');
        shadowGradient.addColorStop(1, 'rgba(30,30,30,1)');
        ctx.fillStyle = shadowGradient;
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, config.pocketRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // 6. Draw diamond markers
    ctx.fillStyle = '#FFF';
    const markerOffset = woodThickness + (r - woodThickness) / 2;

    // Outer perimeter diamonds
    const outerDiamonds = [];
    for (let i = 0.125; i <= 0.875; i += 0.125) {
        // Top and bottom
        outerDiamonds.push(
            { x: config.tableWidth * i, y: markerOffset },
            { x: config.tableWidth * i, y: config.tableHeight - markerOffset }
        );
        // Left and right
        outerDiamonds.push(
            { x: markerOffset, y: config.tableHeight * i },
            { x: config.tableWidth - markerOffset, y: config.tableHeight * i }
        );
    }

    // Inner hole diamonds
    for (let i = 0.25; i <= 0.75; i += 0.25) {
        // Top and bottom of hole
        outerDiamonds.push(
            { x: hole.x + hole.width * i, y: hole.y + markerOffset },
            { x: hole.x + hole.width * i, y: hole.y + hole.height - markerOffset }
        );
        // Left and right of hole
        outerDiamonds.push(
            { x: hole.x + markerOffset, y: hole.y + hole.height * i },
            { x: hole.x + hole.width - markerOffset, y: hole.y + hole.height * i }
        );
    }

    // Filter out diamonds that are too close to pockets
    const minDistanceFromPocket = config.pocketRadius + 15;
    const filteredDiamonds = outerDiamonds.filter(diamond => {
        for (const pocket of pockets) {
            const dx = diamond.x - pocket.x;
            const dy = diamond.y - pocket.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDistanceFromPocket) {
                return false; // Skip this diamond, too close to a pocket
            }
        }
        return true; // Keep this diamond
    });

    // Draw filtered diamonds
    for (const diamond of filteredDiamonds) {
        ctx.beginPath();
        ctx.arc(diamond.x, diamond.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize balls for donut table
function initBallsTable4(config) {
    const balls = [];
    const hole = config.innerHole;

    // Position balls in the upper area (above the hole)
    const startX = config.tableWidth * 0.3;
    const startY = config.tableHeight * 0.2;
    const r = config.ballRadius;
    const spacing = r * 2.1;

    // Standard triangle formation
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
                rotation: 0,
                ...BALL_COLORS[ballNum]
            });
        }
    }

    // Cue ball positioned on the right side
    balls.push({
        id: 0,
        x: config.tableWidth * 0.75,
        y: config.tableHeight * 0.2,
        vx: 0,
        vy: 0,
        rotation: 0,
        ...BALL_COLORS[0]
    });

    return balls;
}

// Draw menu background for donut table
function drawMenuBackgroundTable4(menuCtx, config) {
    // Clear canvas
    menuCtx.clearRect(0, 0, config.tableWidth, config.tableHeight);

    // Draw the table
    drawTable4(menuCtx, config);

    // Add some decorative balls
    const decorativeBalls = [
        { x: config.tableWidth * 0.3, y: config.tableHeight * 0.2, color: '#FFD700', number: 1 },
        { x: config.tableWidth * 0.75, y: config.tableHeight * 0.2, color: '#FFFFFF', number: null },
        { x: config.tableWidth * 0.5, y: config.tableHeight * 0.75, color: '#FF0000', number: 3 }
    ];

    decorativeBalls.forEach(ball => {
        const ballR = config.ballRadius;

        // Shadow
        menuCtx.fillStyle = 'rgba(0,0,0,0.3)';
        menuCtx.beginPath();
        menuCtx.ellipse(ball.x + 2, ball.y + 2, ballR, ballR * 0.8, 0, 0, Math.PI * 2);
        menuCtx.fill();

        // Color
        menuCtx.fillStyle = ball.color;
        menuCtx.beginPath();
        menuCtx.arc(ball.x, ball.y, ballR, 0, Math.PI * 2);
        menuCtx.fill();

        // Number circle
        if (ball.number !== null) {
            const numberRadius = ballR * 0.5;
            menuCtx.fillStyle = '#FFFFFF';
            menuCtx.beginPath();
            menuCtx.arc(ball.x, ball.y, numberRadius, 0, Math.PI * 2);
            menuCtx.fill();

            menuCtx.fillStyle = '#000';
            menuCtx.font = `bold ${ballR * 0.65}px Arial`;
            menuCtx.textAlign = 'center';
            menuCtx.textBaseline = 'middle';
            menuCtx.fillText(ball.number.toString(), ball.x, ball.y + 0.5);
        }

        // Gloss
        const glossGradient = menuCtx.createRadialGradient(
            ball.x - ballR * 0.3, ball.y - ballR * 0.3, 0,
            ball.x - ballR * 0.3, ball.y - ballR * 0.3, ballR * 0.8
        );
        glossGradient.addColorStop(0, 'rgba(255,255,255,0.4)');
        glossGradient.addColorStop(1, 'rgba(255,255,255,0)');
        menuCtx.fillStyle = glossGradient;
        menuCtx.beginPath();
        menuCtx.arc(ball.x, ball.y, ballR, 0, Math.PI * 2);
        menuCtx.fill();
    });
}
