const field = document.getElementById('field');
const len = 25;

const generateField = () => {
    for (let i = 0; i < len; i++) {
        const cell = document.createElement('div');
        cell.classList.add('item');
        cell.classList.add('closed');
        cell.dataset.count = i;
        field.appendChild(cell);
    }
}

const setNumberOfBomb = (cellNum) => {
    cellNum = parseInt(cellNum, 10);
    const elems = document.getElementsByClassName('item');
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
    const rows = 5;
    const cols = 5;
    const numOfBombs = 5;
    let arr = [];
    for (let i = 0; i < len; i++) {
        if (i < numOfBombs) {
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

    const elems = document.getElementsByClassName('item');
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
    const elems = document.getElementsByClassName('item');
    const rightElem = (cellNum+1) % 5 === 0 ? null : cellNum + 1;
    const leftElem = (cellNum) % 5 === 0 ? null : cellNum - 1;
    const topElems = cellNum < 5 ? null : [leftElem !== null ? cellNum - 6 : null, rightElem !== null ? cellNum - 4 : null, cellNum - 5];
    const bottomElems = cellNum > 19 ? null : [leftElem !== null ? cellNum + 4 : null, rightElem !== null ? cellNum + 6 : null, cellNum + 5];

    const topElemsFiltered = (topElems !== null) ? topElems.filter(item => item !== null) : null;
    const bottomElemsFiltered = (bottomElems !== null) ? bottomElems.filter(item => item !== null) : null;

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
    const elems = document.getElementsByClassName('item');
    elems[cellNum].classList.remove('closed');
    elems[cellNum].dataset.iterates = elems[cellNum].dataset.iterates ? parseInt(elems[cellNum].dataset.iterates) + 1 : 0;
    elems[cellNum].innerHTML = elems[cellNum].dataset.bombs !== '0' ? elems[cellNum].dataset.bombs : '';
    if (elems[cellNum].dataset.bombs === '0' && parseInt(elems[cellNum].dataset.iterates) === 0) {
        openNearestEmptyCells(cellNum);
    }
}

const openNearestEmptyCells = (cellNum) => {
    const elems = document.getElementsByClassName('item');
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

const afterGame = (win) => {
    field.removeEventListener('click', makeMove);

    let div = document.createElement('div');
    div.innerText = win ? 'You Won' : 'You Lose';
    let newGameBtn = document.createElement('button');
    newGameBtn.innerText = 'New Game';
    newGameBtn.onclick = () => location.reload();
    field.appendChild(div);
    field.appendChild(newGameBtn);
}

const showNumberOfBombs = (cellNum) => {
    cellNum = parseInt(cellNum, 10);
    const elems = document.getElementsByClassName('item');
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
    const elems = document.getElementsByClassName('item');
    for (let i = 0; i < elems.length; i++) {
        if (elems[i].dataset.count === cellNum) {
            elems[i].classList.remove('closed');
            if (event.target.classList.contains('bomb')) {
                afterGame(false);
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

window.onload = () => {
    generateField();
    field.addEventListener('click', startGame);
}
