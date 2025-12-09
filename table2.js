// Elongated Table Configuration
// This file contains the configuration for the elongated pool table

const TABLE2_CONFIG = {
    tableWidth: 1400,
    tableHeight: 500,
    railSize: 25,
    pocketRadius: 22,
    ballRadius: 12,
    friction: 0.985,
    minVelocity: 0.1,
    maxPower: 25,
    powerMultiplier: 0.15,
    deadZone: 35
};

// Initialize pockets for elongated table
// 10 pockets total: 4 corners + 2 on each long side + 2 on top + 2 on bottom
function initPocketsTable2() {
    const r = TABLE2_CONFIG.railSize;
    const w = TABLE2_CONFIG.tableWidth;
    const h = TABLE2_CONFIG.tableHeight;
    const offset = 5;

    return [
        { x: r - offset, y: r - offset },                    // Top-left corner
        { x: w * 0.33, y: r - offset - 5 },                  // Top-left middle
        { x: w * 0.67, y: r - offset - 5 },                  // Top-right middle
        { x: w - r + offset, y: r - offset },                // Top-right corner
        { x: r - offset - 5, y: h / 2 },                     // Middle-left
        { x: w - r + offset + 5, y: h / 2 },                 // Middle-right
        { x: r - offset, y: h - r + offset },                // Bottom-left corner
        { x: w * 0.33, y: h - r + offset + 5 },              // Bottom-left middle
        { x: w * 0.67, y: h - r + offset + 5 },              // Bottom-right middle
        { x: w - r + offset, y: h - r + offset }             // Bottom-right corner
    ];
}

