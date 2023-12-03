// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", function () {

    // Declaración de variables relacionadas con el tablero
    let board;
    let boardWidth = 500;
    let boardHeight = 500;
    let context;

    // Declaración de variables relacionadas con el jugador
    let playerWidth = 80; // 500 para pruebas, 80 normal
    let playerHeight = 10;
    let playerVelocityX = 20; // Mueve 10 píxeles cada vez

    let player = {
        x: boardWidth / 2 - playerWidth / 2,
        y: boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX: playerVelocityX
    }

    // Declaración de variables relacionadas con la pelota
    let ballWidth = 10;
    let ballHeight = 10;
    let ballVelocityX = 3; // 15 para pruebas, 3 normal
    let ballVelocityY = 3; // 10 para pruebas, 2 normal

    let ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: ballVelocityX,
        velocityY: ballVelocityY
    }

    // Declaración de variables relacionadas con los bloques
    let blockArray = [];
    let blockWidth = 50;
    let blockHeight = 10;
    let blockColumns = 8;
    let blockRows = 3; // Agregar más a medida que avanza el juego
    let blockMaxRows = 10; // Límite de filas
    let blockCount = 0;

    // Posición inicial de las esquinas de los bloques en la parte superior izquierda
    let blockX = 15;
    let blockY = 45;

    let score = 0;
    let gameOver = false;

    // Acciones a realizar cuando la ventana ha terminado de cargar
    window.onload = function () {
        board = document.getElementById("board");
        board.height = boardHeight;
        board.width = boardWidth;
        context = board.getContext("2d"); // Se utiliza para dibujar en el tablero

        // Dibuja al jugador inicialmente
        context.fillStyle = "brown";
        context.fillRect(player.x, player.y, player.width, player.height);

        // Solicita la animación de actualización
        requestAnimationFrame(update);

        // Escucha el evento de tecla presionada para mover al jugador
        document.addEventListener("keydown", movePlayer);

        // Crea los bloques
        createBlocks();
    }

    // Función para actualizar el tablero y los elementos del juego
    function update() {
        requestAnimationFrame(update);
        // Detiene el dibujo si el juego ha terminado
        if (gameOver) {
            return;
        }
        context.clearRect(0, 0, board.width, board.height);

        // Jugador
        context.fillStyle = "yellow";
        context.fillRect(player.x, player.y, player.width, player.height);

        // Pelota
        context.fillStyle = "lightgreen";
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
        context.fillRect(ball.x, ball.y, ball.width, ball.height);

        // Rebota la pelota en la barra del jugador
        if (topCollision(ball, player) || bottomCollision(ball, player)) {
            ball.velocityY *= -1;   // Invierte la dirección en el eje Y (arriba o abajo)
        } else if (leftCollision(ball, player) || rightCollision(ball, player)) {
            ball.velocityX *= -1;   // Invierte la dirección en el eje X (izquierda o derecha)
        }

        if (ball.y <= 0) {
            // Si la pelota toca la parte superior del lienzo
            ball.velocityY *= -1; // Invierte la dirección
        } else if (ball.x <= 0 || (ball.x + ball.width >= boardWidth)) {
            // Si la pelota toca los lados izquierdo o derecho del lienzo
            ball.velocityX *= -1; // Invierte la dirección
        } else if (ball.y + ball.height >= boardHeight) {
            // Si la pelota toca la parte inferior del lienzo
            context.font = "Arial";
            context.fillText("¡Has perdido!", 190, 300);
            context.fillText("Teclee espacio y vuelve a empezar", 100, 350);
            gameOver = true;
        }

        // Bloques
        context.fillStyle = "brown";
        for (let i = 0; i < blockArray.length; i++) {
            let block = blockArray[i];
            if (!block.break) {
                if (topCollision(ball, block) || bottomCollision(ball, block)) {
                    block.break = true;     // El bloque está roto
                    ball.velocityY *= -1;   // Invierte la dirección en el eje Y (arriba o abajo)
                    score += 100;
                    blockCount -= 1;
                } else if (leftCollision(ball, block) || rightCollision(ball, block)) {
                    block.break = true;     // El bloque está roto
                    ball.velocityX *= -1;   // Invierte la dirección en el eje X (izquierda o derecha)
                    score += 100;
                    blockCount -= 1;
                }
                context.fillRect(block.x, block.y, block.width, block.height);
            }
        }

        // Próximo nivel
        if (blockCount == 0) {
           
            blockRows = Math.min(blockRows + 1, blockMaxRows);
            createBlocks();
        }

        // Puntuación
        context.font = "20px sans-serif";
        context.fillText(score, 10, 25);
    }

    // Función para verificar si la posición está fuera de los límites del tablero
    function outOfBounds(xPosition) {
        return (xPosition < 0 || xPosition + playerWidth > boardWidth);
    }

    // Función para mover al jugador en respuesta a eventos de teclado
    function movePlayer(e) {
        if (gameOver) {
            if (e.code == "Space") {
                resetGame();
                console.log("RESET");
            }
            return;
        }
        if (e.code == "ArrowLeft") {
            let nextplayerX = player.x - player.velocityX;
            if (!outOfBounds(nextplayerX)) {
                player.x = nextplayerX;
            }
        } else if (e.code == "ArrowRight") {
            let nextplayerX = player.x + player.velocityX;
            if (!outOfBounds(nextplayerX)) {
                player.x = nextplayerX;
            }
        }
    }

    // Función para detectar colisiones entre dos elementos
    function detectCollision(a, b) {
        return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
    }

    // Funciones específicas de colisión con lados particulares
    function topCollision(ball, block) {
        return detectCollision(ball, block) && (ball.y + ball.height) >= block.y;
    }

    function bottomCollision(ball, block) {
        return detectCollision(ball, block) && (block.y + block.height) >= ball.y;
    }

    function leftCollision(ball, block) {
        return detectCollision(ball, block) && (ball.x + ball.width) >= block.x;
    }

    function rightCollision(ball, block) {
        return detectCollision(ball, block) && (block.x + block.width) >= ball.x;
    }

    // Función para crear los bloques en el tablero
    function createBlocks() {
        blockArray = []; // Limpia el array de bloques
        for (let c = 0; c < blockColumns; c++) {
            for (let r = 0; r < blockRows; r++) {
                let block = {
                    x: blockX + c * blockWidth + c * 10, // Espaciado de 10 píxeles entre columnas
                    y: blockY + r * blockHeight + r * 10, // Espaciado de 10 píxeles entre filas
                    width: blockWidth,
                    height: blockHeight,
                    break: false
                }
                blockArray.push(block);
            }
        }
        blockCount = blockArray.length;
    }

    // Función para reiniciar el juego
    function resetGame() {
        gameOver = false;
        player = {
            x: boardWidth / 2 - playerWidth / 2,
            y: boardHeight - playerHeight - 5,
            width: playerWidth,
            height: playerHeight,
            velocityX: playerVelocityX
        }
        ball = {
            x: boardWidth / 2,
            y: boardHeight / 2,
            width: ballWidth,
            height: ballHeight,
            velocityX: ballVelocityX,
            velocityY: ballVelocityY
        }
        blockArray = [];
        blockRows = 3;
        score = 0;
        createBlocks();
    }
});
