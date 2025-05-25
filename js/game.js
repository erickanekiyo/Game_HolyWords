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
    const numWords = Math.floor(Math.random() * 3) + 3; //3 a 5 palavras
    const wordList = [];
    const margin = 200;
    const x = Math.random() * (canvas.width - margin * 2) + margin;

    for (let i = 0; i < numWords; i++) {
        const word = words[Math.floor(Math.random() * words.length)];
        wordList.push(word);
    }

    enemies.push({
        words: wordList,
        currentWord: 0,
        size: 20,       //Tamanho inicial do inimigo
        x: x,           //Localização de spawn
        y: canvas.height / 2,
        alive: true,
        progress: 0,    //Letras digitadas corretamente
        error: false    //Sinalizar ter errado a escrita
    });
}

//Desenha um fundo com cortono para melhor leitura
function drawWordWithBackground(enemy) {
    const fullWord = enemy.words[enemy.currentWord];
    const remaining = fullWord.slice(enemy.progress);
    ctx.font = `${enemy.size}px Arial`;
    ctx.textAlign = "center";
    const textWidth = ctx.measureText(remaining).width;
    const padding = 10;

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";             //Fundo escuro com leve transparencia
    ctx.fillRect(enemy.x - textWidth / 2 - padding / 2, enemy.y - enemy.size * 2, textWidth + padding, enemy.size + padding / 2);

    ctx.fillStyle = enemy.error ? "red" : "white";      //Muda a cor do texto caso erre
    ctx.fillText(remaining, enemy.x, enemy.y - enemy.size);
}

//Gera o inimigo na tela
function drawEnemy(enemy) {
    if (!enemy.alive) return;

    //Quadrado representando o inimigo
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.rect(enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.size, enemy.size);
    ctx.fill();

    //Palavra acima do inimigo
    drawWordWithBackground(enemy);
}

//Animação (frames)
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //Limpa o canvas

    //Ordena a sobreposição    
    enemies.sort((a, b) => a.size - b.size);
    
    for (const enemy of enemies) {
        if (!enemy.alive) continue;  //Se morto continue
        drawEnemy(enemy);
        enemy.size += 0.05;           //"Aproximação" do inimigo (efeito zoom)

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

    //Prioriza inimigos mais próximos
    enemies.sort((a, b) => b.size - a.size);

    for (const enemy of enemies) {
        if (!enemy.alive) continue;

        const currentWord = enemy.words[enemy.currentWord];     //Palavra apresentada
        const expectedChar = currentWord[enemy.progress];       //Letra esperada a ser escrita
        const typedChar = value[value.length - 1];              //Ultima letra digitada

        if (enemy.error) continue;

        //Verificação se está correto o caractere
        if (typedChar === expectedChar) {
            enemy.progress++;
            enemy.error = false;

             //Verificação do progresso da lista de palavras
             if (enemy.progress === currentWord.length) {
                const justCompletedWord = currentWord;
                const newWordIndex = enemy.currentWord + 1;
            
                //Avança o inimigo principal
                enemy.currentWord = newWordIndex;
                enemy.progress = 0;
            
                //Elimina se finalizou
                if (enemy.currentWord >= enemy.words.length) {
                    enemy.alive = false;
                    score++;
                    input.value = "";
            
                    for (let i = 0; i < (Math.random() * (3 - 1) + 1); i++) { //Quantificador para geração de inimigos
                        setTimeout(() => {          //Temporizador para geração de inimigos
                            newEnemy();
                        }, Math.random() * 1000);
                    }
                } else {
                    input.value = "";
                }
            
                //Verifica outros inimigos com mesma palavra ativa
                for (const other of enemies) {  //Nomeação dos inimigos para igualizar na verificação
                    if (
                        other !== enemy &&      //Condição que distingue o focalizado dos outros
                        other.alive &&          //Inimigo estiver vivo
                        !other.error &&         //Condição que evita afetar inimigos possívelmente com erro na digitação
                        other.words[other.currentWord] === justCompletedWord &&     ///Verificação de se realmente são as mesmas palavras
                        other.progress < justCompletedWord.length                   //Condição para ver se ainda precisa avançar a lista
                    ) {
                        other.currentWord = newWordIndex;
                        other.progress = 0;
                        
                        //Condição de morte
                        if (other.currentWord >= other.words.length) {
                            other.alive = false;
                            score++;
                        }
                    }
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