// Draw the elongated table
function drawTable2(ctx, config) {
    const r = config.railSize;

    // Table felt (green)
    ctx.fillStyle = '#0d7a3e';
    ctx.fillRect(0, 0, config.tableWidth, config.tableHeight);

    // Add felt texture gradient
    const gradient = ctx.createRadialGradient(
        config.tableWidth / 2, config.tableHeight / 2, 0,
        config.tableWidth / 2, config.tableHeight / 2, config.tableWidth / 2
    );
    gradient.addColorStop(0, 'rgba(20, 140, 70, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 80, 40, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.tableWidth, config.tableHeight);

    // Rails (cushions) - split for 10 pockets
    ctx.fillStyle = '#0a5c2e';

    // Top rail (split into 3 segments for 2 middle pockets)
    const topPocket1X = config.tableWidth * 0.33;
    const topPocket2X = config.tableWidth * 0.67;
    // Segment 1: from left corner to first middle pocket
    ctx.fillRect(r + config.pocketRadius, 0, topPocket1X - r - config.pocketRadius * 1.5, r);
    // Segment 2: between the two middle pockets
    ctx.fillRect(topPocket1X + config.pocketRadius * 0.5, 0, topPocket2X - topPocket1X - config.pocketRadius, r);
    // Segment 3: from second middle pocket to right corner
    ctx.fillRect(topPocket2X + config.pocketRadius * 0.5, 0, config.tableWidth - topPocket2X - r - config.pocketRadius * 0.5, r);

    // Bottom rail (split into 3 segments for 2 middle pockets)
    // Segment 1: from left corner to first middle pocket
    ctx.fillRect(r + config.pocketRadius, config.tableHeight - r, topPocket1X - r - config.pocketRadius * 1.5, r);
    // Segment 2: between the two middle pockets
    ctx.fillRect(topPocket1X + config.pocketRadius * 0.5, config.tableHeight - r, topPocket2X - topPocket1X - config.pocketRadius, r);
    // Segment 3: from second middle pocket to right corner
    ctx.fillRect(topPocket2X + config.pocketRadius * 0.5, config.tableHeight - r, config.tableWidth - topPocket2X - r - config.pocketRadius * 0.5, r);

    // Left rail (split for middle pocket)
    ctx.fillRect(0, r + config.pocketRadius, r, config.tableHeight / 2 - r - config.pocketRadius * 1.5);
    ctx.fillRect(0, config.tableHeight / 2 + config.pocketRadius * 0.5, r, config.tableHeight / 2 - r - config.pocketRadius * 1.5);

    // Right rail (split for middle pocket)
    ctx.fillRect(config.tableWidth - r, r + config.pocketRadius, r, config.tableHeight / 2 - r - config.pocketRadius * 1.5);
    ctx.fillRect(config.tableWidth - r, config.tableHeight / 2 + config.pocketRadius * 0.5, r, config.tableHeight / 2 - r - config.pocketRadius * 1.5);

    // Draw pockets
    const pockets = initPocketsTable2();
    ctx.fillStyle = '#000';
    for (const pocket of pockets) {
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, config.pocketRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Pocket inner shadow
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

    // Diamond markers on rails (placed between pockets)
    ctx.fillStyle = '#FFF';

    // Top & Bottom diamonds (placed in segments between pockets)
    // Diamonds at: 16.5%, 50%, 83.5% (between the pockets at 33% and 67%)
    const topBottomDiamonds = [0.165, 0.5, 0.835];
    for (const d of topBottomDiamonds) {
        ctx.beginPath();
        ctx.arc(config.tableWidth * d, r / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(config.tableWidth * d, config.tableHeight - r / 2, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Side diamonds (excluding middle where pocket is at 50%)
    const sideDiamonds = [0.25, 0.75];
    for (const d of sideDiamonds) {
        ctx.beginPath();
        ctx.arc(r / 2, config.tableHeight * d, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(config.tableWidth - r / 2, config.tableHeight * d, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Head string (line where cue ball is placed) - adjusted for wider table
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(config.tableWidth * 0.75, r);
    ctx.lineTo(config.tableWidth * 0.75, config.tableHeight - r);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Initialize balls for elongated table
function initBallsTable2(config) {
    const startX = config.tableWidth * 0.3;
    const startY = config.tableHeight / 2;
    const r = config.ballRadius;
    const spacing = r * 2.1;

    const balls = [];
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

    // Cue ball positioned for wider table
    balls.push({
        id: 0,
        x: config.tableWidth * 0.75,
        y: config.tableHeight / 2,
        vx: 0,
        vy: 0,
        rotation: 0,
        ...BALL_COLORS[0]
    });

    return balls;
}

// Draw menu background for elongated table
function drawMenuBackgroundTable2(menuCtx, config) {
    // First draw the wooden table container
    const borderPadding = 20;
    const gradient = menuCtx.createLinearGradient(0, 0, config.tableWidth, config.tableHeight);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.5, '#654321');
    gradient.addColorStop(1, '#8B4513');

    // Fill entire canvas with wooden background
    menuCtx.fillStyle = gradient;
    menuCtx.fillRect(0, 0, config.tableWidth, config.tableHeight);

    // Add inner shadow/highlight for depth
    const shadowGradient = menuCtx.createLinearGradient(borderPadding, borderPadding, config.tableWidth - borderPadding, config.tableHeight - borderPadding);
    shadowGradient.addColorStop(0, 'rgba(255,255,255,0.1)');
    shadowGradient.addColorStop(0.5, 'rgba(0,0,0,0.1)');
    shadowGradient.addColorStop(1, 'rgba(0,0,0,0.2)');
    menuCtx.fillStyle = shadowGradient;
    menuCtx.fillRect(borderPadding/2, borderPadding/2, config.tableWidth - borderPadding, config.tableHeight - borderPadding);

    // Now draw the actual playing surface
    const r = config.railSize;

    // Table felt (green)
    menuCtx.fillStyle = '#0d7a3e';
    menuCtx.fillRect(borderPadding, borderPadding, config.tableWidth - borderPadding*2, config.tableHeight - borderPadding*2);

    // Add felt texture gradient
    const feltGradient = menuCtx.createRadialGradient(
        config.tableWidth / 2, config.tableHeight / 2, 0,
        config.tableWidth / 2, config.tableHeight / 2, config.tableWidth / 2
    );
    feltGradient.addColorStop(0, 'rgba(20, 140, 70, 0.3)');
    feltGradient.addColorStop(1, 'rgba(0, 80, 40, 0.3)');
    menuCtx.fillStyle = feltGradient;
    menuCtx.fillRect(borderPadding, borderPadding, config.tableWidth - borderPadding*2, config.tableHeight - borderPadding*2);

    // Rails (cushions) - adjusted for border and 10 pockets
    const railOffset = borderPadding;
    menuCtx.fillStyle = '#0a5c2e';

    const menuTopPocket1X = config.tableWidth * 0.33;
    const menuTopPocket2X = config.tableWidth * 0.67;

    // Top rail (split into 3 segments for 2 middle pockets)
    menuCtx.fillRect(railOffset + r + config.pocketRadius, railOffset, menuTopPocket1X - r - config.pocketRadius * 1.5 - borderPadding, r);
    menuCtx.fillRect(menuTopPocket1X + config.pocketRadius * 0.5, railOffset, menuTopPocket2X - menuTopPocket1X - config.pocketRadius, r);
    menuCtx.fillRect(menuTopPocket2X + config.pocketRadius * 0.5, railOffset, config.tableWidth - menuTopPocket2X - r - config.pocketRadius * 0.5 - borderPadding * 2, r);

    // Bottom rail (split into 3 segments for 2 middle pockets)
    menuCtx.fillRect(railOffset + r + config.pocketRadius, config.tableHeight - r - railOffset, menuTopPocket1X - r - config.pocketRadius * 1.5 - borderPadding, r);
    menuCtx.fillRect(menuTopPocket1X + config.pocketRadius * 0.5, config.tableHeight - r - railOffset, menuTopPocket2X - menuTopPocket1X - config.pocketRadius, r);
    menuCtx.fillRect(menuTopPocket2X + config.pocketRadius * 0.5, config.tableHeight - r - railOffset, config.tableWidth - menuTopPocket2X - r - config.pocketRadius * 0.5 - borderPadding * 2, r);

    // Left rail (split for middle pocket)
    menuCtx.fillRect(railOffset, railOffset + r + config.pocketRadius, r, config.tableHeight / 2 - r - config.pocketRadius * 1.5 - borderPadding);
    menuCtx.fillRect(railOffset, config.tableHeight / 2 + config.pocketRadius * 0.5, r, config.tableHeight / 2 - r - config.pocketRadius * 1.5 - borderPadding);

    // Right rail (split for middle pocket)
    menuCtx.fillRect(config.tableWidth - r - railOffset, railOffset + r + config.pocketRadius, r, config.tableHeight / 2 - r - config.pocketRadius * 1.5 - borderPadding);
    menuCtx.fillRect(config.tableWidth - r - railOffset, config.tableHeight / 2 + config.pocketRadius * 0.5, r, config.tableHeight / 2 - r - config.pocketRadius * 1.5 - borderPadding);

    // Draw pockets - adjusted for border (10 pockets total)
    menuCtx.fillStyle = '#000';
    const tempPockets = [
        { x: railOffset + r - 5, y: railOffset + r - 5 },                    // Top-left corner
        { x: config.tableWidth * 0.33, y: railOffset + r - 10 },             // Top-left middle
        { x: config.tableWidth * 0.67, y: railOffset + r - 10 },             // Top-right middle
        { x: config.tableWidth - r + 5 - railOffset, y: railOffset + r - 5 }, // Top-right corner
        { x: railOffset + r - 10, y: config.tableHeight / 2 },               // Middle-left
        { x: config.tableWidth - r + 10 - railOffset, y: config.tableHeight / 2 }, // Middle-right
        { x: railOffset + r - 5, y: config.tableHeight - r + 5 - railOffset }, // Bottom-left corner
        { x: config.tableWidth * 0.33, y: config.tableHeight - r + 10 - railOffset }, // Bottom-left middle
        { x: config.tableWidth * 0.67, y: config.tableHeight - r + 10 - railOffset }, // Bottom-right middle
        { x: config.tableWidth - r + 5 - railOffset, y: config.tableHeight - r + 5 - railOffset } // Bottom-right corner
    ];

    for (const pocket of tempPockets) {
        menuCtx.beginPath();
        menuCtx.arc(pocket.x, pocket.y, config.pocketRadius, 0, Math.PI * 2);
        menuCtx.fill();

        // Pocket inner shadow
        const shadowGradient = menuCtx.createRadialGradient(
            pocket.x, pocket.y, config.pocketRadius * 0.5,
            pocket.x, pocket.y, config.pocketRadius
        );
        shadowGradient.addColorStop(0, 'rgba(0,0,0,0.8)');
        shadowGradient.addColorStop(1, 'rgba(30,30,30,1)');
        menuCtx.fillStyle = shadowGradient;
        menuCtx.beginPath();
        menuCtx.arc(pocket.x, pocket.y, config.pocketRadius, 0, Math.PI * 2);
        menuCtx.fill();
        menuCtx.fillStyle = '#000';
    }

    // Diamond markers on rails (placed between pockets)
    menuCtx.fillStyle = '#FFF';
    const topBottomDiamonds = [0.165, 0.5, 0.835];
    for (const d of topBottomDiamonds) {
        menuCtx.beginPath();
        menuCtx.arc(borderPadding + (config.tableWidth - borderPadding*2) * d, railOffset + r / 2, 3, 0, Math.PI * 2);
        menuCtx.fill();
        menuCtx.beginPath();
        menuCtx.arc(borderPadding + (config.tableWidth - borderPadding*2) * d, config.tableHeight - r / 2 - railOffset, 3, 0, Math.PI * 2);
        menuCtx.fill();
    }

    // Side diamonds (between corner and middle pockets)
    const sideDiamonds = [0.25, 0.75];
    for (const d of sideDiamonds) {
        menuCtx.beginPath();
        menuCtx.arc(railOffset + r / 2, borderPadding + (config.tableHeight - borderPadding*2) * d, 3, 0, Math.PI * 2);
        menuCtx.fill();
        menuCtx.beginPath();
        menuCtx.arc(config.tableWidth - r / 2 - railOffset, borderPadding + (config.tableHeight - borderPadding*2) * d, 3, 0, Math.PI * 2);
        menuCtx.fill();
    }

    // Draw some decorative balls
    const playAreaWidth = config.tableWidth - borderPadding * 2;
    const playAreaHeight = config.tableHeight - borderPadding * 2;

    const decorativeBalls = [
        { x: borderPadding + playAreaWidth * 0.2, y: borderPadding + playAreaHeight * 0.3, color: '#FFD700', number: 1 },
        { x: borderPadding + playAreaWidth * 0.8, y: borderPadding + playAreaHeight * 0.7, color: '#0000CD', number: 2 },
        { x: borderPadding + playAreaWidth * 0.3, y: borderPadding + playAreaHeight * 0.8, color: '#FF0000', number: 3 },
        { x: borderPadding + playAreaWidth * 0.7, y: borderPadding + playAreaHeight * 0.2, color: '#000000', number: 8 },
        { x: borderPadding + playAreaWidth * 0.5, y: borderPadding + playAreaHeight * 0.4, color: '#FFFFFF', number: null }
    ];

    decorativeBalls.forEach(ball => {
        const ballR = config.ballRadius;

        // Ball shadow
        menuCtx.fillStyle = 'rgba(0,0,0,0.3)';
        menuCtx.beginPath();
        menuCtx.ellipse(ball.x + 2, ball.y + 2, ballR, ballR * 0.8, 0, 0, Math.PI * 2);
        menuCtx.fill();

        // Ball base
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

            // Number text
            menuCtx.fillStyle = '#000';
            menuCtx.font = `bold ${ballR * 0.65}px Arial`;
            menuCtx.textAlign = 'center';
            menuCtx.textBaseline = 'middle';
            menuCtx.fillText(ball.number.toString(), ball.x, ball.y + 0.5);
        }

        // Glossy highlight
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
