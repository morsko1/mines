const field = document.getElementById('field');
const wrap = document.getElementById('field__container');
const menu = document.getElementById('menu');
const menuLink = document.getElementById('menu__links');
const elems = document.getElementsByClassName('elem');

const fieldConfigEasy = {
    rows: 8,
    cols: 8,
    get numOfCells() {return this.rows * this.cols;},
    numOfBombs: 10
}
const fieldConfigMedium = {
    rows: 16,
    cols: 16,
    get numOfCells() {return this.rows * this.cols;},
    numOfBombs: 40
}
const fieldConfigHard = {
    rows: 16,
    cols: 31,
    get numOfCells() {return this.rows * this.cols;},
    numOfBombs: 99
}

const elemSize = 20;
let level;
let config;

const generateField = () => {
    switch (level) {
        case 'easy':
            config = fieldConfigEasy;
            break;
        case 'medium':
            config = fieldConfigMedium;
            break;
        case 'hard':
            config = fieldConfigHard;
            break;
        default:
            config = fieldConfigEasy;
            break;
    }

    field.style.width = (elemSize * config.cols + 2) + 'px';
    field.style.height = (elemSize * config.rows + 2) + 'px';

    for (let i = 0; i < config.numOfCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('elem');
        cell.classList.add('closed');
        cell.dataset.count = i;
        cell.style.width = elemSize + 'px';
        cell.style.height = elemSize + 'px';
        cell.style.lineHeight = elemSize + 'px';
        field.appendChild(cell);
    }
}

const setNumberOfBomb = (cellNum) => {
    cellNum = parseInt(cellNum, 10);
    const neighbours = concatNeighbours(getNeighbours(cellNum));
    let bombCounter = 0;
    neighbours.map(num => {
        if (num !== null && elems[num].classList.contains('bomb')) {
            bombCounter++;
        }
    });
    elems[cellNum].dataset.bombs = bombCounter;
}

const setField = (cellNum) => {
    let arr = [];
    for (let i = 0; i < config.numOfCells; i++) {
        if (i < config.numOfBombs) {
            arr.push('bomb');
        } else {
            arr.push('');
        }
    }
    arr.sort((a, b) => {
        return 0.5 - Math.random();
    });
    if (arr[cellNum] === 'bomb') {
        setField(cellNum);
        return;
    }

    for (let i = 0; i < elems.length; i++) {
        if (arr[i] === 'bomb') {
            elems[i].classList.add('bomb');
        }
    }
    for (let i = 0; i < elems.length; i++) {
        setNumberOfBomb(i);
    }

    field.removeEventListener('click', startGame);
    field.addEventListener('click', makeMove);
}

const getNeighbours = (cellNum) => {
    const rightElem = (cellNum + 1) % config.cols === 0 ? null : cellNum + 1;
    const leftElem = (cellNum) % config.cols === 0 ? null : cellNum - 1;
    const topElems = (cellNum < config.cols) ?
        null :
        [
            leftElem !== null ?
            cellNum - (config.cols + 1) : null, rightElem !== null ? cellNum - (config.cols - 1) : null,
            cellNum - config.cols
        ];
    const bottomElems = cellNum > (config.numOfCells - config.cols - 1) ?
        null :
        [
            leftElem !== null ? cellNum + (config.cols - 1) : null,
            rightElem !== null ? cellNum + (config.cols + 1) : null,
            cellNum + config.cols
        ];

    const topElemsFiltered = (topElems !== null) ? topElems.filter(elem => elem !== null) : null;
    const bottomElemsFiltered = (bottomElems !== null) ? bottomElems.filter(elem => elem !== null) : null;

    return {
        rightElem: rightElem,
        leftElem: leftElem,
        topElems: topElemsFiltered,
        bottomElems: bottomElemsFiltered
    };
}

const concatNeighbours = (neighbours) => {
    const {rightElem, leftElem, topElems, bottomElems} = neighbours;

    let array = [];
    if (rightElem !== null) {
        array.push(rightElem);
    }
    if (leftElem !== null) {
        array.push(leftElem);
    }
    if (topElems !== null) {
        array = array.concat(topElems);
    }
    if (bottomElems !== null) {
        array = array.concat(bottomElems);
    }
    return array;
}

