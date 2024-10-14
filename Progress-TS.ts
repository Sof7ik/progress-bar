type initObject = {
    circlePercent?: SVGCircleElement,
    circleBackground?: SVGCircleElement,
    totalLength?: number,
    loadedLength?: number,
    radius?: number,
    thickness?: number,
    value?: number,
    animated?: boolean,
    hidden?: boolean
}


/**
 * Класс управления элементом прогресса
 * @class
 * @classdesc Прогресс
 * @author Leonid Bychkov [web@leobychkov.ru]
 * @date 30.09.2024
 * @link https://github.com/Sof7ik/progress-bar
 */
class Progress {
    /**
     * Ссылка на DOM-элемент
     * @type {SVGElement}
     * @private
     */
    private _element: SVGElement = null;

    /**
     * Ссылка на DOM-элемент
     * @type {SVGCircleElement}
     * @private
     */
    private _circlePercent: SVGCircleElement = null;

    /**
     * Ссылка на DOM-элемент
     * @type {SVGCircleElement}
     * @private
     */
    private _circleBackground: SVGCircleElement = null;

    /**
     * Длина дуги
     * @type {number}
     * @private
     */
    private _totalLength: number = 0;

    /**
     * Длина дуги, отображающей процент загрузки
     * @type {number}
     * @private
     */
    private _loadedLength:number = 0;

    /**
     * Радиус круга
     * @type {number}
     * @private
     */
    private _radius: number = 45;

    /**
     * Толщина круга
     * @type {number}
     * @private
     */
    private _thickness: number = 10;

    /**
     * Процент выполнения (заливки)
     * @type {number}
     * @private
     */
    public value: number = 75;

    public isAnimated: boolean = false;
    public isHidden: boolean = false;

    /**
     * @param {SVGElement} selector - Ссылка на SVG-элемент
     * @param {object} options - объект настроек
     * @param {Number} options.value - значение прогресса
     * @param {Boolean} options.animated - включать сразу анимацию вращения?
     * @param {Boolean} options.hidden - скрыть элемент по умолчанию?
     * @param {Number} options.radius - радиус круга
     * @param {Number} options.thickness - толщина круга
     * @param {SVGCircleElement | string} options.circlePercent - ссылка на DOM-элемент или ID элемента, отображающий процент выполнения
     * @param {SVGCircleElement | string} options.circleBackground - ссылка на DOM-элемент или ID элемента, отображающий дугу прогресса
     */
    constructor(selector: SVGElement, options: initObject = {}) {
        this._element = selector;
        this.init(options);
    }

    /**
     * Установить элемент, который является индикатором прогресса
     * @type {number}
     * @param value
     * @returns void
     */
    set element(value: SVGElement) {
        this._element = value;
    }

    /**
     * Получить DOM-элемент, который является прогрессом
     * @type {number}
     * @returns SVGElement
     */
    public get element(): SVGElement {
        return this._element;
    }

    /**
     * Получить текущий радиус круга прогресса
     * @returns {number}
     */
    public get radius():number {
        return this._radius;
    }

    /**
     * Установить новый радиус круга прогресса
     * @param {Number} value
     */
    public set radius(value: number) {
        if (value < 0) {
            throw new Error("Радиус должен быть больше 0");
        }

        this._radius = this.validateForNumber(this._radius, value);
        this.resize();
    }

    /**
     * Получить текущую толщину круга
     * @returns {number}
     */
    public get thickness(): number {
        return this._thickness;
    }

    /**
     * Получить длину дуги
     * @return {number}
     */
    public get totalLength(): number {
        return this._totalLength;
    }

