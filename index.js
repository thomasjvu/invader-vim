const scoreVal = document.querySelector("#scoreVal");
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const highScoreVal = document.querySelector("#highScoreVal");

canvas.width = 1024;
canvas.height = 576;

const audio = {
    background: new Audio('./audio/background.wav'),
    shoot: new Audio('./audio/shoot.wav'),
    explosion: new Audio('./audio/explosion.wav'),
    powerUp: new Audio('./audio/powerup.wav'),
    command: new Audio('./audio/command.wav')
};

audio.background.loop = true;

function playSound(sound) {
    const soundToPlay = audio[sound];
    if (soundToPlay) {
        soundToPlay.currentTime = 0;
        soundToPlay.play();
    }
}

let highScore = parseInt(localStorage.getItem('invaderVimHighScore')) || 0;
highScoreVal.innerHTML = highScore;

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0,
        };

        this.rotation = 0;
        this.opacity = 1;

        const image = new Image();
        image.src = "./img/shipFullHealth.png";
        image.onload = () => {
            const scale = 1;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20,
            };
        };

        this.particles = [];
        this.frames = 0;
        this.shielded = false;
        this.speedMultiplier = 1;
    }

    draw() {
        // c.fillStyle = 'red'
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)

        c.save();
        c.globalAlpha = this.opacity;
        c.translate(
            player.position.x + player.width / 2,
            player.position.y + player.height / 2
        );
        c.rotate(this.rotation);

        c.translate(
            -player.position.x - player.width / 2,
            -player.position.y - player.height / 2
        );

        c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
        c.restore();
    }

    update() {
        if (this.image) {
            this.draw();
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }

        // Stop particles if player is hit
        if (this.opacity !== 1) return

        this.frames++;
        if (this.frames % 2 === 0) {
            this.particles.push(
                new Particle({
                    position: {
                        x: this.position.x + this.width / 2,
                        y: this.position.y + this.height,
                    },
                    velocity: {
                        x: (Math.random() - 0.5) * 1.25,
                        y: 1.5,
                    },
                    radius: Math.random() * 2,
                    color: "white",
                    fades: true,
                })
            );
        }
    }

    applyPowerUp(powerUp) {
        powerUp.type.effect(this);
        
        // Create visual effect
        createParticles({
            object: this,
            color: powerUp.type.color,
            fades: true
        });

        // Remove power-up after duration
        setTimeout(() => {
            if (powerUp.type.name === 'Machine Gun') this.powerUp = null;
            if (powerUp.type.name === 'Shield') this.shielded = false;
            if (powerUp.type.name === 'Speed Boost') this.speedMultiplier = 1;
        }, powerUp.type.duration);
    }
}

class Projectile {
    constructor({ position, velocity, color = "green" }) {
        this.position = position;
        this.velocity = velocity;

        this.radius = 4;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Particle {
    constructor({ position, velocity, radius, color, fades }) {
        this.position = position;
        this.velocity = velocity;

        this.radius = radius;
        this.color = color;
        this.opacity = 1;
        this.fades = fades;
    }

    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.fades) this.opacity -= 0.01;
    }
}

class InvaderProjectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = {
            x: velocity.x,
            y: velocity.y * currentDifficulty.projectileSpeed
        };
        this.width = 3;
        this.height = 10;
    }

    draw() {
        c.fillStyle = "purple";
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Invader {
    constructor({ position }) {
        this.velocity = {
            x: 0,
            y: 0,
        };

        const image = new Image();
        image.src = "./img/invader.png";
        image.onload = () => {
            const scale = 0.05;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: position.x,
                y: position.y,
            };
        };
    }

    draw() {

        c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }

    update({ velocity }) {
        if (this.image) {
            this.draw();
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
    }

    shoot(invaderProjectiles) {
        invaderProjectiles.push(
            new InvaderProjectile({
                position: {
                    x: this.position.x + this.width / 2,
                    y: this.position.y + this.height,
                },
                velocity: {
                    x: 0,
                    y: 1,
                },
            })
        );
    }
}

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0,
        };

        this.velocity = {
            x: currentDifficulty.invaderSpeed,
            y: 0,
        };

        this.invaders = [];

        const columns = Math.floor(Math.random() * 10 + 5);
        const rows = Math.floor(Math.random() * 5 + 2);

        this.width = columns * 30;

        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(
                    new Invader({
                        position: {
                            x: x * 30,
                            y: y * 30,
                        },
                    })
                );
            }
        }
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.velocity.y = 0;

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            // Reverse direction and increase speed slightly
            this.velocity.x = -this.velocity.x * 1.15;
            this.velocity.y = 30;
        }
    }
}

