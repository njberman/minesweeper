document.addEventListener('DOMContentLoaded', () => {
  // Constants
  const LEVELS = {
    beginner: {
      ROWS: 9,
      COLS: 9,
      MINES: 10,
    },
    intermediate: {
      ROWS: 16,
      COLS: 16,
      MINES: 40,
    },
    expert: {
      ROWS: 16,
      COLS: 30,
      MINES: 99,
    },
  };

  let chosen_level = 'beginner';
  let ROWS, COLS, MINES, CELL_COUNT;

  const GAME_HEIGHT_VW = 65;
  const root = document.querySelector(':root');
  root.style.setProperty('--game-height', `${GAME_HEIGHT_VW}vh`);

  const timer = document.getElementById('timer');
  let timerInterval;

  const mineCount = document.getElementById('mine-count');

  let gameState = true;
  let cellsRevealed = 0;

  const cells = [];

  const init = () => {
    ROWS = LEVELS[chosen_level].ROWS;
    COLS = LEVELS[chosen_level].COLS;
    MINES = LEVELS[chosen_level].MINES;
    CELL_COUNT = ROWS * COLS;

    clearInterval(timerInterval);
    timer.innerText = '0';
    mineCount.innerText = MINES;

    const game = document.getElementById('game');
    game.style.width = `${(GAME_HEIGHT_VW * COLS) / ROWS}vh`;

    const grid = document.getElementById('grid');
    grid.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;
    grid.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;

    gameState = true;
    cellsRevealed = 0;

    grid.innerHTML = '';
    cells.length = 0;
    for (let i = 0; i < CELL_COUNT; i++) {
      const cell = document.createElement('div');

      cell.classList.add('cell');
      cell.id = i;

      cell.addEventListener('click', () => cellLeftClicked(i));
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        cellRightClicked(i);
      });

      cells.push({ cell, mine: false, count: 0 });

      grid.appendChild(cell);
    }

    generateMines();
    countNeighbours();
  };

  const indexToPosition = (index) => {
    const row = Math.floor(index / COLS);
    const col = index - row * COLS;
    return { row, col };
  };

  const positionToIndex = (row, col) => {
    return row * COLS + col;
  };

  const getNeighbourIndices = (row, col) => {
    const neighbours = [];
    const deltas = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dRow, dCol] of deltas) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
        neighbours.push(positionToIndex(newRow, newCol));
      }
    }
    return neighbours;
  };

  const cellLeftClicked = (i) => {
    if (!gameState) return;
    const { cell, mine, count } = cells[i];
    if (cell.classList.contains('number') || cell.classList.contains('flagged'))
      return;

    if (mine) {
      cell.classList.add('mine');
      cell.innerText = '💣';
      cells.forEach(({ cell, mine }, j) =>
        mine && !cell.classList.contains('mine')
          ? cellLeftClicked(j)
          : undefined,
      );
      gameState = false;
      clearInterval(timerInterval);

      return;
    }

    if (count > 0) {
      cell.classList.add('number');
      cell.innerText = count;
      cell.setAttribute('data-value', count);
    } else {
      cell.classList.add('number');

      const { row, col } = indexToPosition(i);
      const neighbors = getNeighbourIndices(row, col);
      neighbors.forEach((index) => cellLeftClicked(index));
    }

    if (timer.innerText === '0') {
      timerInterval = setInterval(
        () => (timer.innerText = parseInt(timer.innerText) + 1),
        1000,
      );
    }

    cellsRevealed++;
    if (CELL_COUNT - cellsRevealed === MINES) {
      gameState = false;
      console.log('You won!');
    }
  };

  const cellRightClicked = (i) => {
    if (!gameState) return;
    const { cell } = cells[i];
    if (cell.className !== 'cell' && cell.className !== 'cell flagged') return;
    if (cell.classList.contains('flagged')) {
      cell.innerText = '';
      cell.classList.remove('flagged');
      mineCount.innerText = parseInt(mineCount.innerText) + 1;
    } else {
      cell.innerText = '🚩';
      cell.classList.add('flagged');
      mineCount.innerText = parseInt(mineCount.innerText) - 1;
    }
  };

  const generateMines = (mines = 0) => {
    if (mines === MINES) return;
    const randomIndex = Math.floor(Math.random() * CELL_COUNT);

    if (!cells[randomIndex].mine) {
      cells[randomIndex].mine = true;
      mines++;
    }

    return generateMines(mines);
  };

  const countNeighbours = () => {
    for (let i = 0; i < CELL_COUNT; i++) {
      if (cells[i].mine) continue;

      const { row, col } = indexToPosition(i);
      const neighbors = getNeighbourIndices(row, col);

      let count = 0;
      for (const index of neighbors) {
        if (cells[index].mine) count++;
      }

      cells[i].count = count;
    }
  };

  init();

  const newGameButton = document.getElementById('new-game');
  newGameButton.addEventListener('click', init);

  const levelSelect = document.getElementById('level-select');
  levelSelect.addEventListener('change', (e) => {
    chosen_level = e.target.value;
    init();
  });
});
