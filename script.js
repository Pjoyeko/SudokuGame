// ================================================
// SUDOKU NUSANTARA - JAVASCRIPT
// Game Sudoku dengan Tema Budaya Indonesia
// ================================================

// === GAME STATE ===
let grid = [];
let solution = [];
let selectedCell = null;
let difficulty = 'jawa';
let mode = 'normal';
let timer = 0;
let timerInterval = null;
let hints = 3;
let errors = 0;
let maxErrors = 3;
let isPaused = false;
let gameStarted = false;
let cellNotes = {};

let stats = {
    gamesPlayed: 0,
    gamesWon: 0,
    bestTime: null
};

// === DIFFICULTY SETTINGS (mapping ke tema suku) ===
const difficultySettings = {
    jawa: 41,      // Mudah
    bali: 51,      // Sedang
    betawi: 61,    // Sulit
    minang: 65,    // Ahli
    toraja: 68,    // Master
    papua: 70      // Ekstrem
};

// === CULTURE DATA ===
const cultureData = {
    jawa: {
        name: 'Jawa',
        desc: 'Tanah Kelahiran Batik dan Wayang',
        icon: '🏛️',
        level: 'Mudah'
    },
    bali: {
        name: 'Bali',
        desc: 'Pulau Dewata dengan Seni Tari yang Indah',
        icon: '🕉️',
        level: 'Sedang'
    },
    betawi: {
        name: 'Betawi',
        desc: 'Ibu Kota dengan Ondel-Ondel dan Kerak Telor',
        icon: '🎭',
        level: 'Sulit'
    },
    minang: {
        name: 'Minangkabau',
        desc: 'Negeri Rumah Gadang dan Rendang',
        icon: '🏔️',
        level: 'Ahli'
    },
    toraja: {
        name: 'Toraja',
        desc: 'Tanah dengan Upacara Rambu Solo',
        icon: '🏠',
        level: 'Master'
    },
    papua: {
        name: 'Papua',
        desc: 'Surga Keanekaragaman Hayati Indonesia',
        icon: '🦜',
        level: 'Ekstrem'
    }
};

// === THEME CHANGER ===
const updateCultureTheme = (theme) => {
    // Update body class
    document.body.className = document.body.className
        .replace(/theme-\w+/g, '')
        .trim();
    document.body.classList.add(`theme-${theme}`);
    
    // Update grid class
    const gridEl = document.getElementById('grid');
    if (gridEl) {
        gridEl.className = 'sudoku-grid';
        gridEl.classList.add(`grid-${theme}`);
    }
    
    // Update culture banner
    const culture = cultureData[theme];
    const cultureIconEl = document.getElementById('cultureIcon');
    const cultureNameEl = document.getElementById('cultureName');
    const cultureDescEl = document.getElementById('cultureDesc');
    
    if (cultureIconEl) cultureIconEl.textContent = culture.icon;
    if (cultureNameEl) cultureNameEl.textContent = culture.name;
    if (cultureDescEl) cultureDescEl.textContent = culture.desc;
};