class Bomb {
    static radius = 30;
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 0;
        this.color = "red";
        this.opacity = 1;
        this.active = false;

        gsap.to(this, {
            radius: 30,
        });
    }

    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.closePath();
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (
            this.position.x + this.radius + this.velocity.x >= canvas.width ||
            this.position.x - this.radius + this.velocity.x <= 0
        ) {
            this.velocity.x = -this.velocity.x;
        } else if (
            this.position.y + this.radius + this.velocity.y >= canvas.height ||
            this.position.y - this.radius + this.velocity.y <= 0
        )
            this.velocity.y = -this.velocity.y;
    }

    explode() {
        this.active = true;
        this.velocity.x = 0;
        this.velocity.y = 0;
        gsap.to(this, {
            radius: 200,
            color: "white",
        });

        gsap.to(this, {
            delay: 0.1,
            opacity: 0,
            duration: 0.15,
        });
    }
}

class PowerUp {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        
        // Randomly select power-up type
        this.type = Object.values(POWER_UPS)[
            Math.floor(Math.random() * Object.values(POWER_UPS).length)
        ];
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.type.color;
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

// Create Game Objects & Arrays

let player = new Player();
let projectiles = [];
let grids = [];
let invaderProjectiles = [];
let particles = [];
let bombs = [];
let powerUps = [];

// Create Player Keys
let keys = {
    h: {
        pressed: false,
    },
    j: {
        pressed: false,
    },
    k: {
        pressed: false,
    },
    l: {
        pressed: false,
    },
    space: {
        pressed: false,
    },
    w: {
        pressed: false,
    },
    b: {
        pressed: false,
    },
    0: {
        pressed: false,
    },
    $: {
        pressed: false,
    },
    f: {
        pressed: false,
    },
    gg: {
        pressed: false,
    },
    G: {
        pressed: false,
    },
};

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);
let game = {
    over: false,
    active: true,
};
let score = 0;

// Add volume control functionality
let isMuted = false;
const muteBtn = document.querySelector('#mute-btn');
const volumeSlider = document.querySelector('#volume-slider');

muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? '🔈' : '🔊';
    
    Object.values(audio).forEach(sound => {
        sound.muted = isMuted;
    });
});

volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value;
    Object.values(audio).forEach(sound => {
        sound.volume = volume;
    });
});

// Set initial volumes
Object.values(audio).forEach(sound => {
    sound.volume = volumeSlider.value;
});

function init() {
    player = new Player();
    projectiles = [];
    grids = [];
    invaderProjectiles = [];
    particles = [];
    bombs = [];
    powerUps = [];

    keys = {
        h: {
            pressed: false,
        },
        j: {
            pressed: false,
        },
        k: {
            pressed: false,
        },
        l: {
            pressed: false,
        },
        space: {
            pressed: false,
        },
        w: {
            pressed: false,
        },
        b: {
            pressed: false,
        },
        0: {
            pressed: false,
        },
        $: {
            pressed: false,
        },
        f: {
            pressed: false,
        },
        gg: {
            pressed: false,
        },
        G: {
            pressed: false,
        },
    };

    frames = 0;
    randomInterval = Math.floor(Math.random() * 500 + 500);
    game = {
        over: false,
        active: true,
    };
    score = 0;

    for (let i = 0; i < 100; i++) {
        particles.push(
            new Particle({
                position: {
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                },
                velocity: {
                    x: 0,
                    y: 0.3,
                },
                radius: Math.random() * 2,
                color: "white",
            })
        );
    }

    currentLevel = 1;
    enemiesDefeatedInLevel = 0;
    enemiesRequiredForNextLevel = 20;
    document.querySelector('#levelVal').innerHTML = currentLevel;
}



