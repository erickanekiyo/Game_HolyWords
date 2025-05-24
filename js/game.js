const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const input = document.getElementById("textInput");

let words = ["salvation", "light", "hope", "cross", "prayer", "holy"];
let enemy = null;
let score = 0;

//Objeto do inimigo com palavra aleatoria
function newEnemy() {
    const word = words[Math.floor(Math.random() * words.length)];
    return {
        word: word,
        size: 20,               //Tamanho inicial do inimigo
        x: canvas.width / 2,    //Localização de spawn
        y: canvas.height / 2,
        alive: true,
        progress: 0,            //Letras digitadas corretamente
        error: false            //Sinalizar ter errado a escrita
    };
}

//Gera o inimigo na tela
function drawEnemy(enemy) {
    if (!enemy.alive) return;

    ctx.fillStyle = "red";
    ctx.beginPath();
    //Quadrado representando o inimigo
    ctx.rect(enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.size, enemy.size);
    ctx.fill();

    //Palavra acima do inimigo
    ctx.fillStyle = enemy.error ? "red" : "white";  //Muda a cor do texto caso erre
    ctx.font = `${enemy.size}px Arial`;
    ctx.textAlign = "center";
    //Mostrar o texto que falta digitar
    const textShow = enemy.word.slice(enemy.progress); 
    ctx.fillText(textShow, enemy.x, enemy.y - enemy.size);
}

//Animação (frames)
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //Limpa o canvas

    if (enemy && enemy.alive) {
        drawEnemy(enemy);
        enemy.size += 0.5; //"Aproximação" do inimigo (efeito zoom)

        //Condição de Derrota
        if (enemy.size > 200) {
            alert("Voce foi possuido! Pontuacao: " + score);
            enemy = null;
            score = 0;
            input.value = "";
            return;
        }
    }

    requestAnimationFrame(updateGame); //Geração de loop
}

//Mecanica de escrita
input.addEventListener("input", () => {
    //Se morto inimigo, retorna
    if (!enemy || !enemy.alive) return;
    
    //Pega o valor atual digitado pelo jogador para comparação de localização
    const value = input.value;
  
    
    const expectedChar = enemy.word[enemy.progress];    //Letra esperada a ser escrita
    const typedChar = value[value.length - 1];          //Ultima letra digitada

    //Verificação se está correto o caractere
    if (typedChar === expectedChar) {
        enemy.progress++;
        enemy.error = false;

        //Verificação para morte do inimigo
        if (enemy.progress === enemy.word.length) {
            enemy.alive = false;
            score++;
            input.value = "";
            setTimeout(() => {      //Temporizador para geração de inimigo atualmente
                enemy = newEnemy();
            }, 1000);
        }
    } else {
        //Trava input(não aceita mais letras), pisca e espera backspace
        enemy.error = true;
    }
});

//Mecanica quando erra uma escrita
input.addEventListener("keydown", (e) => {
    if (!enemy || !enemy.alive) return;
  
    if (enemy.error) {
        //Permitir apagar e resetar
        if (e.key === "Backspace") {
            enemy.error = false;
            enemy.progress = 0;
            input.value = "";
        } else {
            //Bloqueia outras teclas
            e.preventDefault();
        }
    }
});


//Quando o jogador clica em "Iniciar Jogo"
startButton.addEventListener("click", () => {
    input.focus();            //Faz iniciar com caixa de texto ativada
    enemy = newEnemy();       //Cria o primeiro inimigo
    updateGame();             //Inicia o loop do jogo
});