// === MOBILE MENU ===
const toggleMobileMenu = () => {
    const sidebar = document.getElementById('leftSidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (sidebar && overlay) {
        const isShowing = sidebar.classList.contains('show');
        
        if (isShowing) {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
            document.body.style.overflow = '';
        } else {
            sidebar.classList.add('show');
            overlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }
};

const closeMobileMenu = () => {
    const sidebar = document.getElementById('leftSidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }
};

// === STATISTICS ===
const loadStats = () => {
    try {
        const saved = localStorage.getItem('sudoku-nusantara-stats');
        if (saved) {
            stats = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading stats:', e);
    }
    updateStatsDisplay();
};

const saveStats = () => {
    try {
        localStorage.setItem('sudoku-nusantara-stats', JSON.stringify(stats));
    } catch (e) {
        console.error('Error saving stats:', e);
    }
    updateStatsDisplay();
};

const updateStatsDisplay = () => {
    const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
    const bestTimeStr = stats.bestTime ? formatTime(stats.bestTime) : '--:--';
    
    // Desktop stats
    const gamesPlayedEl = document.getElementById('gamesPlayed');
    const gamesWonEl = document.getElementById('gamesWon');
    const bestTimeEl = document.getElementById('bestTime');
    const winRateEl = document.getElementById('winRate');
    
    if (gamesPlayedEl) gamesPlayedEl.textContent = stats.gamesPlayed;
    if (gamesWonEl) gamesWonEl.textContent = stats.gamesWon;
    if (bestTimeEl) bestTimeEl.textContent = bestTimeStr;
    if (winRateEl) winRateEl.textContent = winRate + '%';
    
    // Mobile stats
    const gamesPlayedMobileEl = document.getElementById('gamesPlayedMobile');
    const gamesWonMobileEl = document.getElementById('gamesWonMobile');
    const bestTimeMobileEl = document.getElementById('bestTimeMobile');
    const winRateMobileEl = document.getElementById('winRateMobile');
    
    if (gamesPlayedMobileEl) gamesPlayedMobileEl.textContent = stats.gamesPlayed;
    if (gamesWonMobileEl) gamesWonMobileEl.textContent = stats.gamesWon;
    if (bestTimeMobileEl) bestTimeMobileEl.textContent = bestTimeStr;
    if (winRateMobileEl) winRateMobileEl.textContent = winRate + '%';
};

const resetStats = () => {
    if (confirm('⚠️ Reset semua statistik? Ini tidak bisa dibatalkan!')) {
        stats = { gamesPlayed: 0, gamesWon: 0, bestTime: null };
        localStorage.removeItem('sudoku-nusantara-stats');
        saveStats();
        alert('✅ Statistik berhasil direset!');
    }
};

// === THEME TOGGLE ===
const toggleTheme = () => {
    document.body.classList.toggle('dark');
    const icon = document.body.classList.contains('dark') ? '☀️' : '🌙';
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.textContent = icon;
    });
};

// === DIFFICULTY CHANGE ===
const changeDifficulty = (level) => {
    difficulty = level;
    
    // Update theme
    updateCultureTheme(level);
    
    // Update desktop buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.difficulty === level) {
            btn.classList.add('active');
        }
    });
    
    // Update mobile select
    const mobileSelect = document.getElementById('mobileDifficultySelect');
    if (mobileSelect) {
        mobileSelect.value = level;
    }
    
    // Start new game
    newGame(true);
};

// === MODE TOGGLE ===
const toggleNotes = () => {
    mode = mode === 'normal' ? 'notes' : 'normal';
    
    const desktopBtn = document.getElementById('notesBtn');
    const mobileBtn = document.getElementById('mobileNotesBtn');
    
    if (desktopBtn) desktopBtn.classList.toggle('active');
    if (mobileBtn) mobileBtn.classList.toggle('active');
    
    updateNotesDisplay();
};

const toggleEraser = () => {
    if (selectedCell) {
        placeNumber(0);
    }
};

// === PAUSE/RESUME ===
const togglePause = () => {
    isPaused = !isPaused;
    const pauseOverlay = document.getElementById('pauseOverlay');
    const icon = isPaused ? '▶️' : '⏸️';
    
    if (isPaused) {
        stopTimer();
        pauseOverlay.classList.add('show');
    } else {
        startTimer();
        pauseOverlay.classList.remove('show');
    }
    
    // Update all pause buttons
    document.querySelectorAll('#pauseBtn, #mobilePauseBtn').forEach(btn => {
        btn.textContent = icon;
    });
};

// === MODALS ===
const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error('Modal not found:', modalId);
        return;
    }
    
    // Pause game if needed
    if (!isPaused && timerInterval) {
        togglePause();
    }
    
    // Show modal
    modal.classList.add('show');
    
    // Close sidebar on mobile after delay
    setTimeout(() => {
        if (window.innerWidth <= 768) {
            closeMobileMenu();
        }
    }, 300);
};

const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
};

// === TIMER ===
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const updateTimerDisplay = () => {
    const timeStr = formatTime(timer);
    const timerEl = document.getElementById('timer');
    const timerMobileEl = document.getElementById('timerMobile');
    
    if (timerEl) timerEl.textContent = timeStr;
    if (timerMobileEl) timerMobileEl.textContent = timeStr;
};

const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!isPaused && gameStarted) {
            timer++;
            updateTimerDisplay();
        }
    }, 1000);
};

const stopTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
};

// === SUDOKU GENERATION ===
const generateSudoku = () => {
    grid = Array(9).fill().map(() => Array(9).fill(0));
    solution = Array(9).fill().map(() => Array(9).fill(0));

    fillGrid(solution);
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            grid[i][j] = solution[i][j];
        }
    }

    const cellsToRemove = difficultySettings[difficulty];
    let removed = 0;
    
    while (removed < cellsToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (grid[row][col] !== 0) {
            grid[row][col] = 0;
            removed++;
        }
    }
};

const fillGrid = (grid) => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                shuffleArray(numbers);
                for (let num of numbers) {
                    if (isValid(grid, row, col, num)) {
                        grid[row][col] = num;
                        if (fillGrid(grid)) {
                            return true;
                        }
                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
};

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

const isValid = (grid, row, col, num) => {
    for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
    }

    for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) return false;
    }

    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i + startRow][j + startCol] === num) return false;
        }
    }

    return true;
};

// === COMPLETION CHECKS ===
const checkRowComplete = (row) => {
    const rowValues = grid[row];
    const uniqueValues = new Set(rowValues.filter(val => val !== 0));
    if (uniqueValues.size === 9) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] !== solution[row][col]) {
                return false;
            }
        }
        return true;
    }
    return false;
};

const checkColumnComplete = (col) => {
    const colValues = [];
    for (let row = 0; row < 9; row++) {
        colValues.push(grid[row][col]);
    }
    const uniqueValues = new Set(colValues.filter(val => val !== 0));
    if (uniqueValues.size === 9) {
        for (let row = 0; row < 9; row++) {
            if (grid[row][col] !== solution[row][col]) {
                return false;
            }
        }
        return true;
    }
    return false;
};

const checkBoxComplete = (row, col) => {
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    const boxValues = [];
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            boxValues.push(grid[startRow + i][startCol + j]);
        }
    }
    
    const uniqueValues = new Set(boxValues.filter(val => val !== 0));
    if (uniqueValues.size === 9) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[startRow + i][startCol + j] !== solution[startRow + i][startCol + j]) {
                    return false;
                }
            }
        }
        return true;
    }
    return false;
};

const applyCompleteEffects = (row, col) => {
    const cells = document.querySelectorAll('.cell');
    
    if (checkRowComplete(row)) {
        for (let c = 0; c < 9; c++) {
            const index = row * 9 + c;
            cells[index].classList.add('complete-flash');
            setTimeout(() => {
                cells[index].classList.remove('complete-flash');
            }, 800);
        }
    }
    
    if (checkColumnComplete(col)) {
        for (let r = 0; r < 9; r++) {
            const index = r * 9 + col;
            cells[index].classList.add('complete-flash');
            setTimeout(() => {
                cells[index].classList.remove('complete-flash');
            }, 800);
        }
    }
    
    if (checkBoxComplete(row, col)) {
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const index = (startRow + i) * 9 + (startCol + j);
                cells[index].classList.add('complete-flash');
                setTimeout(() => {
                    cells[index].classList.remove('complete-flash');
                }, 800);
            }
        }
    }
};

// === GRID RENDERING ===
const renderGrid = () => {
    const gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';
    
    // Update grid theme
    gridEl.className = 'sudoku-grid';
    gridEl.classList.add(`grid-${difficulty}`);

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;

            const key = `${i}-${j}`;
            
            if (cellNotes[key] && cellNotes[key].length > 0 && grid[i][j] === 0) {
                const notesContainer = document.createElement('div');
                notesContainer.className = 'cell-notes';
                for (let n = 1; n <= 9; n++) {
                    const noteEl = document.createElement('div');
                    noteEl.className = 'note';
                    noteEl.textContent = cellNotes[key].includes(n) ? n : '';
                    notesContainer.appendChild(noteEl);
                }
                cell.appendChild(notesContainer);
            } else if (grid[i][j] !== 0) {
                cell.textContent = grid[i][j];
                if (solution[i][j] === grid[i][j]) {
                    cell.classList.add('fixed');
                } else {
                    cell.classList.add('wrong-value');
                }
            }

            cell.addEventListener('click', () => selectCell(i, j));
            gridEl.appendChild(cell);
        }
    }
};