for (let i = 0; i < 100; i++) {
    particles.push(
        new Particle({
            position: {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
            },
            velocity: {
                x: 0,
                y: 0.3,
            },
            radius: Math.random() * 2,
            color: "white",
        })
    );
}

function createParticles({ object, color, fades }) {
    playSound('explosion');
    for (let i = 0; i < 15; i++) {
        particles.push(
            new Particle({
                position: {
                    x: object.position.x + object.width / 2,
                    y: object.position.y + object.height / 2,
                },
                velocity: {
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2,
                },
                radius: Math.random() * 3,
                color: color || "#BAA0DE",
                fades,
            })
        );
    }
}

function createScoreLabel({ score = 100, object }) {
    const scoreLabel = document.createElement("label");
    scoreLabel.innerHTML = score;
    scoreLabel.style.position = "absolute";
    scoreLabel.style.color = "white";
    scoreLabel.style.top = object.position.y + "px";
    scoreLabel.style.left = object.position.x + "px";
    scoreLabel.style.userSelect = "none";
    document.querySelector("#parentDiv").appendChild(scoreLabel);

    gsap.to(scoreLabel, {
        opacity: 0,
        y: -30,
        duration: 0.75,
        onComplete: () => {
            document.querySelector("#parentDiv").removeChild(scoreLabel);
        },
    });
}

function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width
    );
}

function endGame() {
    console.log("you lose");

    // Get the correct high score for current difficulty
    const difficultyKey = `invaderVimHighScore_${currentDifficulty.name.toLowerCase().replace(' ', '_')}`;
    const currentHighScore = parseInt(localStorage.getItem(difficultyKey)) || 0;

    // Check for new high score
    if (score > currentHighScore) {
        // Update both local and difficulty-specific high scores
        highScore = score;
        currentDifficulty.highScore = score;
        localStorage.setItem(difficultyKey, score);
        localStorage.setItem('invaderVimHighScore', score);
        highScoreVal.innerHTML = highScore;
        
        // Create high score celebration effect at player's position
        for (let i = 0; i < 50; i++) {
            particles.push(
                new Particle({
                    position: {
                        x: player.position.x + player.width / 2,
                        y: player.position.y + player.height / 2
                    },
                    velocity: {
                        x: (Math.random() - 0.5) * 8,
                        y: (Math.random() - 0.5) * 8
                    },
                    radius: Math.random() * 3,
                    color: '#FFD700', // Gold color for high score
                    fades: true
                })
            );
        }
    }

    // Create death particles at player's position
    createParticles({
        object: player,
        color: "white",
        fades: true,
    });

    // Makes Player disappear
    setTimeout(() => {
        player.opacity = 0;
        game.over = true;
    }, 0);

    // Stops game altogether
    setTimeout(() => {
        game.active = false;
        document.querySelector('#gameOver').style.display = 'flex';
        
        // Add high score message if it's a new record
        const gameOverTitle = document.querySelector('#gameOver .terminal-title');
        if (score > highScore) {
            gameOverTitle.innerHTML = `NEW HIGH SCORE: ${score}!<span class="cursor"></span>`;
        } else {
            gameOverTitle.innerHTML = `GAME OVER<span class="cursor"></span>`;
        }
    }, 1000);
}

