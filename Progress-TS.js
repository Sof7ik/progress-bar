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
        /**
         * Ссылка на DOM-элемент
         * @type {SVGElement}
         * @private
         */
        this._element = null;
        /**
         * Ссылка на DOM-элемент
         * @type {SVGCircleElement}
         * @private
         */
        this._circlePercent = null;
        /**
         * Ссылка на DOM-элемент
         * @type {SVGCircleElement}
         * @private
         */
        this._circleBackground = null;
        /**
         * Длина дуги
         * @type {number}
         * @private
         */
        this._totalLength = 0;
        /**
         * Длина дуги, отображающей процент загрузки
         * @type {number}
         * @private
         */
        this._loadedLength = 0;
        /**
         * Радиус круга
         * @type {number}
         * @private
         */
        this._radius = 45;
        /**
         * Толщина круга
         * @type {number}
         * @private
         */
        this._thickness = 10;
        /**
         * Процент выполнения (заливки)
         * @type {number}
         * @private
         */
        this.value = 75;
        this.isAnimated = false;
        this.isHidden = false;
        this._element = selector;
        this.init(options);
    }
    /**
     * Установить элемент, который является индикатором прогресса
     * @type {number}
     * @param value
     * @returns void
     */
    set element(value) {
        this._element = value;
    }
    /**
     * Получить DOM-элемент, который является прогрессом
     * @type {number}
     * @returns SVGElement
     */
    get element() {
        return this._element;
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
        this._radius = this.validateForNumber(this._radius, value);
        this.resize();
    }
    /**
     * Получить текущую толщину круга
     * @returns {number}
     */
    get thickness() {
        return this._thickness;
    }
    /**
     * Получить длину дуги
     * @return {number}
     */
    get totalLength() {
        return this._totalLength;
    }
    /**
     *
     * @param {object} options
     * @private
     */
    init(options) {
        var _a, _b, _c, _d;
        // init start values
        this._radius = this.validateForNumber(this._radius, options.radius);
        this._circlePercent = (_a = options.circlePercent) !== null && _a !== void 0 ? _a : this._element.querySelector('#progress-percent');
        this._circleBackground = (_b = options.circleBackground) !== null && _b !== void 0 ? _b : this._element.querySelector('#progress-bg');
        console.log("this._circlePercent", this._circlePercent);
        this.thickness = this.validateForNumber(this._thickness, options.thickness);
        this.value = this.validateForNumber(this.value, options.value);
        if (!this._circlePercent) {
            throw new Error("Ошибка при инициализации дуги прогресса");
        }
        if (!this._circleBackground) {
            throw new Error("Ошибка при инициализации дуги прогресса");
        }
        this.isAnimated = (_c = options.animated) !== null && _c !== void 0 ? _c : false;
        this.isHidden = (_d = options.hidden) !== null && _d !== void 0 ? _d : false;
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
    validateForNumber(defaultValue, value = null) {
        return value !== null && value !== void 0 ? value : defaultValue;
    }
    /**
     * Выводит новое значение прогресса
     * @private
     * @returns void
     */
    changeRenderedValue() {
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
    resize() {
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
    animate() {
        this.isAnimated = true;
        this._element.classList.add('animated');
    }
    /**
     * Прекращение анимации вращения
     * @returns void
     */
    cancelAnimation() {
        if (!this.isAnimated)
            return;
        this.isAnimated = false;
        this._element.classList.remove('animated');
    }
    /**
     * Скрыть элемент прогресса
     * @returns void
     */
    hide() {
        this.isHidden = true;
        this._element.classList.add("hidden");
    }
    /**
     * Показать элемент прогресса
     * @returns void
     */
    show() {
        if (!this.isHidden)
            return;
        this.isHidden = false;
        this._element.classList.remove("hidden");
    }
    /**
     * Установить новую толщину круга прогресса
     * @param {Number} value
     */
    set thickness(value) {
        if (value < 0) {
            throw new Error("Толщина должна быть больше 0");
        }
        this._thickness = this.validateForNumber(this._thickness, value);
        this._circlePercent.setAttribute("stroke-width", `${this._thickness}`);
        this._circleBackground.setAttribute("stroke-width", `${this._thickness}`);
        this.resize();
    }
}
//# sourceMappingURL=Progress-TS.js.map