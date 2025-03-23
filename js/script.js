document.addEventListener('DOMContentLoaded', () => {
    // 游戏常量
    const ROWS = 9;
    const COLS = 9;
    const MINES = 10;
    
    // 游戏变量
    let board = [];
    let gameOver = false;
    let minesLeft = MINES;
    let revealedCells = 0;
    let timerInterval;
    let seconds = 0;
    
    // DOM元素
    const gameBoard = document.getElementById('game-board');
    const minesCounter = document.getElementById('mines-count');
    const timerDisplay = document.getElementById('timer');
    const resetButton = document.getElementById('reset-btn');
    const gameStatus = document.getElementById('game-status');
    
    // 初始化游戏
    initGame();
    
    // 重置按钮事件监听
    resetButton.addEventListener('click', initGame);
    
    // 初始化游戏函数
    function initGame() {
        // 清除计时器
        clearInterval(timerInterval);
        seconds = 0;
        timerDisplay.textContent = seconds;
        
        // 重置游戏变量
        gameOver = false;
        minesLeft = MINES;
        revealedCells = 0;
        minesCounter.textContent = minesLeft;
        gameStatus.textContent = '';
        
        // 清空游戏板
        gameBoard.innerHTML = '';
        
        // 创建新的游戏板
        createBoard();
        
        // 放置地雷
        placeMines();
        
        // 计算周围地雷数
        calculateNumbers();
        
        // 渲染游戏板
        renderBoard();
    }
    
    // 创建游戏板
    function createBoard() {
        board = [];
        for (let i = 0; i < ROWS; i++) {
            const row = [];
            for (let j = 0; j < COLS; j++) {
                row.push({
                    row: i,
                    col: j,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0,
                });
            }
            board.push(row);
        }
    }
    
    // 放置地雷
    function placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < MINES) {
            const row = Math.floor(Math.random() * ROWS);
            const col = Math.floor(Math.random() * COLS);
            
            if (!board[row][col].isMine) {
                board[row][col].isMine = true;
                minesPlaced++;
            }
        }
    }
    
    // 计算周围地雷数
    function calculateNumbers() {
        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                if (board[i][j].isMine) continue;
                
                // 计算周围地雷数量
                let count = 0;
                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        if (di === 0 && dj === 0) continue;
                        
                        const ni = i + di;
                        const nj = j + dj;
                        
                        if (ni >= 0 && ni < ROWS && nj >= 0 && nj < COLS && board[ni][nj].isMine) {
                            count++;
                        }
                    }
                }
                
                board[i][j].neighborMines = count;
            }
        }
    }
    
    // 渲染游戏板
    function renderBoard() {
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                // 鼠标左键点击事件
                cell.addEventListener('click', () => {
                    if (gameOver || board[i][j].isRevealed || board[i][j].isFlagged) return;
                    
                    // 第一次点击开始计时
                    if (revealedCells === 0) {
                        startTimer();
                    }
                    
                    // 揭示格子
                    revealCell(i, j);
                });
                
                // 鼠标右键标记事件
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    
                    if (gameOver || board[i][j].isRevealed) return;
                    
                    // 第一次操作开始计时
                    if (revealedCells === 0) {
                        startTimer();
                    }
                    
                    // 标记/取消标记格子
                    toggleFlag(i, j);
                });
                
                gameBoard.appendChild(cell);
            }
        }
    }
    
    // 揭示格子
    function revealCell(row, col) {
        if (board[row][col].isRevealed || board[row][col].isFlagged) return;
        
        board[row][col].isRevealed = true;
        revealedCells++;
        
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('revealed');
        
        // 如果是地雷，游戏结束
        if (board[row][col].isMine) {
            cell.classList.add('mine');
            endGame(false);
            return;
        }
        
        // 如果周围有地雷，显示数字
        if (board[row][col].neighborMines > 0) {
            cell.textContent = board[row][col].neighborMines;
            cell.dataset.number = board[row][col].neighborMines;
        } else {
            // 如果周围没有地雷，递归揭示相邻的格子
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    if (di === 0 && dj === 0) continue;
                    
                    const ni = row + di;
                    const nj = col + dj;
                    
                    if (ni >= 0 && ni < ROWS && nj >= 0 && nj < COLS) {
                        revealCell(ni, nj);
                    }
                }
            }
        }
        
        // 检查是否胜利
        checkWin();
    }
    
    // 标记/取消标记格子
    function toggleFlag(row, col) {
        if (board[row][col].isRevealed) return;
        
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        
        // 如果已标记，则取消标记
        if (board[row][col].isFlagged) {
            board[row][col].isFlagged = false;
            cell.classList.remove('flagged');
            minesLeft++;
        } else {
            // 如果未标记且还有旗子可用，则标记
            if (minesLeft > 0) {
                board[row][col].isFlagged = true;
                cell.classList.add('flagged');
                minesLeft--;
            }
        }
        
        // 更新计数器
        minesCounter.textContent = minesLeft;
        
        // 检查是否胜利
        checkWin();
    }
    
    // 检查是否胜利
    function checkWin() {
        // 胜利条件：所有非地雷格子都已揭示
        const totalCells = ROWS * COLS;
        if (revealedCells === totalCells - MINES) {
            endGame(true);
        }
    }
    
    // 结束游戏
    function endGame(isWin) {
        gameOver = true;
        clearInterval(timerInterval);
        
        if (isWin) {
            gameStatus.textContent = '恭喜你赢了！';
            gameStatus.style.color = 'green';
            
            // 标记所有地雷
            for (let i = 0; i < ROWS; i++) {
                for (let j = 0; j < COLS; j++) {
                    if (board[i][j].isMine && !board[i][j].isFlagged) {
                        const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                        cell.classList.add('flagged');
                    }
                }
            }
        } else {
            gameStatus.textContent = '游戏结束！';
            gameStatus.style.color = 'red';
            
            // 显示所有地雷
            for (let i = 0; i < ROWS; i++) {
                for (let j = 0; j < COLS; j++) {
                    if (board[i][j].isMine) {
                        const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                        cell.classList.add('revealed');
                        cell.classList.add('mine');
                    }
                }
            }
        }
    }
    
    // 启动计时器
    function startTimer() {
        timerInterval = setInterval(() => {
            seconds++;
            timerDisplay.textContent = seconds;
        }, 1000);
    }
}); 