let spawnBuffer = 500;
function animate() {
    if (!game.active) return;
    requestAnimationFrame(animate);
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];

        if (powerUp.position.x - powerUp.radius >= canvas.width)
            powerUps.splice(i, 1);
        else powerUp.update();
    }

    // spawn powerups
    if (frames % currentDifficulty.powerUpFrequency === 0) {
        powerUps.push(
            new PowerUp({
                position: {
                    x: 0,
                    y: Math.random() * 300 + 15,
                },
                velocity: {
                    x: 5,
                    y: 0,
                },
            })
        );
    }

    // spawn bombs
    if (frames % 200 === 0 && bombs.length < 2) {
        bombs.push(
            new Bomb({
                position: {
                    x: randomBetween(Bomb.radius, canvas.width - Bomb.radius),
                    y: randomBetween(Bomb.radius, canvas.height - Bomb.radius),
                },
                velocity: {
                    x: (Math.random() - 0.5) * 6,
                    y: (Math.random() - 0.5) * 6,
                },
            })
        );
    }

    for (let i = bombs.length - 1; i >= 0; i--) {
        const bomb = bombs[i];

        if (bomb.opacity <= 0) {
            bombs.splice(i, 1);
        } else bomb.update();
    }

    player.update();

    for (let i = player.particles.length - 1; i >= 0; i--) {
        const particle = player.particles[i];
        particle.update();

        if (particle.opacity === 0) {
            player.particles[i].splice(i, 1)
        }
    }

    particles.forEach((particle, i) => {
        if (particle.position.y - particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width;
            particle.position.y = -particle.radius;
        }

        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(i, 1);
            }, 0);
        } else {
            particle.update();
        }
    });

    invaderProjectiles.forEach((invaderProjectile, index) => {
        if (
            invaderProjectile.position.y + invaderProjectile.height >=
            canvas.height
        ) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
            }, 0);
        } else invaderProjectile.update();

        // projectile hits player
        if (
            rectangularCollision({
                rectangle1: invaderProjectile,
                rectangle2: player,
            })
        ) {
            invaderProjectiles.splice(index, 1);
            
            // Only end game if player is not shielded
            if (!player.shielded) {
                endGame();
            } else {
                // If player is shielded, just create shield hit effect
                createParticles({
                    object: player,
                    color: 'blue',
                    fades: true
                });
            }
        }
    });

    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];

        for (let j = bombs.length - 1; j >= 0; j--) {
            const bomb = bombs[j];

            // if projectile touches bomb, remove projectile
            if (
                Math.hypot(
                    projectile.position.x - bomb.position.x,
                    projectile.position.y - bomb.position.y
                ) <
                    projectile.radius + bomb.radius &&
                !bomb.active
            ) {
                projectiles.splice(i, 1);
                bomb.explode();
            }
        }

        for (let j = powerUps.length - 1; j >= 0; j--) {
            const powerUp = powerUps[j];

            // if projectile touches bomb, remove projectile
            if (
                Math.hypot(
                    projectile.position.x - powerUp.position.x,
                    projectile.position.y - powerUp.position.y
                ) <
                projectile.radius + powerUp.radius
            ) {
                projectiles.splice(i, 1);
                powerUps.splice(j, 1);
                player.powerUp = "MachineGun";
                playSound('powerUp');
                console.log("powerup started");

                setTimeout(() => {
                    player.powerUp = null;
                    console.log("powerup ended");
                }, 2000);
            }
        }

        if (projectile.position.y + projectile.radius <= 0) {
            projectiles.splice(i, 1);
        } else {
            projectile.update();
        }
    }

    grids.forEach((grid, gridIndex) => {
        grid.update();

        // spawn projectiles
        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[
                Math.floor(Math.random() * grid.invaders.length)
            ].shoot(invaderProjectiles);
        }

        for (let i = grid.invaders.length - 1; i >= 0; i--) {
            const invader = grid.invaders[i];
            invader.update({ velocity: grid.velocity });

            for (let j = bombs.length - 1; j >= 0; j--) {
                const bomb = bombs[j];

                const invaderRadius = 15;

                // if bomb touches invader, remove invader
                if (
                    Math.hypot(
                        invader.position.x - bomb.position.x,
                        invader.position.y - bomb.position.y
                    ) <
                        invaderRadius + bomb.radius &&
                    bomb.active
                ) {
                    score += 50 * currentDifficulty.score_multiplier;
                    scoreVal.innerHTML = score;
                    enemiesDefeatedInLevel++;
                    checkLevelProgression();

                    grid.invaders.splice(i, 1);
                    createScoreLabel({
                        object: invader,
                        score: 50,
                    });

                    createParticles({
                        object: invader,
                        fades: true,
                    });
                }
            }
            // projectiles hit enemy
            projectiles.forEach((projectile, j) => {
                if (
                    projectile.position.y - projectile.radius <=
                        invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >=
                        invader.position.x &&
                    projectile.position.x - projectile.radius <=
                        invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >=
                        invader.position.y
                ) {
                    setTimeout(() => {
                        const invaderFound = grid.invaders.find(
                            (invader2) => invader2 === invader
                        );

                        const projectileFound = projectiles.find(
                            (projectile2) => projectile2 === projectile
                        );

                        // remove invader and projectile on hit
                        if (invaderFound && projectileFound) {
                            score += 100 * currentDifficulty.score_multiplier;
                            scoreVal.innerHTML = score;
                            enemiesDefeatedInLevel++;
                            checkLevelProgression();

                            // create dynamic score labels
                            createScoreLabel({
                                object: invader,
                            });

                            // create particle effects
                            createParticles({
                                object: invader,
                                fades: true,
                            });
                            // particle explosion on hit
                            grid.invaders.splice(i, 1);
                            projectiles.splice(j, 1);

                            if (grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0];
                                const lastInvader =
                                    grid.invaders[grid.invaders.length - 1];

                                grid.width =
                                    lastInvader.position.x -
                                    firstInvader.position.x +
                                    lastInvader.width;
                                grid.position.x = firstInvader.position.x;
                            } else {
                                grids.splice(gridIndex, 1);
                            }
                        }
                    }, 0);
                }
            });

            // remove player if invaders touch it
            if (
                rectangularCollision({
                    rectangle1: invader,
                    rectangle2: player,
                }) &&
                !game.over
            )
                endGame();
        } // end looping over grid.invaders
    });

    // Animate horizontal movement
    if (keys.h.pressed && player.position.x >= 0) {
        player.velocity.x = -5;
        player.rotation = -0.15;
    } else if (
        keys.l.pressed &&
        player.position.x + player.width <= canvas.width
    ) {
        player.velocity.x = 5;
        player.rotation = 0.15;
    } else {
        player.velocity.x = 0;
        player.rotation = 0;
    }

    // Animate vertical movement
    if (
        keys.j.pressed &&
        player.position.y + player.height + 25 <= canvas.height
    ) {
        player.velocity.y += 0.5;
    } else if (
        keys.k.pressed &&
        player.position.y + player.height >= canvas.height - 100
    ) {
        player.velocity.y += -0.5;
    } else {
        player.velocity.y = 0;
    }

    // spawning enemies
    if (frames % currentDifficulty.spawnRate === 0) {
        console.log(spawnBuffer);
        console.log(currentDifficulty.spawnRate);
        spawnBuffer = spawnBuffer < 0 ? 100 : spawnBuffer;
        grids.push(new Grid());
        randomInterval = Math.floor(Math.random() * 500 + spawnBuffer);
        frames = 0;
        spawnBuffer -= 100;
    }

    if (
        keys.space.pressed &&
        player.powerUp === "MachineGun" &&
        frames % 2 === 0
    )
        projectiles.push(
            new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y,
                },
                velocity: {
                    x: 0,
                    y: -10,
                },
                color: "yellow",
            })
        );

    // Ensure player stays within canvas bounds
    player.position.x = Math.max(0, Math.min(canvas.width - player.width, player.position.x));
    player.position.y = Math.max(0, Math.min(canvas.height - player.height - 20, player.position.y));

    frames++;
}

