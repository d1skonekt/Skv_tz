let Chess = {
  init: function () {
    this.getMobileInfo();
    this.createBoard();
    this.createCells();
    this.createHorse();
    this.highlightVariant();
    this.setListeners();
    this.runMobileFullscreen();
  },

  getMobileInfo: function () {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.mobile = true;
      this.mobileFullscreenInfo = false;
    }
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
      this.board.domElement.style.width = window.innerHeight * 0.9 + 'px'
      this.board.domElement.style.height = window.innerHeight * 0.9 + 'px'
    } else {
      this.board.domElement.style.width = window.innerWidth * 0.9 + 'px'
      this.board.domElement.style.height = window.innerWidth * 0.9 + 'px'
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
    this.horse.posinionX = this.board.cells[this.currentCell].domElement.getBoundingClientRect().left;
    this.horse.posinionY = this.board.cells[this.currentCell].domElement.getBoundingClientRect().top;


    // определение позиции на шахматной доске
    this.horse.boardPosX = this.board.cells[this.currentCell].boardPosX;
    this.horse.boardPosY = this.board.cells[this.currentCell].boardPosY;

    // информация для центрированния курсора при захвате
    this.horse.correctionInfo = this.horse.domElement.offsetWidth / 2;

    // поправки на установку коня в нужную ячейку учитывающие ширину и высоту доски и документа

    this.horse.correctionX = (document.body.offsetWidth - this.board.domElement.offsetWidth) / 2;
    this.horse.correctionY = (document.body.offsetHeight - this.board.domElement.offsetHeight) / 2;
    //  при повернутом телефоне учет адресной строки телефона для позиционирования

    this.moveChessFigure(this.horse.posinionX - this.horse.correctionX, this.horse.posinionY - this.horse.correctionY);

  },


  //перерисовка поля и коня при изменении размеров
  setListeners: function () {
    document.body.onresize = () => {
      this.setBoardSize();
      this.setHorseParams();
    }

    // добавление события клика на каждый элемент ячейки (ход коня + подсветка следующего варианта)
    this.board.cells.forEach(element => {
      element.domElement.addEventListener('click', (event) => {
        this.clickOnVariantJump(element, event);
      });
    });

    // проверка на устройство и корректировка условий Drag&Drop
    if (this.mobile) {
      // код для мобильных устройств
      var dragStart = 'touchstart';
      var dragMove = 'touchmove';
      var dropEnd = 'touchend';
    } else {
      var dragStart = 'mousedown';
      var dragMove = 'mousemove';
      var dropEnd = 'mouseup';
      var mouseDrag = true;
    }

    //Клик мышки по коню (grad & drop)
    this.horse.domElement.addEventListener(dragStart, (event) => {
      document.body.style.overscrollBehavior = 'none';
      if (event.target.classList.contains('horse')) {
        this.horse.isDrag = true;
        //удаляем подсветку если нажали на коня и готовы передвинуть его
        this.stopHighlightVariant();
      }
    })

    this.board.domElement.addEventListener(dragMove, (event) => {
      if (this.horse.isDrag) {
        // вызов ф-и передвижения коня следом за курсором мыши ((курсор всегда по центру коня)) с учетом проверки ПК или нет
        if (mouseDrag) {
          var moveOnX = event.pageX - this.horse.correctionX;
          var moveOnY = event.pageY - this.horse.correctionY;
        } else {
          //определение координат при использовании тача
          var moveOnX = event.changedTouches[0].pageX - this.horse.correctionX;
          var moveOnY = event.changedTouches[0].pageY - this.horse.correctionY;
        }
        this.moveChessFigure(moveOnX - this.horse.correctionInfo, moveOnY - this.horse.correctionInfo);
      }
    })

    // окончание движение мышки и дроп коня с  учетом того , что начался Драг
    this.horse.domElement.addEventListener(dropEnd, () => {
      document.body.style.overscrollBehavior = 'auto';
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
        //Передвигаем точно коня в центр дропнутой ячейки и обновляем  информацию коня
        this.moveChessFigure(this.board.cells[this.currentCell].domElement.getBoundingClientRect().x - this.horse.correctionX, this.board.cells[this.currentCell].domElement.getBoundingClientRect().y - this.horse.correctionY);
        this.horse.boardPosX = this.board.cells[this.currentCell].boardPosX;
        this.horse.boardPosY = this.board.cells[this.currentCell].boardPosY;
        // окончание дропа
        this.horse.isDrag = false;
        //повторно подсвечиваем ячейки для возможного передвижения после Дропа
        this.highlightVariant();
      }
    })
  },

  // перемещение фигуры  коня на позицию с учетом поправки (если надо)
  moveChessFigure: function (newX, newY) {
    this.horse.domElement.style.left = newX + 'px';
    this.horse.domElement.style.top = newY + 'px';

  },

  // метод отмены подсветки
  stopHighlightVariant: function () {
    this.board.cells.forEach(element => {
      element.domElement.classList.remove('variant_for_jump');
    })
  },

  // метод подсветки
  highlightVariant: function () {
    let activeX = this.horse.boardPosX;
    let activeY = this.horse.boardPosY;
    // перебераем все елементы массива с ячейками и удаляем после клика подсвеченые элементы относительно старой позиции
    this.board.cells.forEach(element => {
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
  clickOnVariantJump: function (element, event) {
    if (element.domElement.classList.contains('variant_for_jump')) {

      this.horse.boardPosX = element.boardPosX;
      this.horse.boardPosY = element.boardPosY;
      // присваиваем значение новой клетки , чтобы при ресайзинге конь не возвращался в прошлую позицию
      this.currentCell = element.id;


      this.stopHighlightVariant();
      this.preparationForAnimation(event);

      // this.moveChessFigure(element.domElement.getBoundingClientRect().x - this.horse.correctionX, element.domElement.getBoundingClientRect().y - this.horse.correctionY);



      // this.highlightVariant();
    }
  },


  // обработка запуска фулскрина на телефоне
  runMobileFullscreen: function () {
    // эмуляция двойного клика по экрану  которая привязана к document.body
    let downTime, upTime, clicked = 0;


    document.body.addEventListener('touchstart', (event) => {
      if (event.target.tagName === 'BODY') {
        //проверка на первый клик
        if (clicked === 0) {
          downTime = Date.now()
          clicked = 1;
          //проверка на 2й клик и принятие решения это обычный клик или нет
        } else if (clicked === 1) {
          checkCkick = Date.now()
          if (checkCkick - downTime < 1000) {
            clicked = 2;
          } else {
            clicked = 1;
            downTime = Date.now()
          }
        }
      }
    });

    document.body.addEventListener('touchend', (event) => {
      //если это двойной клик то вызвать фулскрин при условии что он не вызван
      if (event.target.tagName === 'BODY') {
        if (clicked === 2) {
          upTime = Date.now()
          if (upTime - downTime < 1500) {
            console.log('dblCkick')
            clicked = 0;
            if (!this.fullscreenInfo) {
              document.body.webkitRequestFullScreen();
              this.fullscreenInfo = true;
              //если уже находимся в фулскрине  , то выйти из него
            } else {
              document.exitFullscreen();
              this.fullscreenInfo = false;
            }
            // сброс счетчика кликера если 2е отжатие затянулось ( что практически нереально )
          } else {
            clicked = 0;
          }
        }
      }
    });
  },


  promiseAnimate: function (elem, property, changeValue, duration) {
    let startValue, suffix;
    //определяем суфикс (расчеты работают только для px и Nubmer)
    suffix = changeValue.replace(/[0-9+-.,]/g, '')

    //получаем исходное состояния св-ва которое будем анимировать
    startValue = parseFloat(window.getComputedStyle(elem).getPropertyValue(property), 10);

    //отрисовка анимации св-ва
    function render(timePassed) {
      elem.style[property] = startValue + ((timePassed / duration) * (parseFloat(changeValue, 10))) + suffix;
    }


    let promise = new Promise(function (resolve, reject) {
      let start = performance.now();

      requestAnimationFrame(function anime(time) {
        // определить, сколько прошло времени с начала анимации
        let timePassed = time - start;

        // возможно небольшое превышение времени, в этом случае зафиксировать конец
        if (timePassed > duration) { timePassed = duration; resolve(console.log('promise done')); }

        // нарисовать состояние анимации в момент timePassed
        render(timePassed);

        // если время анимации не закончилось - запланировать ещё кадр
        if (timePassed < duration) {
          requestAnimationFrame(anime)
        }
      })
    })
    return promise
  },

  // подготовка к анимации (вычисления направления и величины перемещения)
  preparationForAnimation: function (event) {
    let firstProperty, secondProperty, firsrValue, secondValue, elemHorse = this.horse.domElement;

    if (Math.abs(event.target.offsetLeft - elemHorse.offsetLeft) > Math.abs(event.target.offsetTop - elemHorse.offsetTop)) {
      firstProperty = 'left';
      secondProperty = 'top';
      firsrValue = (event.target.offsetLeft - elemHorse.offsetLeft) + 'px';
      secondValue = (event.target.offsetTop - elemHorse.offsetTop) + 'px';
    }
    else {
      firstProperty = 'top';
      secondProperty = 'left';
      firsrValue = (event.target.offsetTop - elemHorse.offsetTop) + 'px';
      secondValue = (event.target.offsetLeft - elemHorse.offsetLeft) + 'px';
    }

    this.promiseAnimate(elemHorse, firstProperty, firsrValue, 1000)
      .then(() => this.promiseAnimate(elemHorse, secondProperty, secondValue, 1000))
      .then(() => this.highlightVariant())
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