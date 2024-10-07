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
    _element = null;

    /**
     * Ссылка на DOM-элемент
     * @type {SVGCircleElement}
     * @private
     */
    _circlePercent = null;

    /**
     * Ссылка на DOM-элемент
     * @type {SVGCircleElement}
     * @private
     */
    _circleBackground = null;

    /**
     * Длина дуги
     * @type {number}
     * @private
     */
    _totalLength = 0;

    /**
     * Длина дуги, отображающей процент загрузки
     * @type {number}
     * @private
     */
    _loadedLength = 0;

    /**
     * Радиус круга
     * @type {number}
     * @private
     */
    _radius = 45;

    /**
     * Толщина круга
     * @type {number}
     * @private
     */
    _thickness = 10;

    /**
     * Процент выполнения (заливки)
     * @type {number}
     * @private
     */
    _value = 75;

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
    constructor(selector, options = {}) {
        this.element = selector;

        this._init(options);
    }

    /**
     * Установить элемент, который является индикатором прогресса
     * @type {number}
     * @param value
     * @returns void
     */
    set element(value) {
        if (value instanceof SVGElement) {
            this._element = value;
        }
        else {
            throw new Error('Element must be an instance of SVGElement');
        }
    }

    /**
     * Получить DOM-элемент, который является прогрессом
     * @type {number}
     * @returns SVGElement
     */
    get element() {
        return this._element;
    }

    set value(value) {
        if (value < 0 || value > 100) {
            throw new Error("Значение прогресса должно быть в диапазоне от 0 до 100 включительно");
        }

        this._value = this._validateForNumber(this._value, "процент выполнения", value);
        this._changeRenderedValue();
    }

    get value() {
        return this._value;
    }

    /**
     * Получить текущий радиус круга прогресса
     * @returns {number}
     */
    get radius() {
        return this._radius;
    }

    /**
     * Установить новый радиус круга прогресса
     * @param {Number} value
     */
    set radius(value) {
        if (value < 0) {
            throw new Error("Радиус должен быть больше 0");
        }

        this._radius = this._validateForNumber(this._radius, "радиус", value);
        this._resize();
    }

    /**
     * Получить текущую толщину круга
     * @returns {number}
     */
    get thickness() {
        return this._thickness;
    }

    /**
     * Установить новую толщину круга прогресса
     * @param {Number} value
     */
    set thickness(value) {
        if (value < 0) {
            throw new Error("Толщина должна быть больше 0");
        }

        this._thickness = this._validateForNumber(this.thickness, "толщина", value);

        this._circlePercent.setAttribute("stroke-width", `${this.thickness}`);
        this._circleBackground.setAttribute("stroke-width", `${this.thickness}`);

        this._resize();
    }

    get totalLength() {
        return this._totalLength;
    }

    /**
     *
     * @param {object} options
     * @private
     */
    _init(options) {
        // init start values
        this._radius = this._validateForNumber(this.radius, "радиус", options.radius);
        this._thickness = this._validateForNumber(this.thickness, "толщина", options.thickness);
        this._value = this._validateForNumber(this.value, "процент выполнения", options.value);

        this._circlePercent = this._getElementBySelectorOrElement(options.circlePercent) ??
            this.element.querySelector('#progress-percent');

        this._circleBackground = this._getElementBySelectorOrElement(options.circleBackground) ??
            this.element.querySelector('#progress-bg');

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

        this._resize();

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
     * @param {String} paramName - название переменной. используется при отображении ошибки
     * @param value - значение, которое нужно проверить
     * @private
     */
    _validateForNumber(defaultValue, paramName, value = null) {
        if (value) {
            if (typeof value !== "number") {
                throw new Error(`${paramName} должен быть числом`)
            }
            return value;
        }
        else {
            return defaultValue;
        }
    }

    /**
     * Возвращает элемент по его селектору или сам элемент
     * @param {HTMLElement | string} value
     * @returns {HTMLElement|null}
     * @private
     */
    _getElementBySelectorOrElement(value) {
        if (typeof value === "string") {
            return document.getElementById(value);
        }
        else if (value instanceof SVGCircleElement) {
            return value;
        }
        else {
            return null;
        }
    }

    /**
     * Запуск анимации вращения
     * @returns void
     */
    animate() {
        this.isAnimated = true;
        this.element.classList.add('animated');
    }

    /**
     * Прекращение анимации вращения
     * @returns void
     */
    cancelAnimation() {
        if (!this.isAnimated) return;

        this.isAnimated = false;
        this.element.classList.remove('animated');
    }

    /**
     * Скрыть элемент прогресса
     * @returns void
     */
    hide() {
        this.isHidden = true;
        this.element.classList.add("hidden");
    }

    /**
     * Показать элемент прогресса
     * @returns void
     */
    show() {
        if (!this.isHidden) return;

        this.isHidden = false;
        this.element.classList.remove("hidden");
    }

    /**
     * Выводит новое значение прогресса
     * @private
     * @returns void
     */
    _changeRenderedValue() {
        // 100% = 2 * Math.PI * radius
        // при value = 25 нужно оставить 75% от длины
        // при value = 50 нужно оставить 50% от длины
        // при value = 75 нужно оставить 25% от длины

        // ищем % от длины дуги
        const percentageLength = Math.ceil(this.totalLength / 100 * this._value);
        this._loadedLength = this.totalLength - percentageLength;
        this._circlePercent.style.strokeDashoffset = `${this._loadedLength}px`;
        this._circlePercent.style.strokeDasharray = `${this.totalLength}px`;
    }

    /**
     * Изменение радиуса прогресса
     * @private
     */
    _resize() {
        this._totalLength = (2 * Math.PI * this.radius);

        this._circlePercent.setAttribute("r", `${this._radius}`);
        this._circlePercent.setAttribute("cx", `${this._radius + this.thickness / 2}`);
        this._circlePercent.setAttribute("cy", `${this._radius + this.thickness / 2}`);

        this._circleBackground.setAttribute("r", `${this._radius}`);
        this._circleBackground.setAttribute("cx", `${this._radius + this.thickness / 2}`);
        this._circleBackground.setAttribute("cy", `${this._radius + this.thickness / 2}`);

        this.element.setAttribute("width", `${(this._radius * 2) + this.thickness}`);
        this.element.setAttribute("height", `${(this._radius * 2) + this.thickness}`);

        // считаем новые длины
        this._changeRenderedValue();
    }
}