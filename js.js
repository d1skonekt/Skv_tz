let Chess = {
    init: function () {
        this.createBoard();
        this.createCells();
        this.createHorse();
        this.setListeners();
    },
    createBoard: function () {  //создание доски и вызов ф-и которая определяет размеры блока;
        this.board = {};
        this.board.domElement = document.createElement('div');
        this.board.domElement.classList.add('wrapper_field');

        document.body.insertBefore(this.board.domElement, document.body.firstChild);
        this.setBoardSize();
    },
    setBoardSize: function () {
        if (document.body.offsetWidth >= document.body.offsetHeight) {  // условие для всегда правильного квадрата
            this.board.domElement.style.width = '90vh';
            this.board.domElement.style.height = '90vh';
        } else {
            this.board.domElement.style.width = '90vw';
            this.board.domElement.style.height = '90vw';
        }
        this.defaultSize = this.board.domElement.offsetWidth;
    },
    createCells: function () {  // создание ячеек поля + добавление позиции X,Y + добавление классов для окраса;
        this.board.cells = []; //  массив обьектов с параметрами позиции ячейки (x,y) + domElement
        let x = 1, y = 8;
        for (let i = 0; i < 64; i++) {
            this.board.cells[i] = {
                id: i + '',
                domElement: document.createElement('div')
            }
            this.board.domElement.appendChild(this.board.cells[i].domElement);
            this.board.cells[i].domElement.classList.add('chess_cell');

            if (x > 8) {
                x = 1;
                y--;
            }
            this.board.cells[i].posX = x;
            this.board.cells[i].posY = y;
            x++;
            if (((i % 2 == 0) && (y % 2 == 0)) || ((i % 2 != 0) && (y % 2 != 0))) {
                this.board.cells[i].domElement.classList.add('yellow_bg');
            } else {
                this.board.cells[i].domElement.classList.add('brown_bg');
            }
        }
    },
    createHorse: function () {  //создание коня и вызов ф-и которая определяет размеры блока;
        this.horse = {};
        this.horse.domElement = document.createElement('div');
        this.horse.domElement.classList.add('horse');
        this.horse.domElement.setAttribute('draggable', true)
        this.board.domElement.appendChild(this.horse.domElement);

        this.randomPosition = Math.round(Math.random() * 63);   // рандомизируем первое место при загрузке страницы для коня

        this.setHorseParams();

    },
    setHorseParams: function () {
        this.horse.domElement.style.width = (this.defaultSize * 0.124) + 'px';  // определение ширины/высоты коня
        this.horse.domElement.style.height = this.horse.domElement.style.width;

        this.horse.posX = this.board.cells[this.randomPosition].domElement.getBoundingClientRect().x;  //присвоение позициям X,Y первоначальное рандомное значение
        this.horse.posY = this.board.cells[this.randomPosition].domElement.getBoundingClientRect().y;

        this.moveHorse();

    },
    setListeners: function () {     //перерисовка поля и коня при изменении размеров
        document.body.onresize = () => {
            this.setBoardSize();
            this.setHorseParams();
        }
    },
    moveHorse: function () {
        this.horse.amendmentY = (document.body.offsetHeight - this.board.domElement.offsetHeight) / 2 //определение поправок для выставления коня по центру
        this.horse.amendmentX = (document.body.offsetWidth - this.board.domElement.offsetWidth) / 2

        this.horse.domElement.style.top = (this.horse.posY - this.horse.amendmentY) + 'px';     // перемещение коня на позицию с учетом поправки
        this.horse.domElement.style.left = (this.horse.posX - this.horse.amendmentX) + 'px';
    }
}


document.addEventListener('DOMContentLoaded', function () {
    Chess.init();
    console.log(Chess.board);
    console.log(Chess.horse);
    console.log(Chess.board.cells);
}, false);





