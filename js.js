let Chess = {
  init: function () {
    this.createBoard();
    this.createCells();
    this.createHorse();
    this.highlightVariant();
    this.setListeners();
  },

  //создание доски и вызов ф-и которая определяет размеры блока;
  createBoard: function () {
    this.board = {};
    this.board.domElement = document.createElement('div');
    this.board.domElement.classList.add('wrapper_field');

    document.body.insertBefore(this.board.domElement, document.body.firstChild);
    this.setBoardSize();
  },


  setBoardSize: function () {
    // условие для всегда правильного квадрата
    if (document.body.offsetWidth >= document.body.offsetHeight) {
      this.board.domElement.style.width = '90vh';
      this.board.domElement.style.height = '90vh';
    } else {
      this.board.domElement.style.width = '90vw';
      this.board.domElement.style.height = '90vw';
    }

    // присвоение текущей ширины поля для вычисления ширины и высоты ячейки
    this.defaultSize = this.board.domElement.offsetWidth;
  },

  // создание ячеек поля + добавление позиции X,Y + добавление классов для окраса;
  createCells: function () {
    //  массив обьектов с параметрами позиции ячейки (x,y) + domElement
    this.board.cells = [];
    let x = 1, y = 8;
    for (let i = 0; i < 64; i++) {
      this.board.cells[i] = {
        id: i + '',
        domElement: document.createElement('div')
      }
      // вставка в поле каждой отдельной ячейки и присвоение ячейки класса
      this.board.domElement.appendChild(this.board.cells[i].domElement);
      this.board.cells[i].domElement.classList.add('chess_cell');

      if (x > 8) {
        x = 1;
        y--;
      }
      //опреденение параметров для дальнейшего вычисления возможных позиций
      this.board.cells[i].boardPosX = x;
      this.board.cells[i].boardPosY = y;
      x++;
      //раскраска  шахматной доски
      if (((i % 2 == 0) && (y % 2 == 0)) || ((i % 2 != 0) && (y % 2 != 0))) {
        this.board.cells[i].domElement.classList.add('yellow_bg');
      } else {
        this.board.cells[i].domElement.classList.add('brown_bg');
      }
    }
  },

  //создание блока коня и вызов ф-и которая определяет его размеры;
  createHorse: function () {
    this.horse = {};
    this.horse.domElement = document.createElement('div');
    this.horse.domElement.classList.add('horse');
    this.horse.domElement.setAttribute('draggable', true)
    this.board.domElement.appendChild(this.horse.domElement);

    // рандомизируем первое место при загрузке страницы для коня
    this.currentCell = Math.round(Math.random() * 63);

    this.setHorseParams();

  },


  setHorseParams: function () {
    // определение ширины/высоты ячейки с конем
    this.horse.domElement.style.width = (this.defaultSize * 0.124) + 'px';
    this.horse.domElement.style.height = this.horse.domElement.style.width;

    //присвоение позициям X,Y для постановки на доску
    this.horse.posinionX = this.board.cells[this.currentCell].domElement.getBoundingClientRect().x;
    this.horse.posinionY = this.board.cells[this.currentCell].domElement.getBoundingClientRect().y;

    // определение позиции на шахматной доске
    this.horse.boardPosX = this.board.cells[this.currentCell].boardPosX;
    this.horse.boardPosY = this.board.cells[this.currentCell].boardPosY;

    this.moveHorse(this.horse.posinionX, this.horse.posinionY);

  },

  //перерисовка поля и коня при изменении размеров
  setListeners: function () {
    document.body.onresize = () => {
      this.setBoardSize();
      this.setHorseParams();
    }

    this.board.cells.forEach(element => {
      element.domElement.addEventListener('click', () => {
        if (element.domElement.classList.contains('variant_for_jump')) {
          this.horse.boardPosX = element.boardPosX;
          this.horse.boardPosY = element.boardPosY;

          this.currentCell = element.id;

          this.moveHorse(element.domElement.getBoundingClientRect().x, element.domElement.getBoundingClientRect().y);

          this.highlightVariant();
        }
      });
    });

  },


  moveHorse: function (newX, newY) {
    //определение поправок для выставления коня по центру
    this.horse.amendmentY = (document.body.offsetHeight - this.board.domElement.offsetHeight) / 2
    this.horse.amendmentX = (document.body.offsetWidth - this.board.domElement.offsetWidth) / 2

    // перемещение коня на позицию с учетом поправки
    this.horse.domElement.style.left = (newX - this.horse.amendmentX) + 'px';
    this.horse.domElement.style.top = (newY - this.horse.amendmentY) + 'px';

  },


  highlightVariant: function () {
    let activeX = this.horse.boardPosX;
    let activeY = this.horse.boardPosY;
    // перебераем все елементы массива с ячейками и удаляем после клика подсвеченые элементы относительно старой позиции
    this.board.cells.forEach(element => {
      element.domElement.classList.remove('variant_for_jump');
      //подсветка возможных новых ходов коня
      if (((element.boardPosX == activeX + 1) && (element.boardPosY == activeY + 2)) ||
        ((element.boardPosX == activeX + 1) && (element.boardPosY == activeY - 2)) ||
        ((element.boardPosX == activeX + 2) && (element.boardPosY == activeY + 1)) ||
        ((element.boardPosX == activeX + 2) && (element.boardPosY == activeY - 1)) ||
        ((element.boardPosX == activeX - 1) && (element.boardPosY == activeY + 2)) ||
        ((element.boardPosX == activeX - 1) && (element.boardPosY == activeY - 2)) ||
        ((element.boardPosX == activeX - 2) && (element.boardPosY == activeY + 1)) ||
        ((element.boardPosX == activeX - 2) && (element.boardPosY == activeY - 1))
      ) {
        element.domElement.classList.add('variant_for_jump');
        // element.domElement.addEventListener('click', () => {
        //   if (element.domElement.classList.contains('variant_for_jump')) {
        //     this.horse.boardPosX = element.boardPosX;
        //     this.horse.boardPosY = element.boardPosY;

        //     this.moveHorse(element.domElement.getBoundingClientRect().x, element.domElement.getBoundingClientRect().y);

        //     this.highlightVariant();
        //   }
        // });
      }
    });
  },


}

// запуск после прогрузки всех dom елементов 
document.addEventListener('DOMContentLoaded', function () {
  Chess.init();
  console.log(Chess);
  console.log(Chess.board);
  console.log(Chess.horse);
  console.log(Chess.board.cells);
}, false);