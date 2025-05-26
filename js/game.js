const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const intro = document.getElementById("intro");
const input = document.getElementById("input");
const startBtn = document.getElementById("startBtn");
const demonSprite = new Image();
demonSprite.src = "img/spt_demon.png";
const backgroundImage = new Image();
backgroundImage.src = "img/background.jpg";

let words = ["salvation", "light", "hope", "cross", "prayer", "holy"];
let enemies = [];
let score = 0;
let currentTarget = null;

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
        size: 80,       //Tamanho inicial do inimigo
        x: x,           //Localização de spawn
        y: canvas.height / 2,
        alive: true,
        progress: 0,    //Letras digitadas corretamente
        error: false,    //Sinalizar ter errado a escrita
        frameY: 0,
        frameTimer: 0,
        frameInterval: 10, // quanto menor, mais rápido anima
        damageState: 0     // 0: normal, 1: machucado, 2: muito, 3: morto
    });
}

//Desenha um fundo com cortono para melhor leitura
function drawWordWithBackground(enemy, isClosest) {
    const fullWord = enemy.words[enemy.currentWord];
    const remaining = fullWord.slice(enemy.progress);
    const fontSize = enemy.size * 0.2;
    ctx.font = `${fontSize}px 'Press Start 2P'`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const paddingX = fontSize * 1.5;  //Padding horizontal proporcional ao fontSize
    const paddingY = fontSize * 1.0;  //Padding vertical proporcional ao fontSize

    const textMetrics = ctx.measureText(remaining);

    //Altura real estimada do texto
    const textHeight = fontSize; //Ajuste empírico
    const textWidth = textMetrics.width;

    const bgX = enemy.x - textWidth / 2 - paddingX / 2;  //Posição X do retângulo
    const bgY = enemy.y - textHeight / 2 - paddingY / 2; //Posição Y do retângulo
    const bgW = textWidth + paddingX;                    //Largura do retângulo
    const bgH = textHeight + paddingY;                   //Altura do retângulo

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(bgX, bgY, bgW, bgH);
    //Desenha borda branca
    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";
    ctx.strokeRect(bgX, bgY, bgW, bgH);

    if (enemy.error) {
        ctx.fillStyle = "red";      //Muda a cor do texto caso erre
    } else if (isClosest) {
        ctx.fillStyle = "yellow";   //Cor diferente para o inimigo mais próximo
    } else {
        ctx.fillStyle = "white";
    }

    ctx.fillText(remaining, enemy.x, enemy.y);
}

//Gera o inimigo na tela
function drawEnemy(enemy, isTarget) {
    if (!enemy.alive && enemy.damageState !== 3) {
        enemy.damageState = 3; //Morto
        enemy.frameY = 0;
    }

    const spriteW = 84;
    const spriteH = 115;
    const scale = enemy.size / 60;

    //Avança quadro da animação
    if (enemy.damageState !== 3) {
        enemy.frameTimer++;
        if (enemy.frameTimer >= enemy.frameInterval) {
            enemy.frameTimer = 0;
            enemy.frameY = (enemy.frameY + 1) % 4;  //4 frames para estados vivos
        }
    } else {
        enemy.frameY = 0;  //Frame fixo para morto
    }

    //Cálculo da posição e tamanho final
    const drawW = spriteW * scale;
    const drawH = spriteH * scale;

    ctx.drawImage(
        demonSprite,
        enemy.damageState * spriteW,     //coluna X
        enemy.frameY * spriteH,          //linha Y
        spriteW, spriteH,
        enemy.x - drawW / 2, enemy.y - drawH / 2,
        drawW, drawH
    );

    //Palavra acima do inimigo
    drawWordWithBackground(enemy, isTarget);
}

//Animação (frames)
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //Limpa o canvas
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    //Score
    ctx.fillStyle = "white";
    ctx.font = "24px 'Press Start 2P'";
    ctx.textAlign = "left";
    ctx.fillText("Pontuação: " + score, 20, 50);

    //Ordena a sobreposição    
    enemies.sort((a, b) => a.size - b.size);

    //Salva qual o inimigo mais próximo  
    let closestEnemy = null;
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].alive) {
            closestEnemy = enemies[i];
            break;
        }
    }
    
    for (const enemy of enemies) {
        if (!enemy.alive) continue;   //Se morto continue
        const isTarget = enemy === currentTarget;
        drawEnemy(enemy, isTarget);
        enemy.size += 0.05;           //"Aproximação" do inimigo (efeito zoom)

        //Condição de Derrota
        if (enemy.size > 200) {
            alert("Você foi possuído! Pontuação: " + score);
            enemies = [];
            score = 0;
            currentTarget = null;
            input.value = "";
            return;
        }
    }
    requestAnimationFrame(updateGame); //Geração de loop
}