// Add Movement via Vim Bindings
addEventListener("keydown", ({ key }) => {
    if (game.over) return;
    switch (key) {
        case "h":
            keys.h.pressed = true;
            break;
        case "j":
            keys.j.pressed = true;
            break;
        case "k":
            keys.k.pressed = true;
            break;
        case "l":
            keys.l.pressed = true;
            break;
        case " ":
            keys.space.pressed = true;
            break;
        case "w":
            player.position.x += 100;
            particles.push(...createCommandParticles({
                position: { x: player.position.x, y: player.position.y },
                text: "w"
            }));
            break;
        case "b":
            player.position.x -= 100;
            particles.push(...createCommandParticles({
                position: { x: player.position.x, y: player.position.y },
                text: "b"
            }));
            break;
        case "0":
            player.position.x = 0;
            particles.push(...createCommandParticles({
                position: { x: player.position.x, y: player.position.y },
                text: "0"
            }));
            break;
        case "$":
            player.position.x = canvas.width - player.width;
            particles.push(...createCommandParticles({
                position: { x: player.position.x, y: player.position.y },
                text: "$"
            }));
            break;
        case "g":
            if (keys.g) {
                // Move to top of play area (100px from bottom)
                player.position.y = canvas.height - player.height - 100;
                particles.push(...createCommandParticles({
                    position: { x: player.position.x, y: player.position.y },
                    text: "gg"
                }));
                keys.g = false;
            } else {
                keys.g = true;
                setTimeout(() => {
                    keys.g = false;
                }, 300);
            }
            break;
        case "G":
            // Move to bottom
            player.position.y = canvas.height - player.height - 20;
            particles.push(...createCommandParticles({
                position: { x: player.position.x, y: player.position.y },
                text: "G"
            }));
            break;
    }
});

