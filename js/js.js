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
        domElement: document.createElement('div'),
        isDrag: false
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
      // Устанавливаем ссылку на js объект в DOM элемент
      this.board.cells[i].domElement.src = this.board.cells[i];
    }
  },


  //создание блока коня и вызов ф-и которая определяет его размеры;
  createHorse: function () {
    this.horse = {};
    this.horse.isDrag = false;
    this.horse.domElement = document.createElement('div');
    this.horse.domElement.classList.add('horse');
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

    this.horse.correctionInfo = this.horse.domElement.offsetWidth / 2

    this.moveHorse(this.horse.posinionX, this.horse.posinionY);

  },


  //перерисовка поля и коня при изменении размеров
  setListeners: function () {
    document.body.onresize = () => {
      this.setBoardSize();
      this.setHorseParams();
    }

    // добавление события клика на каждый элемент ячейки (ход коня + подсветка следующего варианта)
    this.board.cells.forEach(element => {
      element.domElement.addEventListener('click', () => {
        this.clickOnVariantJump(element);
      });
    });

    //Клик мышки по коню (grad & drop)
    this.horse.domElement.addEventListener('mousedown', (event) => {
      if (event.target.classList.contains('horse')) {
        this.horse.isDrag = true;
        //удаляем подсветку если нажали на коня и готовы передвинуть его
        this.board.cells.forEach(element => {
          element.domElement.classList.remove('variant_for_jump');
        });
      }
    })

    document.addEventListener('mousemove', (event) => {
      if (this.horse.isDrag) {
        // вызов ф-и передвижения коня следом за курсором мыши ((курсор всегда по центру коня))
        this.moveHorse(event.pageX - this.horse.correctionInfo, event.pageY - this.horse.correctionInfo);
      }
    })

    // окончание движение мышки и дроп коня с  учетом того , что начался Драг
    this.horse.domElement.addEventListener('mouseup', (event) => {
      console.log(event);
      if (this.horse.isDrag) {
        // переопределение позиции коня для корректной подсветки и растановке на поле
        this.board.cells.forEach(element => {
          if ((element.domElement.getBoundingClientRect().top - this.horse.domElement.getBoundingClientRect().top) < this.horse.correctionInfo &&
            (element.domElement.getBoundingClientRect().left - this.horse.domElement.getBoundingClientRect().left) < this.horse.correctionInfo &&
            (element.domElement.getBoundingClientRect().right - this.horse.domElement.getBoundingClientRect().right) < this.horse.correctionInfo &&
            (element.domElement.getBoundingClientRect().bottom - this.horse.domElement.getBoundingClientRect().bottom) < this.horse.correctionInfo) {
            // определяем над какой ячейкой конь
            this.currentCell = element.id;
          }
        })
        console.log(this.currentCell);
        //Передвигаем точно коня в центр дропнутой ячейки и обновляем  информацию коня
        this.moveHorse(this.board.cells[this.currentCell].domElement.getBoundingClientRect().x, this.board.cells[this.currentCell].domElement.getBoundingClientRect().y);
        this.horse.boardPosX = this.board.cells[this.currentCell].boardPosX;
        this.horse.boardPosY = this.board.cells[this.currentCell].boardPosY;
        // окончание дропа
        this.horse.isDrag = false;
        //повторно подсвечиваем ячейки для возможного передвижения после Дропа
        this.highlightVariant();
      }
    })


  },


  moveHorse: function (newX, newY) {
    // перемещение коня на позицию с учетом поправки
    this.horse.domElement.style.left = newX + 'px';
    this.horse.domElement.style.top = newY + 'px';

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
      }
    });
  },


  //перемещение коня по клику на новую позицию с заменой данных
  clickOnVariantJump: function (element) {
    if (element.domElement.classList.contains('variant_for_jump')) {

      this.horse.boardPosX = element.boardPosX;
      this.horse.boardPosY = element.boardPosY;
      // присваиваем значение новой клетки , чтобы при ресайзинге конь не возвращался в прошлую позицию
      this.currentCell = element.id;

      this.moveHorse(element.domElement.getBoundingClientRect().x, element.domElement.getBoundingClientRect().y);

      this.highlightVariant();
    }
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