const updateCell = (cellNum) => {
    elems[cellNum].classList.remove('closed');
    elems[cellNum].dataset.iterates = elems[cellNum].dataset.iterates ? parseInt(elems[cellNum].dataset.iterates) + 1 : 0;
    elems[cellNum].innerHTML = elems[cellNum].dataset.bombs !== '0' ? elems[cellNum].dataset.bombs : '';
    if (elems[cellNum].dataset.bombs === '0' && parseInt(elems[cellNum].dataset.iterates) === 0) {
        openNearestEmptyCells(cellNum);
    }
}

const openNearestEmptyCells = (cellNum) => {
    const neighbours = concatNeighbours(getNeighbours(cellNum));
    neighbours.map(num => {
        if (!elems[num].classList.contains('bomb')) {
            updateCell(num);
        }
    });
}

const isWin = () => {
    return document.getElementsByClassName('closed').length === document.getElementsByClassName('bomb').length;
}

const showAllBombs = (bombDeath) => {
    for (let i = 0; i < elems.length; i++) {
        if (elems[i].classList.contains('bomb')) {
            elems[i].style.backgroundImage = (i === bombDeath) ?
                "url('images/bombdeath.gif')" :
                "url('images/bomb.gif')";
            elems[i].style.backgroundSize = `${elemSize - 2}px ${elemSize - 2}px`;
        }
    }
}

const setFlagsToAllBombs = () => {
    for (let i = 0; i < elems.length; i++) {
        if (elems[i].classList.contains('bomb')) {
            elems[i].style.backgroundImage = "url('images/bombflagged.gif')";
            elems[i].style.backgroundSize = `${elemSize - 2}px ${elemSize - 2}px`;
        }
    }
}

const afterGame = (win, bombDeath) => {
    field.removeEventListener('click', makeMove);

    const div = document.createElement('div');
    div.innerText = win ? 'You Won' : 'You Lose';
    const newGameBtn = document.createElement('button');
    newGameBtn.innerText = 'New Game';
    newGameBtn.onclick = () => location.reload();
    div.classList.add('result');
    newGameBtn.classList.add('new-game');
    div.appendChild(newGameBtn);
    document.body.appendChild(div);
    if (win) {
        setFlagsToAllBombs();
    } else {
        showAllBombs(bombDeath);
    }
}

const showNumberOfBombs = (cellNum) => {
    cellNum = parseInt(cellNum, 10);
    elems[cellNum].innerHTML = elems[cellNum].dataset.bombs !== '0' ? elems[cellNum].dataset.bombs : '';
    if (elems[cellNum].dataset.bombs === '0') {
        openNearestEmptyCells(cellNum);
    }
    if (isWin()) {
        afterGame(true);
    }
}

const makeMove = (e) => {
    const cellNum = e.target.dataset.count
    for (let i = 0; i < elems.length; i++) {
        if (elems[i].dataset.count === cellNum) {
            elems[i].classList.remove('closed');
            if (event.target.classList.contains('bomb')) {
                afterGame(false, i);
                return;
            }
            showNumberOfBombs(cellNum);
        }
    }
}

const startGame = (e) => {
    setField(e.target.dataset.count);
    makeMove(e);
}

const goToMenu = () => {
    localStorage.removeItem('level');
    location.reload();
}

const showField = () => {
    wrap.style.display = 'block';
    menu.style.display = 'none';
    menuLink.style.display = 'block';
}

const hideField = () => {
    wrap.style.display = 'none';
    menu.style.display = 'block';
    menuLink.style.display = 'none';
}

const init = (i) => {
    if (localStorage.getItem('level')) {
        level = localStorage.getItem('level');
    } else {
        level = i;
        localStorage.setItem('level', i);
    }
    showField();
    generateField();
    field.addEventListener('click', startGame);
}

window.onload = () => {
    if (localStorage.getItem('level')) {
        level = localStorage.getItem('level');
        generateField();
        field.addEventListener('click', startGame);
        showField();
    } else {
        hideField();
    }
}