addEventListener("keyup", ({ key }) => {
    switch (key) {
        case "h":
            keys.h.pressed = false;
            break;
        case "j":
            keys.j.pressed = false;
            break;
        case "k":
            keys.k.pressed = false;
            break;
        case "l":
            keys.l.pressed = false;
            break;
        case " ":
            keys.space.pressed = false;
            if (player.powerUp === "MachineGun") return;
            projectiles.push(
                new Projectile({
                    position: {
                        x: player.position.x + player.width / 2,
                        y: player.position.y,
                    },
                    velocity: {
                        x: 0,
                        y: -10,
                    },
                })
            );
            playSound('shoot');
            break;
    }
});

// create command particles
function createCommandParticles({ position, text }) {
    playSound('command');
    const particles = [];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
    
    for (let i = 0; i < 15; i++) {
        particles.push(
            new Particle({
                position: {
                    x: position.x + Math.random() * 20,
                    y: position.y + Math.random() * 20
                },
                velocity: {
                    x: (Math.random() - 0.5) * 4,
                    y: (Math.random() - 0.5) * 4
                },
                radius: Math.random() * 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                fades: true
            })
        );
    }
    
    // Create text label for the command
    const commandLabel = document.createElement("label");
    commandLabel.innerHTML = text;
    commandLabel.style.position = "absolute";
    commandLabel.style.color = "yellow";
    commandLabel.style.top = position.y + "px";
    commandLabel.style.left = position.x + "px";
    commandLabel.style.userSelect = "none";
    commandLabel.style.fontSize = "24px";
    document.querySelector("#parentDiv").appendChild(commandLabel);

    gsap.to(commandLabel, {
        opacity: 0,
        y: -30,
        duration: 0.75,
        onComplete: () => {
            document.querySelector("#parentDiv").removeChild(commandLabel);
        },
    });

    return particles;
}

let currentMenuIndex = 0;
const menuItems = document.querySelectorAll('.menu-item');
const instructionsContainer = document.querySelector('.instructions-container');
const backButton = document.querySelector('.back-button');

function updateMenuSelection() {
    menuItems.forEach((item, index) => {
        item.classList.toggle('selected', index === currentMenuIndex);
    });
}

function handleMenuAction(action) {
    console.log('Handling menu action:', action);
    switch(action) {
        case 'start':
            console.log('Starting game');
            document.querySelector('#start').style.display = 'none';
            document.querySelector('#score').style.display = 'block';
            audio.background.play();
            init();
            animate();
            break;
        case 'difficulty':
            cycleDifficulty();
            break;
        case 'instructions':
            console.log('Showing instructions');
            instructionsContainer?.classList.remove('hidden');
            break;
    }
}

// Update handleKeyNavigation function
function handleKeyNavigation(e) {
    console.log('Key pressed:', e.key);
    if (document.querySelector('#start').style.display === 'none') return;
    
    // Handle Escape key first, regardless of instructions visibility
    if (e.key === 'Escape' || e.key === 'h') {
        if (!instructionsContainer?.classList.contains('hidden')) {
            instructionsContainer?.classList.add('hidden');
            return;
        }
    }
    
    // Only handle menu navigation if instructions are hidden
    if (instructionsContainer?.classList.contains('hidden')) {
        switch(e.key) {
            case 'ArrowUp':
            case 'k':
                console.log('Moving selection up');
                currentMenuIndex = Math.max(0, currentMenuIndex - 1);
                updateMenuSelection();
                break;
            case 'ArrowDown':
            case 'j':
                console.log('Moving selection down');
                currentMenuIndex = Math.min(menuItems.length - 1, currentMenuIndex + 1);
                updateMenuSelection();
                break;
            case 'Enter':
            case 'l':
                console.log('Enter pressed on item:', currentMenuIndex);
                const selectedItem = menuItems[currentMenuIndex];
                if (selectedItem) handleMenuAction(selectedItem.dataset.action);
                break;
        }
    }
}

