// selects canvas and sets it equal to const canvas
const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight

class Player {
    constructor() {

        // Player Velocity
        this.velocity = {
            x: 0,
            y: 0,
        }

        // Player Orientation
        this.rotation = 0

        // Load Player Image
        const image = new Image()
        image.src = './img/shipFullHealth.png'
        image.onload = () => {
            const scale = 1
            this.image =  image
            this.width = image.width * scale
            this.height = image.height * scale
            // Player Starting Position
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height  - this.height - 20
        }

        }

    }


    draw() {
        // c.fillStyle = 'red'
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)
            
        c.save()
        c.translate(
            player.position.x + player.width / 2, 
            player.position.y + player.height / 2
        )
        c.rotate(this.rotation)

        c.translate(
            -player.position.x - player.width / 2,
            -player.position.y - player.height / 2
        )

        c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y,
            this.width,
            this.height
        )

        c.restore()
    }

    update() {
        if(this.image) {
            this.draw()
            this.position.x += this.velocity.x
            this.position.y += this.velocity.y
        }
    }
        
}

// Create Projectile constructor
class Projectile {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity

        this.radius = 3
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = '#019833'
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Invader {
    constructor({position}) {

        // Invader Velocity
        this.velocity = {
            x: 0,
            y: 0,
        }

        // Invader Orientation
        this.rotation = 0

        // Load Invader Image
        const image = new Image()
        image.src = './img/invader.png'
        image.onload = () => {
            const scale = 0.05
            this.image =  image
            this.width = image.width * scale
            this.height = image.height * scale
            // Invader Starting Position
            this.position = {
                x: position.x,
                y: position.y 
        }

        }

    }

    draw() {
        c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y,
            this.width,
            this.height
        )
    }

    update({velocity}) {
        if(this.image) {
            this.draw()
            this.position.x += velocity.x
            this.position.y += velocity.y
        }
    }
}

// Create grid constructor
class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        },
        this.velocity = {
            x: 3,
            y: 0
        }
        // Create Invader
        this.invaders = []

        const cols = Math.floor(Math.random() * 10 + 5)
        const rows = Math.floor(Math.random() * 5 + 2)

        this.width = cols * 30

        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
            this.invaders.push(new Invader({
                position: {
                    x: x * 30,
                    y: y * 30
                }
            }))
            }
        }

    }
    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.velocity.y = 0

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x
            this.velocity.y = 30
        }
    }
}

// Create player 
const player = new Player()

// Create projectiles
const projectiles = []

// Create grids
const grids = []

// Create Movement Keys
const keys = {
    h: {
        pressed: false
    },
    j: {
        pressed: false
    },
    k: {
        pressed: false
    },
    l: {
        pressed: false
    },
    space: {
        pressed: false
    }
}

let frames = 0
let randomInterval = Math.floor((Math.random() * 500) + 500)

// Create animation loop
function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)

    // animate player
    player.update()


    // animate projectiles
    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                // remove projectiles
                projectiles.splice(index, 1)
            }, 0)
        } else {
            projectile.update()
        }
    })

    grids.forEach(grid => {
        grid.update()
        grid.invaders.forEach(invader => {
            invader.update({velocity: grid.velocity})
        })
    })

    // Animate horizontal movement
    if (keys.h.pressed && player.position.x >= 0) {
        player.velocity.x = -5
        player.rotation = -.15
    } else if (keys.l.pressed && player.position.x + player.width <= canvas.width ) {
        player.velocity.x = 5
        player.rotation = .15
    } else {
        player.velocity.x = 0
        player.rotation = 0
    }

    // Animate vertical movement
    if (keys.j.pressed && player.position.y + player.height + 25 <= canvas.height) {
        player.velocity.y += 0.5
    } else if (keys.k.pressed && player.position.y + player.height >= canvas.height - 100) {
        player.velocity.y += -0.5 
    } else {
        player.velocity.y = 0
    }

    // spawning enemies
    if (frames % randomInterval === 0) {
        grids.push(new Grid())
        frames = 0
        randomInterval = Math.floor((Math.random() * 500) + 500)
    }

    frames++
}


// Run animation loop
animate()

// Add Movement via Vim Bindings
addEventListener('keydown', ({key}) => {
    switch (key) {
        case 'h':
            console.log('left')
            keys.h.pressed = true
            break
        case 'j':
            console.log('down')
            keys.j.pressed = true
            break
        case 'k':
            console.log('up')
            keys.k.pressed = true
            break
        case 'l':
            console.log('right')
            keys.l.pressed = true
            break
        case ' ':
            console.log('space')
            projectiles.push(
            new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y 
                },
                velocity: {
                    x: 0,
                    y: -10
                }
            })
            )
            // keys.space.pressed = true
            // console.log(projectiles)
            break
    }
})



addEventListener('keyup', ({key}) => {
    switch (key) {
        case 'h':
            console.log('left')
            keys.h.pressed = false
            break
        case 'j':
            console.log('down')
            keys.j.pressed = false
            break
        case 'k':
            console.log('up')
            keys.k.pressed = false
            break
        case 'l':
            console.log('right')
            keys.l.pressed = false
            break
        case ' ':
            console.log('space')
            keys.space.pressed = false
            break
    }
})
