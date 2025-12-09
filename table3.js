// Cross-Shaped Table Configuration
// Adjusted to include distinct Wood and Cushion layers within the rail space

const TABLE3_CONFIG = {
    // Individual module dimensions
    moduleWidth: 400,
    moduleHeight: 300,

    // Overall table dimensions
    tableWidth: 1200,
    tableHeight: 900,

    railSize: 25, // Total width of the non-playable border (Wood + Cushion)
    pocketRadius: 22,
    ballRadius: 12,
    friction: 0.985,
    minVelocity: 0.1,
    maxPower: 25,
    powerMultiplier: 0.15,
    deadZone: 35
};

// Initialize pockets for cross table
function initPocketsTable3() {
    const r = TABLE3_CONFIG.railSize;
    const offset = 5;

    return [
        // Top arm pockets
        { x: 400 + r - offset, y: r - offset },
        { x: 600, y: r - offset - 5 },
        { x: 800 - r + offset, y: r - offset },

        // Right arm pockets
        { x: 1200 - r + offset, y: 300 + r - offset },
        { x: 1200 - r + offset + 5, y: 450 },
        { x: 1200 - r + offset, y: 600 - r + offset },

        // Bottom arm pockets
        { x: 800 - r + offset, y: 900 - r + offset },
        { x: 600, y: 900 - r + offset + 5 },
        { x: 400 + r - offset, y: 900 - r + offset },

        // Left arm pockets
        { x: r - offset, y: 600 - r + offset },
        { x: r - offset - 5, y: 450 },
        { x: r - offset, y: 300 + r - offset }
    ];
}

// Helper to draw the cross polygon shape at a specific offset (inset)
function traceCrossPath(ctx, offset = 0) {
    ctx.beginPath();
    // Top Arm
    ctx.moveTo(400 + offset, 0 + offset);
    ctx.lineTo(800 - offset, 0 + offset);
    ctx.lineTo(800 - offset, 300 + offset); // Inner corner
    
    // Right Arm
    ctx.lineTo(1200 - offset, 300 + offset);
    ctx.lineTo(1200 - offset, 600 - offset);
    ctx.lineTo(800 - offset, 600 - offset); // Inner corner
    
    // Bottom Arm
    ctx.lineTo(800 - offset, 900 - offset);
    ctx.lineTo(400 + offset, 900 - offset);
    ctx.lineTo(400 + offset, 600 - offset); // Inner corner
    
    // Left Arm
    ctx.lineTo(0 + offset, 600 - offset);
    ctx.lineTo(0 + offset, 300 + offset);
    ctx.lineTo(400 + offset, 300 + offset); // Inner corner
    
    ctx.closePath();
}

function drawTable3(ctx, config) {
    const r = config.railSize; // 25px total border
    const woodThickness = 10;  // 10px Wood
    // Remainder (15px) is the Dark Green Cushion

    // 1. Draw the Wood Frame (The Base)
    // Offset 0: Fills the entire shape
    const woodGradient = ctx.createLinearGradient(0, 0, config.tableWidth, config.tableHeight);
    woodGradient.addColorStop(0, '#8B4513');
    woodGradient.addColorStop(0.5, '#654321');
    woodGradient.addColorStop(1, '#8B4513');
    
    ctx.fillStyle = woodGradient;
    traceCrossPath(ctx, 0);
    ctx.fill();

    // 2. Draw the Dark Green Cushion
    // Offset by 'woodThickness' (10px). This sits on top of the wood.
    ctx.fillStyle = '#0a5c2e'; 
    traceCrossPath(ctx, woodThickness);
    ctx.fill();

    // 3. Draw the Green Felt (Playable Area)
    // Offset by 'r' (25px). This matches the physics walls.
    ctx.fillStyle = '#0d7a3e';
    traceCrossPath(ctx, r);
    ctx.fill();

    // 4. Add felt texture gradient (masked to the inner area)
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

    // 5. Draw Pockets
    const pockets = initPocketsTable3();
    
    // Pocket holes
    ctx.fillStyle = '#000';
    for (const pocket of pockets) {
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, config.pocketRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Pocket inner depth/shadow
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
    // Placed in the cushion area (between wood and felt)
    ctx.fillStyle = '#FFF';
    const markerOffset = woodThickness + (r - woodThickness) / 2; // Middle of the cushion

    // Define points for diamonds relative to the cross shape
    // REMOVED the middle diamonds that were overlapping pockets (similar to table2.js logic)
    const diamonds = [
        // Top arm (Removed middle at x=600)
        { x: 500, y: markerOffset }, { x: 700, y: markerOffset },
        
        // Right arm (Removed middle at y=450)
        { x: 1200 - markerOffset, y: 375 }, { x: 1200 - markerOffset, y: 525 },
        
        // Bottom arm (Removed middle at x=600)
        { x: 500, y: 900 - markerOffset }, { x: 700, y: 900 - markerOffset },
        
        // Left arm (Removed middle at y=450)
        { x: markerOffset, y: 375 }, { x: markerOffset, y: 525 }
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
    
    // Draw the table structure using the main drawing function
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