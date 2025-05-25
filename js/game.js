const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const intro = document.getElementById("intro");
const input = document.getElementById("input");
const startBtn = document.getElementById("startBtn");

let words = ["salvation", "light", "hope", "cross", "prayer", "holy"];
let enemies = [];
let score = 0;

//Objeto do inimigo com palavra aleatoria
function newEnemy() {
    const word = words[Math.floor(Math.random() * words.length)];
    const margin = 50;
    const x = Math.random() * (canvas.width - margin * 2) + margin;

    enemies.push({
        word: word,
        size: 20,       //Tamanho inicial do inimigo
        x: x,           //Localização de spawn
        y: canvas.height / 2,
        alive: true,
        progress: 0,    //Letras digitadas corretamente
        error: false    //Sinalizar ter errado a escrita
    });
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
    
    
    for (const enemy of enemies) {
        if (!enemy.alive) continue;  //Se morto continue
        drawEnemy(enemy);
        enemy.size += 0.2;           //"Aproximação" do inimigo (efeito zoom)

        //Condição de Derrota
        if (enemy.size > 200) {
            alert("Você foi possuído! Pontuação: " + score);
            enemies = [];
            score = 0;
            input.value = "";
            return;
        }
    }
    requestAnimationFrame(updateGame); //Geração de loop
}

//Mecanica de escrita
input.addEventListener("input", () => {
    //Pega o valor atual digitado pelo jogador para comparação de localização
    const value = input.value;
    if (!value) return;

    for (const enemy of enemies) {
        if (!enemy.alive) continue;

        const expectedChar = enemy.word[enemy.progress];//Letra esperada a ser escrita
        const typedChar = value[value.length - 1];//Ultima letra digitada

        if (enemy.error) continue;

        //Verificação se está correto o caractere
        if (typedChar === expectedChar) {
            enemy.progress++;
            enemy.error = false;

            //Verificação para morte do inimigo
            if (enemy.progress === enemy.word.length) {
                enemy.alive = false;
                score++;
                input.value = "";
                
                for (let i = 0; i < (Math.random() * (3 - 1) + 1); i++) {       //Cria inimigos
                    setTimeout(() => {                                          //Temporizador para geração de inimigo
                        newEnemy();
                    }, Math.random() * 1000);
                }
            }
            return; //Só ataca um inimigo por vez
        } else {
            //Trava input(não aceita mais letras), pisca e espera backspace
            enemy.error = true;
            return;
        }
    }
});

//Mecanica quando erra uma escrita
input.addEventListener("keydown", (e) => {
    for (const enemy of enemies) {
        if (!enemy.alive) continue;

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
            return;
        }
    }
});

//Iniciar Jogo
startBtn.addEventListener("click", () => {
    intro.style.display = "none";
    canvas.style.display = "block";         // Mostra o canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    input.focus();                          //Faz iniciar com caixa de texto ativada
    for (let i = 0; i < 3; i++) {           //Cria os primeiros inimigos
        setTimeout(() => {                  //Temporizador para geração de inimigos
            newEnemy();
        }, i * 1000);
    }
    updateGame();                           //Inicia o loop do jogo
});