// === CELL SELECTION ===
const selectCell = (row, col) => {
    if (isPaused) return;
    
    if (!gameStarted) {
        gameStarted = true;
    }
    
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.classList.remove('selected', 'highlight');
    });

    selectedCell = { row, col };
    const index = row * 9 + col;
    cells[index].classList.add('selected');

    const value = grid[row][col];
    if (value !== 0) {
        cells.forEach((cell, idx) => {
            const r = Math.floor(idx / 9);
            const c = idx % 9;
            if (grid[r][c] === value) {
                cell.classList.add('highlight');
            }
        });
    }
};

// === UPDATE DISPLAYS ===
const updateErrorsDisplay = () => {
    const errorText = `${errors}/${maxErrors}`;
    const errorsEl = document.getElementById('errors');
    const errorsMobileEl = document.getElementById('errorsMobile');
    
    if (errorsEl) errorsEl.textContent = errorText;
    if (errorsMobileEl) errorsMobileEl.textContent = errorText;
};

const updateHintsDisplay = () => {
    const hintsEl = document.getElementById('hints');
    const hintBadgeMobileEl = document.getElementById('hintBadgeMobile');
    
    if (hintsEl) hintsEl.textContent = hints;
    if (hintBadgeMobileEl) hintBadgeMobileEl.textContent = hints;
};

const updateNotesDisplay = () => {
    const notesBadge = document.getElementById('notesBadge');
    if (notesBadge) {
        notesBadge.textContent = mode === 'notes' ? 'ON' : 'OFF';
    }
};

// === PLACE NUMBER ===
const placeNumber = (num) => {
    if (!selectedCell || isPaused) return;
    
    if (!gameStarted) {
        gameStarted = true;
    }
    
    const { row, col } = selectedCell;
    const cells = document.querySelectorAll('.cell');
    const index = row * 9 + col;
    const cell = cells[index];

    if (cell.classList.contains('fixed')) return;

    const key = `${row}-${col}`;

    if (mode === 'notes' && num !== 0) {
        if (!cellNotes[key]) cellNotes[key] = [];
        
        if (cellNotes[key].includes(num)) {
            cellNotes[key] = cellNotes[key].filter(n => n !== num);
        } else {
            cellNotes[key].push(num);
            cellNotes[key].sort();
        }
        
        renderGrid();
        selectCell(row, col);
        return;
    }

    if (cellNotes[key]) {
        delete cellNotes[key];
    }

    grid[row][col] = num;

    cell.classList.remove('error');
    if (num !== 0 && num !== solution[row][col]) {
        cell.classList.add('error');
        errors++;
        updateErrorsDisplay();
        
        setTimeout(() => {
            const currentCell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            if (currentCell) {
                currentCell.classList.remove('error');
            }
        }, 800);
        
        if (errors >= maxErrors) {
            setTimeout(() => {
                stopTimer();
                showGameOver();
            }, 900);
            return;
        }
    }

    renderGrid();
    selectCell(row, col);

    if (num !== 0) {
        applyCompleteEffects(row, col);
    }

    if (isGridFilled()) {
        setTimeout(() => {
            if (checkComplete()) {
                stopTimer();
                showVictory();
            }
        }, 300);
    }
};

// === COMPLETION ===
const isGridFilled = () => {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (grid[i][j] === 0) return false;
        }
    }
    return true;
};

const checkComplete = () => {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (grid[i][j] !== solution[i][j]) {
                return false;
            }
        }
    }
    return true;
};

const showVictory = () => {
    stats.gamesWon++;
    if (!stats.bestTime || timer < stats.bestTime) {
        stats.bestTime = timer;
    }
    saveStats();

    const finalTimeEl = document.getElementById('finalTime');
    const finalErrorsEl = document.getElementById('finalErrors');
    
    if (finalTimeEl) finalTimeEl.textContent = formatTime(timer);
    if (finalErrorsEl) finalErrorsEl.textContent = errors;
    
    showModal('victoryModal');
};

const showGameOver = () => {
    const gameOverTimeEl = document.getElementById('gameOverTime');
    if (gameOverTimeEl) gameOverTimeEl.textContent = formatTime(timer);
    
    showModal('gameOverModal');
};

