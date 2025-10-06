class UltimateTicTacToe {
    constructor() {
        this.names = this.getPlayerNames();
        this.currentPlayer = 'X';
        this.bigBoard = Array(9).fill(null);
        this.smallBoards = Array(9).fill(null).map(() => Array(9).fill(null));
        this.activeBoard = null;
        this.gameWon = false;
        this.initializeGame();
    }

    
getPlayerNames() {
    const x = localStorage.getItem('playerXName') || 'Jogador X';
    const o = localStorage.getItem('playerOName') || 'Jogador O';
    return { x, o };
}


    initializeGame() {
        const bigBoardElement = document.getElementById('bigBoard');
        bigBoardElement.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            const smallBoardDiv = document.createElement('div');
            smallBoardDiv.className = 'small-board';
            smallBoardDiv.id = 'board-' + i;

            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('button');
                cell.className = 'cell';
                cell.id = 'cell-' + i + '-' + j;
                cell.addEventListener('click', () => this.makeMove(i, j));
                smallBoardDiv.appendChild(cell);
            }

            bigBoardElement.appendChild(smallBoardDiv);
        }

        this.updateDisplay();
    }

    makeMove(boardIndex, cellIndex) {
        if (this.gameWon) return;
        if (this.bigBoard[boardIndex] !== null) return;
        if (this.smallBoards[boardIndex][cellIndex] !== null) return;
        if (this.activeBoard !== null && this.activeBoard !== boardIndex) return;

        // Jogada
        this.smallBoards[boardIndex][cellIndex] = this.currentPlayer;
        const cellEl = document.getElementById('cell-' + boardIndex + '-' + cellIndex);
        cellEl.textContent = this.currentPlayer;
        cellEl.classList.add(this.currentPlayer.toLowerCase());

        // Verifica vencedor/empate do small board
        const result = this.checkSmallBoardWinner(boardIndex);
        if (result) {
            this.bigBoard[boardIndex] = result; // 'X', 'O' ou 'DRAW'
            const boardEl = document.getElementById('board-' + boardIndex);
            boardEl.classList.add('won');
            const label = (result === 'DRAW') ? 'X·O' : result;
            boardEl.setAttribute('data-winner', label);

            // Desabilita células do board concluído
            for (let i = 0; i < 9; i++) {
                const c = document.getElementById('cell-' + boardIndex + '-' + i);
                if (c) c.disabled = true;
            }
        }

        // Verifica vencedor do big board (considerando empate como X e O)
        const gameWinner = this.checkBigBoardWinner();
        if (gameWinner) {
            this.gameWon = true;
            this.showWinner(gameWinner);
            return;
        }

        // Define próximo board ativo
        if (this.bigBoard[cellIndex] === null) {
            this.activeBoard = cellIndex;
        } else {
            this.activeBoard = null; // livre
        }

        // Alterna jogador
        this.currentPlayer = (this.currentPlayer === 'X') ? 'O' : 'X';
        this.updateDisplay();
    }

    checkSmallBoardWinner(boardIndex) {
        const board = this.smallBoards[boardIndex];
        const wins = [
            [0,1,2],[3,4,5],[6,7,8], // linhas
            [0,3,6],[1,4,7],[2,5,8], // colunas
            [0,4,8],[2,4,6]          // diagonais
        ];

        for (const [a,b,c] of wins) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a]; // 'X' ou 'O'
            }
        }

        // Empate no small board
        if (board.every(cell => cell !== null)) {
            return 'DRAW'; // Conta para X e O
        }

        return null;
    }

    checkBigBoardWinner() {
        const wins = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];

        // Um padrão vence se TODOS os 3 blocos forem do jogador OU DRAW
        for (const [a,b,c] of wins) {
            for (const player of ['X','O']) {
                const okA = this.bigBoard[a] !== null && (this.bigBoard[a] === player || this.bigBoard[a] === 'DRAW');
                const okB = this.bigBoard[b] !== null && (this.bigBoard[b] === player || this.bigBoard[b] === 'DRAW');
                const okC = this.bigBoard[c] !== null && (this.bigBoard[c] === player || this.bigBoard[c] === 'DRAW');
                if (okA && okB && okC) return player;
            }
        }

        // Sem vencedor; se todos preenchidos, empate geral
        if (this.bigBoard.every(cell => cell !== null)) {
            return 'DRAW';
        }
        return null;
    }

    updateDisplay() {
        const nameEl = document.getElementById('currentPlayerName');
        if (nameEl) {
            const name = (this.currentPlayer === 'X') ? this.names.x : this.names.o;
            nameEl.textContent = name;
        }

        // Clear highlights
        document.querySelectorAll('.small-board').forEach(b => b.classList.remove('active'));

        if (this.activeBoard !== null) {
            document.getElementById('board-' + this.activeBoard).classList.add('active');
        } else {
            for (let i = 0; i < 9; i++) {
                if (this.bigBoard[i] === null) {
                    document.getElementById('board-' + i).classList.add('active');
                }
            }
        }

        // Habilita/Desabilita células
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.getElementById('cell-' + i + '-' + j);
                const canPlay = !this.gameWon &&
                    this.bigBoard[i] === null &&
                    this.smallBoards[i][j] === null &&
                    (this.activeBoard === null || this.activeBoard === i);
                cell.disabled = !canPlay;
            }
        }
    }

    showWinner(winner) {
        const el = document.getElementById('winnerMessage');
        if (winner === 'DRAW') {
            el.innerHTML = '<div class="winner-message winner-draw">🤝 Empate!</div>';
        } else {
            el.innerHTML = '<div class="winner-message">🎉 Jogador ' + winner + ' venceu!</div>';
        }

        document.querySelectorAll('.cell').forEach(c => { c.disabled = true; });
    }
}

let game;
function startGame() { game = new UltimateTicTacToe(); }
function resetGame() {
    const msg = document.getElementById('winnerMessage');
    if (msg) msg.innerHTML = '';
    startGame();
const inline = document.getElementById('playersInline');
if (inline) {
    inline.innerHTML = `<div class="pill">X — ${game.names.x}</div><div class="pill">O — ${game.names.o}</div>`;
}

}

document.addEventListener('DOMContentLoaded', () => {
    const hasNames = localStorage.getItem('playerXName') && localStorage.getItem('playerOName');
    if (!hasNames) {
        // Se não tiver nomes, vai para a tela de configuração
        window.location.replace('config.html');
        return;
    }

    startGame();
const inline = document.getElementById('playersInline');
if (inline) {
    inline.innerHTML = `<div class="pill">X — ${game.names.x}</div><div class="pill">O — ${game.names.o}</div>`;
}

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetGame);
    }
});
