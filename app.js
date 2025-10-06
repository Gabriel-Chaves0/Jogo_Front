class UltimateTicTacToe {
    constructor() {
        this.names = this.getPlayerNames();
        this.currentPlayer = 'X';
        this.bigBoard = Array(9).fill(null);
        this.smallBoards = Array(9).fill(null).map(() => Array(9).fill(null));
        this.activeBoard = null;
        this.gameWon = false;
        this.moveCounts = { X: Array(9).fill(0), O: Array(9).fill(0) };
        this.initializeGame();
    }

    
getPlayerNames() {
    const x = localStorage.getItem('playerXName') || 'Jogador X';
    const o = localStorage.getItem('playerOName') || 'Jogador O';
    return { x, o };
}


    
    renderStats(finalWinner) {
        const statsUl = document.getElementById('moveStats');
        const post = document.getElementById('postGame');
        const wline = document.getElementById('winnerLine');
        if (!statsUl || !post) return;

        // Limpa lista
        statsUl.innerHTML = '';

        // Cabeçalho do vencedor
        const names = this.names || { x: 'Jogador X', o: 'Jogador O' };
        const winnerText = (finalWinner === 'DRAW')
            ? '🤝 Empate geral'
            : `🏆 Vencedor: ${finalWinner === 'X' ? names.x : names.o} (${finalWinner})`;
        if (wline) wline.textContent = winnerText;

        // Gera itens 1..9
        for (let i = 0; i < 9; i++) {
            const li = document.createElement('li');
            li.className = 'stats-item';
            const xCount = this.moveCounts['X'][i];
            const oCount = this.moveCounts['O'][i];
            li.textContent = `Sub-tabuleiro ${i+1}: X = ${xCount}, O = ${oCount}`;
            statsUl.appendChild(li);
        }

        // Mostra bloco
        post.hidden = false;
    }


    initMoveTable() {
        const tbody = document.querySelector('#moveTable tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const tr = document.createElement('tr');
            tr.setAttribute('data-index', String(i));
            const tdIdx = document.createElement('td');
            tdIdx.textContent = String(i + 1);
            const tdX = document.createElement('td');
            tdX.className = 'cell-x';
            tdX.textContent = '0';
            const tdO = document.createElement('td');
            tdO.className = 'cell-o';
            tdO.textContent = '0';
            tr.appendChild(tdIdx);
            tr.appendChild(tdX);
            tr.appendChild(tdO);
            tbody.appendChild(tr);
        }
    }

    updateMoveTableCell(boardIndex) {
        const row = document.querySelector(`#moveTable tbody tr[data-index="${boardIndex}"]`);
        if (!row) return;
        const tdX = row.querySelector('.cell-x');
        const tdO = row.querySelector('.cell-o');
        if (tdX) tdX.textContent = String(this.moveCounts['X'][boardIndex]);
        if (tdO) tdO.textContent = String(this.moveCounts['O'][boardIndex]);
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

        // contabiliza jogada no sub-tabuleiro
        this.moveCounts[this.currentPlayer][boardIndex]++;
        // atualiza a tabela dinâmica
        this.updateMoveTableCell(boardIndex);

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
            this.renderStats(gameWinner);
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
    const post = document.getElementById('postGame');
    if (post) post.hidden = true;
    const statsUl = document.getElementById('moveStats');
    if (statsUl) statsUl.innerHTML = '';
    startGame();
    if (game && game.initMoveTable) { game.initMoveTable(); }
    if (game && game.initMoveTable) { game.initMoveTable(); }
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
    if (game && game.initMoveTable) { game.initMoveTable(); }
    if (game && game.initMoveTable) { game.initMoveTable(); }
const inline = document.getElementById('playersInline');
if (inline) {
    inline.innerHTML = `<div class="pill">X — ${game.names.x}</div><div class="pill">O — ${game.names.o}</div>`;
}

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetGame);
    }
});