// === HINT ===
const useHint = () => {
    if (hints <= 0 || !selectedCell || isPaused) {
        if (hints <= 0) {
            alert('⚠️ Petunjuk sudah habis!');
        }
        return;
    }

    const { row, col } = selectedCell;
    const cells = document.querySelectorAll('.cell');
    const index = row * 9 + col;
    const cell = cells[index];

    if (cell.classList.contains('fixed')) {
        alert('ℹ️ Sel ini sudah terisi dengan benar!');
        return;
    }

    hints--;
    updateHintsDisplay();

    const key = `${row}-${col}`;
    if (cellNotes[key]) {
        delete cellNotes[key];
    }

    grid[row][col] = solution[row][col];
    
    renderGrid();
    selectCell(row, col);

    applyCompleteEffects(row, col);

    if (isGridFilled() && checkComplete()) {
        stopTimer();
        showVictory();
    }
};

// === RESET GAME (PERBAIKAN) ===
const resetGame = () => {
    // Stop timer terlebih dahulu
    stopTimer();
    
    // Unpause jika sedang pause
    if (isPaused) {
        isPaused = false;
        const pauseOverlay = document.getElementById('pauseOverlay');
        if (pauseOverlay) {
            pauseOverlay.classList.remove('show');
        }
    }
    
    // Reset grid ke kondisi awal (hanya hapus isian user)
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            // Cek apakah cell ini adalah cell fixed original
            // Dengan membandingkan dengan solution yang sudah ada sejak awal
            const isOriginalFixed = (solution[i][j] === grid[i][j]) && grid[i][j] !== 0;
            
            // Jika bukan original fixed, reset ke 0
            if (!isOriginalFixed) {
                // Regenerate grid dari solution
                const cellsToRemove = difficultySettings[difficulty];
                let tempGrid = Array(9).fill().map(() => Array(9).fill(0));
                
                // Copy solution
                for (let x = 0; x < 9; x++) {
                    for (let y = 0; y < 9; y++) {
                        tempGrid[x][y] = solution[x][y];
                    }
                }
                
                // Remove cells dengan pola yang sama seperti generate
                let removed = 0;
                const removeIndices = [];
                while (removed < cellsToRemove) {
                    const rRow = Math.floor(Math.random() * 9);
                    const rCol = Math.floor(Math.random() * 9);
                    const key = `${rRow}-${rCol}`;
                    if (!removeIndices.includes(key) && tempGrid[rRow][rCol] !== 0) {
                        removeIndices.push(key);
                        tempGrid[rRow][rCol] = 0;
                        removed++;
                    }
                }
                
                grid = tempGrid;
                break;
            }
        }
        if (i < 9) break;
    }

    // Reset variables
    cellNotes = {};
    errors = 0;
    timer = 0;
    hints = 3;
    gameStarted = false;
    selectedCell = null;

    // Update displays
    updateErrorsDisplay();
    updateTimerDisplay();
    updateHintsDisplay();
    
    // Update pause button icon
    document.querySelectorAll('#pauseBtn, #mobilePauseBtn').forEach(btn => {
        btn.textContent = '⏸️';
    });

    // Re-render grid
    renderGrid();
    
    // Start timer
    startTimer();
};

// === NEW GAME ===
const newGame = (incrementStats = true) => {
    // Stop timer
    stopTimer();
    
    // Unpause jika sedang pause
    if (isPaused) {
        isPaused = false;
        const pauseOverlay = document.getElementById('pauseOverlay');
        if (pauseOverlay) {
            pauseOverlay.classList.remove('show');
        }
    }
    
    if (incrementStats) {
        stats.gamesPlayed++;
        saveStats();
    }

    // Generate puzzle baru
    generateSudoku();
    renderGrid();

    // Reset semua state
    cellNotes = {};
    selectedCell = null;
    errors = 0;
    hints = 3;
    timer = 0;
    gameStarted = false;

    // Update displays
    updateErrorsDisplay();
    updateTimerDisplay();
    updateHintsDisplay();
    
    // Update pause button
    document.querySelectorAll('#pauseBtn, #mobilePauseBtn').forEach(btn => {
        btn.textContent = '⏸️';
    });

    // Start timer
    startTimer();
};