// Update initializeMenuHandlers to properly handle click events
function initializeMenuHandlers() {
    console.log('Initializing menu handlers');
    console.log('Menu items found:', menuItems?.length);
    
    menuItems?.forEach((item, index) => {
        console.log('Adding click handler to item:', index, item.dataset.action);
        item.addEventListener('click', () => {
            currentMenuIndex = index; // Update the current index when clicking
            updateMenuSelection(); // Update the visual selection
            console.log('Menu item clicked:', item.dataset.action);
            handleMenuAction(item.dataset.action);
        });
    });

    console.log('Back button found:', backButton !== null);
    backButton?.addEventListener('click', () => {
        console.log('Back button clicked');
        instructionsContainer?.classList.add('hidden');
    });

    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyNavigation);
}

// Add restart functionality to the game over screen
document.querySelector('#restart-btn')?.addEventListener('click', () => {
    document.querySelector('#gameOver').style.display = 'none';
    document.querySelector('#score').style.display = 'block';
    init();
    animate();
});

// Initialize menu handlers
document.addEventListener('DOMContentLoaded', () => {
    console.log('Starting menu initialization');
    initializeMenuHandlers();
});

// Add difficulty settings
const DIFFICULTY_SETTINGS = {
    EASY: {
        name: 'Easy',
        spawnRate: 700,
        invaderSpeed: 1,
        projectileSpeed: 2,
        powerUpFrequency: 500,
        score_multiplier: 1,
        highScore: localStorage.getItem('invaderVimHighScore_easy') || 0
    },
    NORMAL: {
        name: 'Normal',
        spawnRate: 500,
        invaderSpeed: 1.25,
        projectileSpeed: 3,
        powerUpFrequency: 750,
        score_multiplier: 2,
        highScore: localStorage.getItem('invaderVimHighScore_normal') || 0
    },
    HARD: {
        name: 'Hard',
        spawnRate: 300,
        invaderSpeed: 1.5,
        projectileSpeed: 4,
        powerUpFrequency: 1000,
        score_multiplier: 3,
        highScore: localStorage.getItem('invaderVimHighScore_hard') || 0
    },
    VIM_MASTER: {
        name: 'Vim Master',
        spawnRate: 200,
        invaderSpeed: 4,
        projectileSpeed: 8,
        powerUpFrequency: 1500,
        score_multiplier: 5,
        highScore: localStorage.getItem('invaderVimHighScore_vim_master') || 0
    }
};

let currentDifficulty = DIFFICULTY_SETTINGS.NORMAL;

// Add power-up types
const POWER_UPS = {
    MACHINE_GUN: {
        name: 'Machine Gun',
        color: 'yellow',
        duration: 2000,
        effect: (player) => {
            player.powerUp = 'MachineGun';
        }
    },
    SHIELD: {
        name: 'Shield',
        color: 'blue',
        duration: 5000,
        effect: (player) => {
            player.shielded = true;
        }
    },
    SPEED_BOOST: {
        name: 'Speed Boost',
        color: 'green',
        duration: 3000,
        effect: (player) => {
            player.speedMultiplier = 2;
        }
    }
};

// Add difficulty cycling
function cycleDifficulty() {
    const difficulties = Object.values(DIFFICULTY_SETTINGS);
    const currentIndex = difficulties.findIndex(d => d.name === currentDifficulty.name);
    const nextIndex = (currentIndex + 1) % difficulties.length;
    currentDifficulty = difficulties[nextIndex];
    document.querySelector('#difficulty-level').textContent = currentDifficulty.name;
    
    // Update high score display for the selected difficulty
    highScore = currentDifficulty.highScore;
    highScoreVal.innerHTML = highScore;

    // Reset game with new difficulty if we're already playing
    if (document.querySelector('#score').style.display === 'block') {
        init();
        animate();
    }
}

