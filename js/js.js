let Chess = {
  init() {
    this.getMobileInfo();
    this.createBoard();
    this.createCells();
    this.createHorse();
    this.createNewChessFigureField();
    this.highlightVariant();
    this.setListeners();
  },


  //ф-я обработки устройсва с которого зашли на сайт
  getMobileInfo() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.mobile = true;
      this.mobileFullscreenInfo = false;
    }
  },


  //создание доски и вызов ф-и которая определяет размеры блока;
  createBoard() {
    this.board = {};
    this.board.isDrag = false;
    this.board.coefficientResizing = 1;
    this.board.cellsCount = 64;
    this.board.domElement = document.createElement('div');
    this.board.domElement.classList.add('wrapper-field');

    document.body.insertBefore(this.board.domElement, document.body.firstChild);
    this.setBoardSize();
  },


  // определение размеров игровой доски
  setBoardSize() {
    // условие для всегда правильного квадрата и размера доски 90% от миннимального параметра экрана( высоты или ширины)
    if (document.body.offsetWidth >= document.body.offsetHeight) {
      this.board.domElement.style.width = window.innerHeight * 0.8 + 'px'
      this.board.domElement.style.height = window.innerHeight * 0.8 + 'px'
    } else {
      this.board.domElement.style.width = window.innerWidth * 0.8 + 'px'
      this.board.domElement.style.height = window.innerWidth * 0.8 + 'px'
    }
    // присвоение текущей ширины поля для вычисления ширины и высоты ячейки
    this.board.defaultSize = this.board.domElement.offsetWidth;
  },


  // создание ячеек поля + добавление позиции X,Y + добавление классов для окраса;
  createCells() {
    //  массив обьектов с параметрами позиции ячейки (x,y) + domElement
    this.board.cells = [];
    let x = 1, y = 8;
    for (let i = 0; i < this.board.cellsCount; i++) {
      this.board.cells[i] = {
        id: i + '',
        domElement: document.createElement('div')
      }
      // вставка в поле каждой отдельной ячейки и присвоение ячейки класса
      this.board.domElement.appendChild(this.board.cells[i].domElement);
      this.board.cells[i].domElement.classList.add('chess-cell');

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
        this.board.cells[i].domElement.classList.add('yellow-bg');
      } else {
        this.board.cells[i].domElement.classList.add('brown-bg');
      }
    }
  },


  //создание блока коня и вызов ф-и которая определяет его размеры;
  createHorse() {
    this.horse = {};
    this.horse.figureColor = 'black';
    this.currentCell = {};
    this.horse.domElement = document.createElement('div');
    this.horse.domElement.classList.add('horse');
    this.board.domElement.appendChild(this.horse.domElement);

    // рандомизируем первое место при загрузке страницы для коня
    this.horse.currentCell = Math.round(Math.random() * 63);

    this.setHorseParams();
  },


  // определение необходимых параметров коня
  setHorseParams() {
    // высоту и ширину коня определяем через css , но передаем значение в сво-во коня , чтобы определять размер пешек (пустышек)
    this.horse.defaultSizeCell = this.board.defaultSize * 0.124;

    //присвоение позициям X,Y для постановки на доску
    this.horse.posinionX = this.board.cells[this.horse.currentCell].domElement.getBoundingClientRect().left;
    this.horse.posinionY = this.board.cells[this.horse.currentCell].domElement.getBoundingClientRect().top;

    // определение позиции на шахматной доске
    this.horse.boardPosX = this.board.cells[this.horse.currentCell].boardPosX;
    this.horse.boardPosY = this.board.cells[this.horse.currentCell].boardPosY;

    // информация для центрированния курсора при захвате 
    this.board.halfWidthAndHightCell = this.horse.domElement.offsetWidth / 2;

    // поправки на установку коня в нужную ячейку учитывающие ширину и высоту доски и документа
    this.board.centeredPositionX = (document.body.offsetWidth - this.board.domElement.offsetWidth) / 2;
    this.board.centeredPositionY = (document.body.offsetHeight - this.board.domElement.offsetHeight) / 2;

    //перемещение коня в установленную рандомом ячейку
    this.moveChessFigure(this.horse.posinionX - this.board.centeredPositionX, this.horse.posinionY - this.board.centeredPositionY, this.horse);
  },


  //перерисовка поля и коня при изменении размеров + инвенты
  setListeners() {
    document.body.onresize = () => {
      this.setBoardSize();
      this.setHorseParams();
      this.setPawmFieldParams();
    }

    // добавление события клика на каждый элемент ячейки (ход коня + подсветка следующего варианта)
    this.board.cells.forEach(element => {
      element.domElement.addEventListener('click', (event) => {
        this.clickOnVariantJump(element, event);
      });
    });

    let dragStart, dragMove, dropEnd;
    // проверка на устройство и корректировка условий Drag&Drop
    if (this.mobile) {
      // код для мобильных устройств
      dragStart = 'touchstart';
      dragMove = 'touchmove';
      dropEnd = 'touchend';
      this.runMobileFullscreen();
    } else {
      dragStart = 'mousedown';
      dragMove = 'mousemove';
      dropEnd = 'mouseup';
    }

    // начало drag&drop для коня
    this.createDragStartListener(this.horse, this.horse, dragStart);
    //перемещение самого коня
    this.createDragMoveListener(this.board, this.horse, dragMove);
    // окончание движение мышки и дроп коня с  учетом того , что начался Драг
    this.createDropEndListener(this.horse, this.horse, dropEnd);

    // this.horse.domElement.addEventListener(dropEnd, (event) => {
    //   if (this.board.isDrag) {
    //     // переопределение позиции коня для корректной подсветки и растановке на поле
    //     let horsePosition = this.horse.domElement.getBoundingClientRect();
    //     this.board.cells.forEach(cell => {
    //       let cellPosition = cell.domElement.getBoundingClientRect();

    //       if ((cellPosition.top - horsePosition.top) < this.horse.halfWidthAndHightCell &&
    //         (cellPosition.left - horsePosition.left) < this.horse.halfWidthAndHightCell &&
    //         (cellPosition.right - horsePosition.right) < this.horse.halfWidthAndHightCell &&
    //         (cellPosition.bottom - horsePosition.bottom) < this.horse.halfWidthAndHightCell) {
    //         // определяем над какой ячейкой конь
    //         this.currentCell.id = cell.id;
    //         this.currentCell.position = cellPosition;
    //       }
    //     })

    //     //проверить состоялось ли перетаскивая коня (dragMove),если да выполнить анимацию
    //     let dragAnimateX, dragAnimateY;
    //     // вычисляем условия окончания драга для мобильного устройства (если перетаскивание елемента состоялось)
    //     if (this.mobile) {
    //       document.body.style.overscrollBehavior = 'auto';
    //       if (this.horse.startDragMousePositionX !== event.changedTouches[0].pageX && this.horse.startDragMousePositionY !== event.changedTouches[0].pageY) {
    //         dragAnimateX = (this.currentCell.position.x - event.changedTouches[0].pageX + this.horse.halfWidthAndHightCell) + 'px';
    //         dragAnimateY = (this.currentCell.position.y - event.changedTouches[0].pageY + this.horse.halfWidthAndHightCell) + 'px';
    //         //  анимируем окончания дропа
    //         this.promiseAnimate(this.horse.domElement, 'left', dragAnimateX, 150);
    //         this.promiseAnimate(this.horse.domElement, 'top', dragAnimateY, 150)
    //           .then(() => { this.highlightVariant(); });
    //       }
    //     }
    //     //определяем состоялолся ли drag&drop или просто кликнули по коню на пк
    //     else if (this.horse.startDragMousePositionX !== event.clientX && this.horse.startDragMousePositionY !== event.clientY) {
    //       //определяем растояние которое надо проанимировать (от места дропа мышки и до ячейки в которую конь будет становиться с учетом центрирования) + добавляем единицу измерения() для пк
    //       dragAnimateX = (this.currentCell.position.x - event.clientX + this.horse.halfWidthAndHightCell) + 'px';
    //       dragAnimateY = (this.currentCell.position.y - event.clientY + this.horse.halfWidthAndHightCell) + 'px';
    //       //  анимируем окончания дропа
    //       this.promiseAnimate(this.horse.domElement, 'left', dragAnimateX, 150);
    //       this.promiseAnimate(this.horse.domElement, 'top', dragAnimateY, 150)
    //         .then(() => { this.highlightVariant(); });
    //     }

    //     // обновляем данные коня если состоялся drag&drop
    //     this.horse.boardPosX = this.board.cells[this.currentCell.id].boardPosX;
    //     this.horse.boardPosY = this.board.cells[this.currentCell.id].boardPosY;

    //     // окончание дропа
    //     this.board.isDrag = false;
    //     // повторная подсветка 
    //     this.highlightVariant();

    //   }
    // })

    // ивенты связаны с пешками
    // this.addNewFigure('blackPawn');
  },


  // перемещение фигуры  коня на позицию с учетом поправки (если надо)
  moveChessFigure(newX, newY, figure) {
    figure.domElement.style.left = newX + 'px';
    figure.domElement.style.top = newY + 'px';
  },


  // метод подсветки
  highlightVariant() {
    //повторный вызов остановки подсветки для устранения мультиподсветки при быстрых кликах в drag&grop
    this.stopHighlightVariant();
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
        element.domElement.classList.add('variant-for-jump');
      }
    });
  },


  // метод отмены подсветки
  stopHighlightVariant() {
    this.board.cells.forEach(element => {
      element.domElement.classList.remove('variant-for-jump');
    })
  },


  //перемещение коня по клику на новую позицию с заменой данных
  clickOnVariantJump(element, event) {
    if (element.domElement.classList.contains('variant-for-jump')) {
      this.horse.boardPosX = element.boardPosX;
      this.horse.boardPosY = element.boardPosY;
      // присваиваем значение новой клетки , чтобы при ресайзинге конь не возвращался в прошлую позицию
      this.horse.currentCell = element.id;

      //останавливаем подсветку во время анимации 
      this.stopHighlightVariant();
      // просчитываем и передаем информации для анимации (в данном случае коня)
      this.preparationForAnimation(event);
    }
  },


  // обработка запуска фулскрина на телефоне
  runMobileFullscreen() {
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
            clicked = 0;
            if (!this.mobileFullscreenInfo) {
              document.body.webkitRequestFullScreen();
              this.mobileFullscreenInfo = true;
              //если уже находимся в фулскрине  , то выйти из него
            } else {
              document.exitFullscreen();
              this.mobileFullscreenInfo = false;
            }
            // сброс счетчика кликера если 2е отжатие затянулось ( что практически нереально )
          } else {
            clicked = 0;
          }
        }
      }
    });
  },


  // создание анимации с помощью промиса по данным которые расчитали
  promiseAnimate(elem, property, changeValue, duration) {
    // переопределяем this для корректной работы анимации и возможности использовать коэффициент ресайза
    let newThis = this
    //определяем суфикс (расчеты работают только для px и Nubmer)
    let suffix = changeValue.replace(/[0-9+-.,]/g, '')
    //получаем исходное состояния св-ва которое будем анимировать
    let startValue = parseFloat(window.getComputedStyle(elem).getPropertyValue(property), 10);

    //отрисовка анимации св-ва
    function render(timePassed) {
      elem.style[property] = (startValue + ((timePassed / duration) * (parseFloat(changeValue, 10)))) + suffix;
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
  preparationForAnimation(event) {
    let firstDirection, secondtDirection, firstLenght, secondLenght, elemHorse = this.horse.domElement;

    // определяем направление первоначального движения(сначало фигура коня проходит 2 клетки потом 1)
    if (Math.abs(event.target.offsetLeft - elemHorse.offsetLeft) > Math.abs(event.target.offsetTop - elemHorse.offsetTop)) {
      firstDirection = 'left';
      secondtDirection = 'top';
      // определяем величину на которую необходимо переместить фигуру с учетом знака
      firstLenght = (event.target.offsetLeft - elemHorse.offsetLeft) + 'px';
      secondLenght = (event.target.offsetTop - elemHorse.offsetTop) + 'px';
    }
    else {
      firstDirection = 'top';
      secondtDirection = 'left';
      firstLenght = (event.target.offsetTop - elemHorse.offsetTop) + 'px';
      secondLenght = (event.target.offsetLeft - elemHorse.offsetLeft) + 'px';
    }

    // анимация по расчитаным значениям
    this.promiseAnimate(elemHorse, firstDirection, firstLenght, 600)
      .then(() => this.promiseAnimate(elemHorse, secondtDirection, secondLenght, 300))
      .then(() => this.highlightVariant())
  },


  // создание  поля в котором будут находится "пешки" которые можно перетащить на поле
  createNewChessFigureField() {
    this.createNewChessFigure = {};
    this.createNewChessFigure.blackPawn = {};
    this.createNewChessFigure.whitePawn = {};

    //поле в котором будут находится блоки для создания пешек
    this.createNewChessFigure.createFieldDomElem = document.createElement('div');
    this.createNewChessFigure.createFieldDomElem.classList.add('create-pawns');
    document.body.appendChild(this.createNewChessFigure.createFieldDomElem);

    //создание блоков , которые будут генерировать игровые пешки 
    this.createNewChessFigure.blackPawn.figureColor = 'black'
    this.createNewChessFigure.blackPawn.creator = document.createElement('div');
    this.createNewChessFigure.blackPawn.creator.classList.add('black-pawn-creator');
    this.createNewChessFigure.createFieldDomElem.appendChild(this.createNewChessFigure.blackPawn.creator);

    this.createNewChessFigure.whitePawn.figureColor = 'white'
    this.createNewChessFigure.whitePawn.creator = document.createElement('div');
    this.createNewChessFigure.whitePawn.creator.classList.add('white-pawn-creator');
    this.createNewChessFigure.createFieldDomElem.appendChild(this.createNewChessFigure.whitePawn.creator);

    this.setPawmFieldParams();
  },


  //установка размеров для поля создания пешек и его составляющих
  setPawmFieldParams() {
    // определения размоложения поля 
    if (document.body.offsetWidth >= document.body.offsetHeight) {
      this.createNewChessFigure.createFieldDomElem.style.flexDirection = 'column';
      // если ширина больше высоты , то поле "прибито к левой стороне"
      this.createNewChessFigure.createFieldDomElem.style.top = (document.body.offsetHeight / 2 - this.horse.defaultSizeCell) + 'px';
      this.createNewChessFigure.createFieldDomElem.style.left = '5px';
    } else {
      this.createNewChessFigure.createFieldDomElem.style.flexDirection = 'row';
      // если ширина меньше высоты , то поле "прибито к верху"
      this.createNewChessFigure.createFieldDomElem.style.top = 0;
      this.createNewChessFigure.createFieldDomElem.style.left = (document.body.offsetWidth / 2 - this.horse.defaultSizeCell) + 'px';
    }
    // определение размеров пешек в соответствии с размерами коня и шахматной ячейки
    this.createNewChessFigure.blackPawn.creator.style.width = this.horse.defaultSizeCell + 'px';
    this.createNewChessFigure.blackPawn.creator.style.height = this.horse.defaultSizeCell + 'px';

    this.createNewChessFigure.whitePawn.creator.style.width = this.horse.defaultSizeCell + 'px';
    this.createNewChessFigure.whitePawn.creator.style.height = this.horse.defaultSizeCell + 'px';
  },


  //создание ивента начала drag
  createDragStartListener(listnerFigure, moveFigure, dragStart) {
    listnerFigure.domElement.addEventListener(dragStart, (event) => {
      // фиксит прилипание  фигуры к мыше если многократно клацать на фигуру во время движения
      event.preventDefault();

      if (!this.board.isDrag) {
        //удаляем подсветку если нажали на коня и готовы передвинуть его
        this.stopHighlightVariant();
        //запоминаем координаны начала drag&drop для анализа "было ли перемещения фигуры"
        if (this.mobile) {
          moveFigure.startDragMousePositionX = event.changedTouches[0].pageX;
          moveFigure.startDragMousePositionY = event.changedTouches[0].pageY;
          //отключаем  возможность обновлять страницу свайпом вниз после окончания drag&drop
          document.body.style.overscrollBehavior = 'none';
        } else {
          moveFigure.startDragMousePositionX = event.clientX;
          moveFigure.startDragMousePositionY = event.clientY;
        }
        this.board.isDrag = true;
      }
    })
  },


  //создание ивента перемешения drag
  createDragMoveListener(listnerFigure, moveFigure, dragMove) {
    listnerFigure.domElement.addEventListener(dragMove, (event) => {
      if (this.board.isDrag) {
        let moveOnX, moveOnY;
        // вызов ф-и передвижения коня следом за курсором мыши ((курсор всегда по центру коня)) с учетом проверки ПК или нет
        if (this.mobile) {
          //определение координат при использовании тача с учетом отступов от body до board + курсор всегда по центру
          moveOnX = event.changedTouches[0].pageX - this.board.centeredPositionX - listnerFigure.halfWidthAndHightCell;
          moveOnY = event.changedTouches[0].pageY - this.board.centeredPositionY - listnerFigure.halfWidthAndHightCell;
        } else {
          //определение координат при использовании мышки с учетом отступов от body до board + курсор всегда по центру
          moveOnX = event.pageX - this.board.centeredPositionX - listnerFigure.halfWidthAndHightCell;
          moveOnY = event.pageY - this.board.centeredPositionY - listnerFigure.halfWidthAndHightCell;
        }
        this.moveChessFigure(moveOnX, moveOnY, moveFigure);
      }
    })
  },


  //создание ивента окончания drop
  createDropEndListener(listnerFigure, moveFigure, dropEnd) {
    listnerFigure.domElement.addEventListener(dropEnd, (event) => {
      this.board.isDrag = false;
      //присваимваем координады мышки или тача после окончания дропа , чтобы в цикле не переопределять с каждым вызовом
      let dropEndCoordinateX, dropEndCoordinateY;
      if (this.mobile) {
        document.body.style.overscrollBehavior = 'auto';
        dropEndCoordinateX = event.changedTouches[0].pageX;
        dropEndCoordinateY = event.changedTouches[0].pageY;
      } else {
        dropEndCoordinateX = event.clientX;
        dropEndCoordinateY = event.clientY;
      }

      // условие дропа за пределами доски  и возвращение фигуры в исходную позицию с которой начался drag&drop
      if ((dropEndCoordinateX < this.board.centeredPositionX) || (dropEndCoordinateX > this.board.centeredPositionX + this.board.defaultSize)
        || (dropEndCoordinateY < this.board.centeredPositionY) || (dropEndCoordinateY > this.board.centeredPositionY + this.board.defaultSize)) {

        // расчитываем величину анимации с учетом , что курсор мышки находится ровно по центру фигуры , а позицианируется все относительно верхнего левого угла
        let outFromBordX = (moveFigure.posinionX - dropEndCoordinateX + this.board.halfWidthAndHightCell) + 'px';
        let outFromBordY = (moveFigure.posinionY - dropEndCoordinateY + this.board.halfWidthAndHightCell) + 'px';

        //выполняем анимацию возвращения на исходную позицию , если дропнули за пределами доски
        this.promiseAnimate(moveFigure.domElement, 'left', outFromBordX, 200);
        this.promiseAnimate(moveFigure.domElement, 'top', outFromBordY, 200)
          .then(() => this.highlightVariant())
      }
      //проверяем состоялся ли dragMove на доске (сравнением координат начала и окончания drag&drop)
      else if (moveFigure.startDragMousePositionX !== dropEndCoordinateX && moveFigure.startDragMousePositionY !== dropEndCoordinateY) {

        //определяем сторону "игровой клетки" для вычисления клетки в которую необходимо выполнить анимацию dropEnd
        let sizeOfCell = this.board.halfWidthAndHightCell * 2;
        let dropEndCell, cellPosition, cellId;
        /* условие по которому определяем ячейку на которой состоялся dropEnd (начало клетки по X и Y опреляем с помощью getBoundingClientRect() + величину стороны клетки тем самым находим кооридантую ширину и 
         высоту для каждой ячейки) и сравниваем с координатой мыши/тача , если  она входит в диапазон высота-ширина клетки то прервываем цикл и сохраняем данные найденой ячейки*/
        for (let i = 0; i < this.board.cellsCount; i++) {
          cellPosition = this.board.cells[i].domElement.getBoundingClientRect();
          if ((dropEndCoordinateX > cellPosition.x && dropEndCoordinateX < cellPosition.x + sizeOfCell) && (dropEndCoordinateY > cellPosition.y && dropEndCoordinateY < cellPosition.y + sizeOfCell)) {
            dropEndCell = this.board.cells[i];
            cellId = i;
            break
          }
        }

        //вычисляем растояние , которое надо проанимировать и добавляем px для определения суфикса
        let dropAnimateX = (cellPosition.x - dropEndCoordinateX + this.board.halfWidthAndHightCell) + 'px';
        let dropAnimateY = (cellPosition.y - dropEndCoordinateY + this.board.halfWidthAndHightCell) + 'px';

        this.promiseAnimate(moveFigure.domElement, 'left', dropAnimateX, 50);
        this.promiseAnimate(moveFigure.domElement, 'top', dropAnimateY, 50)
          .then(() => this.highlightVariant())

        // обновляем данные коня если состоялся drag & drop
        moveFigure.boardPosX = dropEndCell.boardPosX;
        moveFigure.boardPosY = dropEndCell.boardPosY;
        moveFigure.posinionX = cellPosition.left;
        moveFigure.posinionY = cellPosition.top;
        moveFigure.currentCell = cellId;

      } else {
        console.log('some Err');
        // если же просто кликнули по фируге без перемещения подсветчиваем клетки и 
        this.highlightVariant();
      }



    })

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