// === KEYBOARD SUPPORT ===
document.addEventListener('keydown', (e) => {
    if (!selectedCell || isPaused) {
        if (e.key === 'Escape' && gameStarted) {
            togglePause();
        }
        return;
    }

    if (e.key >= '1' && e.key <= '9') {
        placeNumber(parseInt(e.key));
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        placeNumber(0);
    } else if (e.key === 'ArrowUp' && selectedCell.row > 0) {
        selectCell(selectedCell.row - 1, selectedCell.col);
    } else if (e.key === 'ArrowDown' && selectedCell.row < 8) {
        selectCell(selectedCell.row + 1, selectedCell.col);
    } else if (e.key === 'ArrowLeft' && selectedCell.col > 0) {
        selectCell(selectedCell.row, selectedCell.col - 1);
    } else if (e.key === 'ArrowRight' && selectedCell.col < 8) {
        selectCell(selectedCell.row, selectedCell.col + 1);
    } else if (e.key === 'Escape') {
        togglePause();
    } else if (e.key === 'n' || e.key === 'N') {
        toggleNotes();
    } else if (e.key === 'h' || e.key === 'H') {
        useHint();
    }
});

// === EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleMobileMenu();
        });
    }
    
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeMobileMenu();
        });
    }
    
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', function(e) {
            closeMobileMenu();
        });
    }

    // Theme toggle
    document.getElementById('desktopThemeBtn')?.addEventListener('click', toggleTheme);
    document.getElementById('mobileThemeBtn')?.addEventListener('click', toggleTheme);

    // New game - HANYA UNTUK DESKTOP
    document.getElementById('desktopNewGame')?.addEventListener('click', () => newGame(true));

    // Pause
    document.getElementById('pauseBtn')?.addEventListener('click', togglePause);
    document.getElementById('mobilePauseBtn')?.addEventListener('click', togglePause);
    document.getElementById('resumeBtn')?.addEventListener('click', togglePause);

    // Actions
    document.getElementById('notesBtn')?.addEventListener('click', toggleNotes);
    document.getElementById('mobileNotesBtn')?.addEventListener('click', toggleNotes);
    document.getElementById('eraserBtn')?.addEventListener('click', toggleEraser);
    document.getElementById('mobileEraserBtn')?.addEventListener('click', toggleEraser);

    // Reset and hint
    document.getElementById('desktopResetBtn')?.addEventListener('click', resetGame);
    document.getElementById('desktopHintBtn')?.addEventListener('click', useHint);
    document.getElementById('mobileResetBtn')?.addEventListener('click', resetGame);
    document.getElementById('mobileHintBtn')?.addEventListener('click', useHint);

    // Stats - Desktop & Mobile
    document.getElementById('resetStatsBtn')?.addEventListener('click', resetStats);
    document.getElementById('resetStatsBtnMobile')?.addEventListener('click', resetStats);

    // Difficulty - Desktop
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => changeDifficulty(btn.dataset.difficulty));
    });

    // Difficulty - Mobile
    document.getElementById('mobileDifficultySelect')?.addEventListener('change', (e) => {
        changeDifficulty(e.target.value);
    });

    // Number buttons - Desktop & Mobile
    document.querySelectorAll('.num-btn, .numpad-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const num = parseInt(btn.dataset.number);
            placeNumber(num);
        });
    });

    // Help modals
    document.querySelectorAll('.help-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const modalName = this.getAttribute('data-modal');
            const modalId = modalName + 'Modal';
            
            console.log('Help button clicked:', modalName);
            console.log('Opening modal:', modalId);
            
            showModal(modalId);
        });
    });

    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.close + 'Modal';
            closeModal(modalId);
        });
    });

    document.getElementById('victoryCloseBtn')?.addEventListener('click', () => {
        closeModal('victoryModal');
        newGame(true);
    });

    document.getElementById('gameOverCloseBtn')?.addEventListener('click', () => {
        closeModal('gameOverModal');
        newGame(true);
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Initialize game
    loadStats();
    updateNotesDisplay();
    updateCultureTheme(difficulty); // Set initial theme
    newGame(false);
    
    console.log('🎮 Sudoku Nusantara berhasil dimuat!');
    console.log('🇮🇩 Selamat bermain dan lestarikan budaya Indonesia!');
});