// Update the game over screen handlers
let gameOverMenuIndex = 0;
const gameOverItems = document.querySelectorAll('#gameOver .menu-item');

function updateGameOverSelection() {
    gameOverItems.forEach((item, index) => {
        item.classList.toggle('selected', index === gameOverMenuIndex);
    });
}

function handleGameOverAction(action) {
    switch(action) {
        case 'restart':
            document.querySelector('#gameOver').style.display = 'none';
            document.querySelector('#score').style.display = 'block';
            init();
            animate();
            break;
        case 'menu':
            document.querySelector('#gameOver').style.display = 'none';
            document.querySelector('#start').style.display = 'flex';
            document.querySelector('#score').style.display = 'none';
            break;
    }
}

// Add keyboard navigation for game over screen
addEventListener('keydown', (e) => {
    if (document.querySelector('#gameOver').style.display !== 'flex') return;

    switch(e.key) {
        case 'ArrowUp':
        case 'k':
            gameOverMenuIndex = Math.max(0, gameOverMenuIndex - 1);
            updateGameOverSelection();
            break;
        case 'ArrowDown':
        case 'j':
            gameOverMenuIndex = Math.min(gameOverItems.length - 1, gameOverMenuIndex + 1);
            updateGameOverSelection();
            break;
        case 'Enter':
        case 'l':
            const selectedItem = gameOverItems[gameOverMenuIndex];
            if (selectedItem) handleGameOverAction(selectedItem.dataset.action);
            break;
    }
});

// Add click handlers for game over menu
gameOverItems?.forEach(item => {
    item.addEventListener('click', () => {
        handleGameOverAction(item.dataset.action);
    });
});

document.querySelector('#restart-btn')?.removeEventListener('click', () => {});

// Add this function to handle level progression
function checkLevelProgression() {
    if (enemiesDefeatedInLevel >= enemiesRequiredForNextLevel) {
        currentLevel++;
        enemiesDefeatedInLevel = 0;
        enemiesRequiredForNextLevel = Math.floor(enemiesRequiredForNextLevel * 1.5);
        
        document.querySelector('#levelVal').innerHTML = currentLevel;
        showLevelUpMessage();
        
        // Increase game difficulty with each level
        spawnBuffer = Math.max(100, spawnBuffer - 50);
        
        // Update the current difficulty settings
        currentDifficulty = {
            ...currentDifficulty,
            spawnRate: Math.max(100, currentDifficulty.spawnRate - 50),
            invaderSpeed: currentDifficulty.invaderSpeed * 1.1,
            projectileSpeed: currentDifficulty.projectileSpeed * 1.1,
            score_multiplier: currentDifficulty.score_multiplier + 0.5
        };

        // Update existing grids with new speed
        grids.forEach(grid => {
            grid.velocity.x = grid.velocity.x > 0 
                ? currentDifficulty.invaderSpeed 
                : -currentDifficulty.invaderSpeed;
        });
    }
}

// Add a level up message function
function showLevelUpMessage() {
    const levelUpLabel = document.createElement("div");
    levelUpLabel.innerHTML = `Level ${currentLevel}!`;
    levelUpLabel.style.position = "absolute";
    levelUpLabel.style.color = "#00ff00";
    levelUpLabel.style.top = "50%";
    levelUpLabel.style.left = "50%";
    levelUpLabel.style.transform = "translate(-50%, -50%)";
    levelUpLabel.style.fontSize = "48px";
    levelUpLabel.style.fontFamily = "monospace";
    levelUpLabel.style.textShadow = "0 0 10px #00ff00";
    levelUpLabel.style.zIndex = "1000";
    document.querySelector("#parentDiv").appendChild(levelUpLabel);

    gsap.to(levelUpLabel, {
        opacity: 0,
        y: -100,
        duration: 1.5,
        onComplete: () => {
            document.querySelector("#parentDiv").removeChild(levelUpLabel);
        },
    });
}