//Mecanica de escrita
input.addEventListener("input", () => {
    const value = input.value;                  //Pega o texto que está no input no momento
    if (!value) return;                         //Se não tem nada digitado, não faz nada

    const typedChar = value[value.length - 1];  //Pega o último caractere digitado

    //Se não tiver um focado, procura o inimigo mais proximo com a letra
    if (!currentTarget) {
        //Filtra inimigos vivos, sem erro, que estão na primeira letra da palavra e começam com letra digitada
        const candidates = enemies.filter(e =>
            e.alive &&
            !e.error &&
            e.progress === 0 &&
            e.words[e.currentWord][0] === typedChar
        );

        if (candidates.length > 0) {
            //Ordena os candidatos para pegar o mais próximo (maior tamanho visual)
            candidates.sort((a, b) => b.size - a.size);
            currentTarget = candidates[0];      //Define o inimigo mais próximo como alvo
            currentTarget.progress = 1;         //Marca a primeira letra como já digitada
            input.value = typedChar;            //Mantém no input só a letra digitada (inicia a palavra)
            return;                             //Sai para não continuar o código abaixo
        } else {
            //Se não encontrou nenhum inimigo começando com a letra digitada, limpa o input
            input.value = "";
            return;                            //Sai da função
        }
    }

    //Inicia com um inimigo focado
    const currentWord = currentTarget.words[currentTarget.currentWord];  //Palavra atual do inimigo
    const expectedChar = currentWord[currentTarget.progress];            //Próxima letra esperada para digitar

    //Se digitou letra errada logo no começo da palavra, perde o foco do inimigo
    if (typedChar !== expectedChar && currentTarget.progress === 0) {
        currentTarget = null;                                       //Remove o foco do inimigo
        return;                                                     //Sai para esperar nova digitação
    }

    //Se letra digitada está correta e não está em estado de erro
    if (typedChar === expectedChar && !currentTarget.error) {
        currentTarget.progress++;                                   //Avança o progresso da palavra digitada
        currentTarget.error = false;                                //Remove estado de erro, caso tivesse

        //Se terminou de digitar a palavra atual
        if (currentTarget.progress === currentWord.length) {
            const justCompletedWord = currentWord;                  //Palavra que acabou de ser concluída
            const newWordIndex = currentTarget.currentWord + 1;     //Próxima palavra na lista do inimigo

            // Atualiza estado de dano conforme o número de palavras digitadas
            if (newWordIndex === 1) currentTarget.damageState = 1;
            if (newWordIndex === 3) currentTarget.damageState = 2;

            currentTarget.currentWord = newWordIndex;               //Avança para próxima palavra do inimigo
            currentTarget.progress = 0;                             //Reseta o progresso para a nova palavra

            //Se terminou todas as palavras do inimigo
            if (currentTarget.currentWord >= currentTarget.words.length) {
                currentTarget.alive = false;  //Marca inimigo como morto
                score++;                      //Aumenta a pontuação
                currentTarget = null;         //Remove o foco
                input.value = "";             //Limpa o input para nova palavra

                //Gera de 1 a 2 novos inimigos com delay aleatório
                for (let i = 0; i < (Math.random() * (3 - 1) + 1); i++) {
                    setTimeout(() => {
                        newEnemy();
                    }, Math.random() * 1000);
                }
            } else {
                input.value = "";             //Limpa o input para a próxima palavra do mesmo inimigo
            }

            //Atualiza outros inimigos que têm a mesma palavra concluída
            for (const other of enemies) {
                if (
                    other !== currentTarget &&                     //Não o inimigo atual
                    other.alive &&                                 //Inimigo vivo
                    !other.error &&                                //Sem erro
                    other.words[other.currentWord] === justCompletedWord && //Mesma palavra que a mostrada
                    other.progress < justCompletedWord.length      //Ainda não terminou essa palavra
                ) {
                    other.currentWord = newWordIndex;               //Avança a palavra também
                    other.progress = 0;                             //Reseta progresso

                    // Se terminou todas as palavras do inimigo
                    if (other.currentWord >= other.words.length) {
                        other.alive = false;                        //Mata inimigo
                        score++;
                    }
                }
            }
        }
    } else {
        //Se digitou letra errada no meio da palavra, ativa o estado de erro
        currentTarget.error = true;
    }
});



//Mecanica quando erra uma escrita
input.addEventListener("keydown", (e) => {
    if (currentTarget && currentTarget.error) {
        //Permitir apagar e resetar
        if (e.key === "Backspace") {
            currentTarget.error = false;
            currentTarget.progress = 0;
            currentTarget = null;
            input.value = "";
        } else {
            e.preventDefault();
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
