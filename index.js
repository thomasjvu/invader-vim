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
        c.fillStyle = 'red'
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}


// Create Player 
const player = new Player()

// Create Projectiles
const projectiles = [new Projectile({
    position: {
        x: 300,
        y: 300
    },
    velocity: {
        x: 0,
        y: 0
    }
})]

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

// Create animation loop
function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)

    // animate player
    player.update()

    // animate projectiles
    projectiles.forEach((projectile) => {
        projectile.update()
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
    if (keys.j.pressed && player.position.y + player.height <= canvas.height) {
        player.velocity.y += 0.5
    } else if (keys.k.pressed && player.position.y + player.height >= canvas.height / 2) {
        player.velocity.y += -0.5 
    } else {
        player.velocity.y = 0
    }
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
            keys.space.pressed = true
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
