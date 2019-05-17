let Chess = {
  init: function () {
    this.createBoard();
    this.createCells();
    this.createHorse();
    this.setListeners();
    this.highlightVariant();
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
    this.defaultSize = this.board.domElement.offsetWidth; // присвоение текущей ширины поля для вычисления ширины и высоты ячейки
  },


  createCells: function () {  // создание ячеек поля + добавление позиции X,Y + добавление классов для окраса;
    this.board.cells = []; //  массив обьектов с параметрами позиции ячейки (x,y) + domElement
    let x = 1, y = 8;
    for (let i = 0; i < 64; i++) {
      this.board.cells[i] = {
        id: i + '',
        domElement: document.createElement('div')
      }
      this.board.domElement.appendChild(this.board.cells[i].domElement); // вставка в поле каждой отдельной ячейки и присвоение ячейки класса
      this.board.cells[i].domElement.classList.add('chess_cell');

      if (x > 8) {
        x = 1;
        y--;
      }
      this.board.cells[i].boardPosX = x; //опреденение параметров для дальнейшего вычисления возможных позиций
      this.board.cells[i].boardPosY = y;
      x++;
      if (((i % 2 == 0) && (y % 2 == 0)) || ((i % 2 != 0) && (y % 2 != 0))) { //раскраска  шахматной доски
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

    this.horse.posinionX = this.board.cells[this.randomPosition].domElement.getBoundingClientRect().x;  //присвоение позициям X,Y для постановки на доску
    this.horse.posinionY = this.board.cells[this.randomPosition].domElement.getBoundingClientRect().y;

    this.horse.boardPosX = this.board.cells[this.randomPosition].boardPosX; // определение позиции на шахматной доске
    this.horse.boardPosY = this.board.cells[this.randomPosition].boardPosY;

    this.moveHorse(this.horse.posinionX, this.horse.posinionY);

  },


  setListeners: function () {     //перерисовка поля и коня при изменении размеров
    document.body.onresize = () => {
      this.setBoardSize();
      this.setHorseParams();
    }
  },


  moveHorse: function (x, y) {
    let newX = x;
    let newY = y;
    this.horse.amendmentY = (document.body.offsetHeight - this.board.domElement.offsetHeight) / 2 //определение поправок для выставления коня по центру
    this.horse.amendmentX = (document.body.offsetWidth - this.board.domElement.offsetWidth) / 2

    this.horse.domElement.style.left = (newX - this.horse.amendmentX) + 'px';
    this.horse.domElement.style.top = (newY - this.horse.amendmentY) + 'px';     // перемещение коня на позицию с учетом поправки

  },


  highlightVariant: function () {
    let activeX = this.horse.boardPosX;
    let activeY = this.horse.boardPosY;
    this.board.cells.forEach(element => {
      if (((element.boardPosX == activeX + 1) && (element.boardPosY == activeY + 2)) ||  //подсветка возможных ходов коня
        ((element.boardPosX == activeX + 1) && (element.boardPosY == activeY - 2)) ||
        ((element.boardPosX == activeX + 2) && (element.boardPosY == activeY + 1)) ||
        ((element.boardPosX == activeX + 2) && (element.boardPosY == activeY - 1)) ||
        ((element.boardPosX == activeX - 1) && (element.boardPosY == activeY + 2)) ||
        ((element.boardPosX == activeX - 1) && (element.boardPosY == activeY - 2)) ||
        ((element.boardPosX == activeX - 2) && (element.boardPosY == activeY + 1)) ||
        ((element.boardPosX == activeX - 2) && (element.boardPosY == activeY - 1))
      ) {
        element.domElement.classList.add('variant_for_jump');
        element.domElement.addEventListener('click', () => {   //изменили информацию о новой позиции ячейки в которую передвинулись
          let newBoardX = element.boardPosX;
          let newBoardY = element.boardPosY;
          this.horse.boardPosX = newBoardX;
          this.horse.boardPosY = newBoardY;


          let newposinionX = element.domElement.getBoundingClientRect().x; // пристваиваем новым переменным данные  о позиции ячейки на которую кликнули
          let newposinionY = element.domElement.getBoundingClientRect().y;

          this.moveHorse(newposinionX, newposinionY) // вызываем ф-ю передвижения коня с новыми  параментрами 

          this.board.cells.forEach(element => { // перебераем все елементы массива с ячейками и удаляем после клика подсвеченые элементы относительно старой позиции
            element.domElement.classList.remove('variant_for_jump');
          })
          this.highlightVariant(); //повторно вызываем ф-ю подсветки
        })

      }
    });
  }

}


document.addEventListener('DOMContentLoaded', function () { // запуск после прогрузки всех dom елементов 
  Chess.init();
  console.log(Chess);
  console.log(Chess.board);
  console.log(Chess.horse);
  console.log(Chess.board.cells);
  console.log(Chess.horse.posinionX);
  console.log(Chess.horse.posinionY);
}, false);