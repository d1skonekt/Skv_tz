let Chess = {
    init: function () {
        this.createBoard();
        this.createCells();
        this.createHorse();
        this.setListeners();
        this.randomFirstHorstPosition();
    },
    createBoard: function () {  //создание доски и вызов ф-и которая определяет размеры блока;
        this.board = {};
        this.board.domElement = document.createElement('div');
        this.board.domElement.classList.add('wrapper_field');

        document.body.insertBefore(this.board.domElement, document.body.firstChild);
        this.setBoardSize();
    },
    setBoardSize: function () {
        if (document.body.offsetWidth >= document.body.offsetHeight) {
            this.board.domElement.style.width = '90vh';
            this.board.domElement.style.height = '90vh';
        } else {
            this.board.domElement.style.width = '90vw';
            this.board.domElement.style.height = '90vw';
        }
        this.defaultSize = this.board.domElement.offsetWidth;
    },
    createCells: function () {  // создание ячеек поля + добавление позиции X,Y + добавление классов для окраса;
        this.board.cells = [];
        let x = 1, y = 8;
        for (let i = 0; i < 64; i++) {
            this.board.cells[i] = document.createElement('div');
            this.board.domElement.appendChild(this.board.cells[i]);
            this.board.cells[i].classList.add('chess_cell');

            if (x > 8) {
                x = 1;
                y--;
            }
            this.board.cells[i].posX = x;
            this.board.cells[i].posY = y;
            x++;
            if (((i % 2 == 0) && (y % 2 == 0)) || ((i % 2 != 0) && (y % 2 != 0))) {
                this.board.cells[i].classList.add('yellow_bg');
            } else {
                this.board.cells[i].classList.add('brown_bg');
            }
        }
        this.randomPosition = Math.round(Math.random() * 63);
    },
    createHorse: function () {  //создание коня и вызов ф-и которая определяет размеры блока;
        this.horse = {};
        this.horse.domElement = document.createElement('div');
        this.horse.domElement.classList.add('horse');
        this.horse.domElement.setAttribute('draggable', true)
        this.board.domElement.appendChild(this.horse.domElement);
        this.setHorsedSize();

       

        console.log(this.randomPosition)

    },
    setHorsedSize: function () {
        this.horse.domElement.style.width = (this.defaultSize * 0.124) + 'px';
        this.horse.domElement.style.height = this.horse.domElement.style.width;

        //рандомизация коня при первом запуске
        
        let amendmentY = (document.body.offsetHeight - this.board.domElement.offsetHeight) / 2
        let amendmentX = (document.body.offsetWidth - this.board.domElement.offsetWidth) / 2
        this.horse.domElement.style.top = (this.board.cells[this.randomPosition].getBoundingClientRect().top - amendmentY) + 'px';
        this.horse.domElement.style.left = (this.board.cells[this.randomPosition].getBoundingClientRect().left - amendmentX) + 'px';
    },
    setListeners: function () {
        document.body.onresize = () => {
            this.setBoardSize();
            this.setHorsedSize();
        }
    },
    randomFirstHorstPosition: function () {

    }
}

Chess.init();

// document.addEventListener('DOMContentLoaded', function() {
//     Chess.init();
// }, false);

console.log(Chess.board);
console.log(Chess.horse);
console.log(Chess.board.cells);
console.log(Chess);


