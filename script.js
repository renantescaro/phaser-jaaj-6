var teclaEsc
var teclaPulo
var game
var map
var personagem
var stars
var saida
var inimigos
var plataformas
var chao
var cursors
var score = 0
var vida = 100
var scoreText

var config = {
    type: Phaser.CANVAS,
    width: window.innerWidth-10,
    height: window.innerHeight-20,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 250 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

function preload(){
    this.load.image('fundo',             'assets/fundo.jpg')
    this.load.image('inimigo',           'assets/inimigo.png')
    this.load.image('chao',              'assets/chao.png')
    this.load.image('powerUp',           'assets/powerUp.png')
    this.load.image('saida',             'assets/saida.png')
    this.load.image('plataforma',        'assets/plataforma.png')
    this.load.image('plataformaPequena', 'assets/plataformaPequena.png')

    // personagem principal
    this.load.spritesheet('personagem', 'assets/peixe.png', { frameWidth: 220, frameHeight: 98 })
}

function create(){
    // *** Cenário ***

    // fundo
    this.add.image(400,  330, 'fundo')
    this.add.image(1600, 300, 'fundo')
    this.add.image(2800, 330, 'fundo')
    this.add.image(4000, 330, 'fundo')
    this.add.image(5200, 330, 'fundo')

    plataformas = this.physics.add.staticGroup()
    chao = this.physics.add.staticGroup()

    // chão
    plataformas.create(400,  670, 'chao').setScale(1).refreshBody()
    plataformas.create(1100, 670, 'chao').setScale(1).refreshBody()
    plataformas.create(2500, 670, 'chao').setScale(1).refreshBody()
    plataformas.create(3500, 670, 'chao').setScale(1).refreshBody()

    // plataformas
    plataformas.create(600,  545, 'plataforma')
    plataformas.create(1000, 360, 'plataforma')
    plataformas.create(1400, 300, 'plataforma')
    plataformas.create(2050, 400, 'plataforma')
    plataformas.create(2450, 400, 'plataforma')
    plataformas.create(2650, 400, 'plataforma')
    plataformas.create(2850, 400, 'plataforma')
    plataformas.create(3050, 450, 'plataforma')
    plataformas.create(3180, 230, 'plataforma')
    plataformas.create(3580, 230, 'plataforma')

    saida      = this.physics.add.sprite(3580, 170,'saida')
    personagem = this.physics.add.sprite(100, 450, 'personagem')

    // camera
    this.cameras.main.setBounds(0,0,1920*2, 700)
    this.physics.world.setBounds(0,0,1920*2,700)
    this.cameras.main.startFollow(personagem, true, 0.05, 0.05)
    
    personagem.setBounce(0)
    personagem.setCollideWorldBounds(true)
    
    this.physics.add.collider(personagem, plataformas)

    // Animações
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('personagem', { start: -1, end: 3 }),
        frameRate: 10,
        repeat: -1
    })
    
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('personagem', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'personagem', frame: 4 } ],
        frameRate: 20
    })

    teclaEsc  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    teclaPulo = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    cursors   = this.input.keyboard.createCursorKeys()

    // grupo de 30 power ups, a cada 205 px, a partir de 1000 px do inicio de x
    stars = this.physics.add.group({
        key: 'powerUp',
        repeat: 30,
        setXY: { x: 1000, y: 0, stepX: 205 }
    })
    
    inimigos = this.physics.add.group()

    scoreText = this.add.text(100, 100, 'Pontos: 0  Vida: 100', { fontSize: '32px', fill: '#000' })

    // adiciona colisão
    this.physics.add.collider(stars, plataformas)
    this.physics.add.collider(inimigos, plataformas)
    this.physics.add.collider(saida, plataformas)
    
    // quando personagem sobrepor uma estrela, chama o metodo collectStar
    this.physics.add.overlap(personagem, stars, collectStar, null, this)
    this.physics.add.overlap(personagem, inimigos, encostarInimigo, null, this)
    this.physics.add.overlap(personagem, saida, fimFase, null, this)
}

function update(){
    scoreText.x = personagem.x

    if(Phaser.Input.Keyboard.JustDown(teclaEsc)){
        configuracoes()
    }

    if (cursors.left.isDown){
        andarEsquerda()
    }else if (cursors.right.isDown){
        andarDireita()
    }else{
        parar()
    }
    
    if(Phaser.Input.Keyboard.JustDown(teclaPulo)){
        pular()
    }
}

function andarEsquerda(){
    personagem.setVelocityX(-160)
    personagem.anims.play('left', true)
}

function andarDireita(){
    personagem.setVelocityX(160)
    personagem.anims.play('right', true)
}

function parar(){
    personagem.setVelocityX(0)
	personagem.anims.play('turn')
}

function pular(){
    personagem.setVelocityY(-330)
}

// desativa estrela sobreposta pelo personagem
function collectStar (personagem, star){
    star.disableBody(true, true)

    score += 10
    scoreText.setText('Pontos: ' + score + ' Vida: ' + vida)

    var inimigo = inimigos.create(personagem.x+280, 1, 'inimigo')
    inimigo.setBounce(1)
    inimigo.setCollideWorldBounds(true)
    inimigo.setVelocity(Phaser.Math.Between(-1, 100), 300)
}

function encostarInimigo(personagem, inimigo){
    vida -= 1
    scoreText.setText('Pontos: ' + score + ' Vida: ' + vida)

    if(vida <= 0){
        morrer()
    }
}

function fimFase(personagem, saida){
    document.body.style.backgroundColor = '#090'
    document.getElementsByTagName('canvas')[0].style.display = 'none'
    document.getElementById('dvFimFase').style.display = ''
}

// ***************************************************

function iniciarJogo(){
    document.getElementById('dvMenu').style.display = 'none'
    document.body.style.backgroundColor = '#000'
    game = new Phaser.Game(config)
}

function sairJogo(){
    window.location.href = ''
}

function reiniciar(){
    window.location.href = ''
}

function morrer(){
    document.body.style.backgroundColor = '#900'
    document.getElementsByTagName('canvas')[0].style.display = 'none'
    document.getElementById('morte').style.display = ''
}

function configuracoes(){
    let canvas = document.getElementsByTagName('canvas')[0]
    if(canvas.style.display == ''){
        document.getElementById('dvMenu').style.display = 'none'
        document.getElementById('dvMenuConfiguracoes').style.display = ''
        canvas.style.display = 'none';
    }else{
        document.getElementById('dvMenuConfiguracoes').style.display = 'none'
        canvas.style.display = ''
    }
}