    /**
     *
     * @param {object} options
     * @private
     */
    private init(options: initObject): void {
        // init start values
        this._radius = this.validateForNumber(this._radius, options.radius);
        this.thickness = this.validateForNumber(this._thickness, options.thickness);
        this.value = this.validateForNumber(this.value, options.value);

        this._circlePercent = options.circlePercent ?? this._element.querySelector('#progress-percent');

        this._circleBackground = options.circleBackground ?? this._element.querySelector('#progress-bg');

        if (!this._circlePercent) {
            throw new Error("Ошибка при инициализации дуги прогресса");
        }
        if (!this._circleBackground) {
            throw new Error("Ошибка при инициализации дуги прогресса");
        }

        this.isAnimated = options.animated ?? false;
        this.isHidden = options.hidden ?? false;

        this._circlePercent.setAttribute("stroke-width", `${this.thickness}`);
        this._circleBackground.setAttribute("stroke-width", `${this.thickness}`);

        this.resize();

        if (this.isHidden) {
            this.hide();
        }

        if (!this.isHidden && this.isAnimated) {
            this.animate();
        }

        if (this.isAnimated && this.isHidden) {
            throw new Error("Блок не может быть скрытым и анимированным одновременно");
        }
    }

    /**
     * Проверяет, является ли переданное значение числом и возвращает его, иначе возвращает значение по умолчанию
     * @param {Number} defaultValue - значение по умолчанию
     * @param value - значение, которое нужно проверить
     * @private
     */
    private validateForNumber(defaultValue: number, value: number = null):number {
        return value ?? defaultValue;
    }

    /**
     * Выводит новое значение прогресса
     * @private
     * @returns void
     */
    private changeRenderedValue():void {
        // 100% = 2 * Math.PI * radius
        // при value = 25 нужно оставить 75% от длины
        // при value = 50 нужно оставить 50% от длины
        // при value = 75 нужно оставить 25% от длины

        // ищем % от длины дуги
        const percentageLength = Math.ceil(this._totalLength / 100 * this.value);
        this._loadedLength = this._totalLength - percentageLength;
        this._circlePercent.style.strokeDashoffset = `${this._loadedLength}px`;
        this._circlePercent.style.strokeDasharray = `${this._totalLength}px`;
    }

    /**
     * Изменение радиуса прогресса
     * @private
     */
    private resize(): void {
        this._totalLength = (2 * Math.PI * this._radius);

        this._circlePercent.setAttribute("r", `${this._radius}`);
        this._circlePercent.setAttribute("cx", `${this._radius + this.thickness / 2}`);
        this._circlePercent.setAttribute("cy", `${this._radius + this.thickness / 2}`);

        this._circleBackground.setAttribute("r", `${this._radius}`);
        this._circleBackground.setAttribute("cx", `${this._radius + this.thickness / 2}`);
        this._circleBackground.setAttribute("cy", `${this._radius + this.thickness / 2}`);

        this._element.setAttribute("width", `${(this._radius * 2) + this.thickness}`);
        this._element.setAttribute("height", `${(this._radius * 2) + this.thickness}`);

        // считаем новые длины
        this.changeRenderedValue();
    }

    /**
     * Запуск анимации вращения
     * @returns void
     */
    public animate():void {
        this.isAnimated = true;
        this._element.classList.add('animated');
    }

    /**
     * Прекращение анимации вращения
     * @returns void
     */
    public cancelAnimation(): void {
        if (!this.isAnimated) return;

        this.isAnimated = false;
        this._element.classList.remove('animated');
    }

    /**
     * Скрыть элемент прогресса
     * @returns void
     */
    public hide(): void {
        this.isHidden = true;
        this._element.classList.add("hidden");
    }

    /**
     * Показать элемент прогресса
     * @returns void
     */
    public show():void {
        if (!this.isHidden) return;

        this.isHidden = false;
        this._element.classList.remove("hidden");
    }

    /**
     * Установить новую толщину круга прогресса
     * @param {Number} value
     */
    public set thickness(value: number) {
        if (value < 0) {
            throw new Error("Толщина должна быть больше 0");
        }

        this._thickness = this.validateForNumber(this._thickness, value);

        this._circlePercent.setAttribute("stroke-width", `${this._thickness}`);
        this._circleBackground.setAttribute("stroke-width", `${this._thickness}`);

        this.resize();
    }
}