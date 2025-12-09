// Cross-Shaped Table Configuration with Modular Square System
// This uses a modular approach where the table is built from rectangular sections

const TABLE3_CONFIG = {
    // Individual module dimensions
    moduleWidth: 400,
    moduleHeight: 300,

    // Overall table dimensions (for canvas sizing)
    tableWidth: 1200,   // 3 modules wide (left arm + center + right arm)
    tableHeight: 900,   // 3 modules tall (top arm + center + bottom arm)

    railSize: 25,
    pocketRadius: 22,
    ballRadius: 12,
    friction: 0.985,
    minVelocity: 0.1,
    maxPower: 25,
    powerMultiplier: 0.15,
    deadZone: 35
};

// Initialize pockets for cross table (12 pockets - 3 at each arm end)
function initPocketsTable3() {
    const r = TABLE3_CONFIG.railSize;
    const offset = 5;

    return [
        // Top arm pockets (at y=0)
        { x: 400 + r - offset, y: r - offset },                    // Top-left corner
        { x: 600, y: r - offset - 5 },                             // Top-middle
        { x: 800 - r + offset, y: r - offset },                    // Top-right corner

        // Right arm pockets (at x=1200)
        { x: 1200 - r + offset, y: 300 + r - offset },             // Right-top corner
        { x: 1200 - r + offset + 5, y: 450 },                      // Right-middle
        { x: 1200 - r + offset, y: 600 - r + offset },             // Right-bottom corner

        // Bottom arm pockets (at y=900)
        { x: 800 - r + offset, y: 900 - r + offset },              // Bottom-right corner
        { x: 600, y: 900 - r + offset + 5 },                       // Bottom-middle
        { x: 400 + r - offset, y: 900 - r + offset },              // Bottom-left corner

        // Left arm pockets (at x=0)
        { x: r - offset, y: 600 - r + offset },                    // Left-bottom corner
        { x: r - offset - 5, y: 450 },                             // Left-middle
        { x: r - offset, y: 300 + r - offset }                     // Left-top corner
    ];
}

// Helper to draw the cross polygon
function traceCrossPath(ctx, offset = 0) {
    ctx.beginPath();
    // Top Arm
    ctx.moveTo(400 + offset, 0 + offset);
    ctx.lineTo(800 - offset, 0 + offset);
    ctx.lineTo(800 - offset, 300 + offset); // Inner corner top-right
    
    // Right Arm
    ctx.lineTo(1200 - offset, 300 + offset);
    ctx.lineTo(1200 - offset, 600 - offset);
    ctx.lineTo(800 - offset, 600 - offset); // Inner corner bottom-right
    
    // Bottom Arm
    ctx.lineTo(800 - offset, 900 - offset);
    ctx.lineTo(400 + offset, 900 - offset);
    ctx.lineTo(400 + offset, 600 - offset); // Inner corner bottom-left
    
    // Left Arm
    ctx.lineTo(0 + offset, 600 - offset);
    ctx.lineTo(0 + offset, 300 + offset);
    ctx.lineTo(400 + offset, 300 + offset); // Inner corner top-left
    
    ctx.closePath();
}

// Draw the complete cross-shaped table
function drawTable3(ctx, config) {
    const r = config.railSize;

    // 1. Draw the Wood Base (The Rails)
    // We draw the full cross shape in wood color
    const woodGradient = ctx.createLinearGradient(0, 0, config.tableWidth, config.tableHeight);
    woodGradient.addColorStop(0, '#8B4513');
    woodGradient.addColorStop(0.5, '#654321');
    woodGradient.addColorStop(1, '#8B4513');
    
    ctx.fillStyle = woodGradient;
    traceCrossPath(ctx, 0); // No offset = outer edge
    ctx.fill();

    // 2. Draw the Green Felt (Inset by rail size)
    ctx.fillStyle = '#0d7a3e';
    traceCrossPath(ctx, r); // Offset by rail size
    ctx.fill();

    // 3. Add felt texture gradient (masked to the inner area)
    ctx.save();
    traceCrossPath(ctx, r);
    ctx.clip();
    const gradient = ctx.createRadialGradient(
        config.tableWidth / 2, config.tableHeight / 2, 0,
        config.tableWidth / 2, config.tableHeight / 2, config.tableWidth / 2
    );
    gradient.addColorStop(0, 'rgba(20, 140, 70, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 80, 40, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.tableWidth, config.tableHeight);
    ctx.restore();

    // 4. Draw Inner Corner rounded details (optional visuals to make rails look joined)
    // We draw small squares at the inner corners to connect the rails sharply
    ctx.fillStyle = '#0a5c2e'; // Darker rail color
    
    // 5. Draw Pockets
    const pockets = initPocketsTable3();
    
    // Pocket outer shadows/holes
    ctx.fillStyle = '#000';
    for (const pocket of pockets) {
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, config.pocketRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Pocket inner depth
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
    const diamonds = [
        // Top arm
        { x: 500, y: r / 2 }, { x: 600, y: r / 2 }, { x: 700, y: r / 2 },
        // Right arm
        { x: 1200 - r / 2, y: 375 }, { x: 1200 - r / 2, y: 450 }, { x: 1200 - r / 2, y: 525 },
        // Bottom arm
        { x: 500, y: 900 - r / 2 }, { x: 600, y: 900 - r / 2 }, { x: 700, y: 900 - r / 2 },
        // Left arm
        { x: r / 2, y: 375 }, { x: r / 2, y: 450 }, { x: r / 2, y: 525 }
    ];

    for (const diamond of diamonds) {
        ctx.beginPath();
        ctx.arc(diamond.x, diamond.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize balls for cross table
function initBallsTable3(config) {
    const balls = [];

    // Position balls in the center module
    const startX = 600;  // Center of the table
    const startY = 450;  // Center of the table
    const r = config.ballRadius;
    const spacing = r * 2.1;

    // Triangle formation
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

    // Cue ball positioned on the left arm
    balls.push({
        id: 0,
        x: 200,
        y: 450,
        vx: 0,
        vy: 0,
        rotation: 0,
        ...BALL_COLORS[0]
    });

    return balls;
}

// Draw menu background for cross table
function drawMenuBackgroundTable3(menuCtx, config) {
    // Clear canvas
    menuCtx.clearRect(0, 0, config.tableWidth, config.tableHeight);
    
    // Draw the table structure using the same logic as the main game
    drawTable3(menuCtx, config);

    // Add decorative balls
    const decorativeBalls = [
        { x: 600, y: 450, color: '#FFD700', number: 1 },
        { x: 200, y: 450, color: '#FFFFFF', number: null }
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