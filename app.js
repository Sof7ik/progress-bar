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
    _radius = 0;

    /**
     * @param {SVGElement} selector - Ссылка на SVG-элемент
     * @param {object} options - объект настроек
     * @param {Number} options.value - значение прогресса
     * @param {Boolean} options.animated - включать сразу анимацию вращения?
     * @param {Boolean} options.hidden - скрыть элемент по умолчанию?
     */
    constructor(selector, options = {}) {
        // init start values
        this._value = options.value ?? 75;
        this.isAnimated = options.hidden ?? false;
        this.isHidden = options.animated ?? false;

        this.element = selector;

        this._circlePercent = selector.querySelector('#progress-percent');
        this._circleBackground = selector.querySelector('#progress-bg');

        // calculate default values
        this._radius = Number(this._circlePercent.getAttribute("r"));
        this._totalLength = Math.ceil(2 * Math.PI * this._radius);

        // render default state
        this._circlePercent.style.strokeDasharray = `${this._totalLength}px`;
        this.#changeRenderedValue();

        if (this.isHidden) this.hide();

        if (!this.isHidden && this.isAnimated) this.animate();
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

        this._value = value;
        this.#changeRenderedValue();
    }

    get value() {
        return this._value;
    }

    /**
     * Запуск анимации вращения
     * @returns void
     */
    animate() {
        if (this.isAnimated) return;

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
        if (this.isHidden) return;

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
    #changeRenderedValue() {
        // 100% = 2 * Math.PI * radius
        // при value = 25 нужно оставить 75% от длины
        // при value = 50 нужно оставить 50% от длины
        // при value = 75 нужно оставить 25% от длины

        // ищем % от длины дуги
        const percentageLength = Math.ceil(this._totalLength / 100 * this._value);
        this._loadedLength = this._totalLength - percentageLength;
        this._circlePercent.style.strokeDashoffset = `${this._loadedLength}px`;
    }
}

/**
 * Срабатывает при изменении состояния чекбокса "Animate"
 * @param event
 */
function onAnimateCheckboxChanged(event) {
    const checkbox = event.currentTarget;

    if (checkbox.checked) {
        window.progressComponent.animate();
    }
    else {
        window.progressComponent.cancelAnimation();
    }
}

/**
 * Срабатывает при изменении состояния чекбокса "Hide"
 * @param event
 */
function onHideCheckboxChanged(event) {
    const checkbox = event.currentTarget;
    const progressComponent = window.progressComponent;

    if (!progressComponent) return;

    if (checkbox.checked) {
        if (progressComponent.isAnimated) progressComponent.cancelAnimation();
        window.animateCheckbox.checked = false;
        window.animateCheckbox.setAttribute("disabled", "true");
        window.progressComponent.hide();
    }
    else {
        window.progressComponent.show();
        window.animateCheckbox.removeAttribute("disabled");
    }
}

/**
 * Срабатывает при изменении значения поля ввода для процента загрузки
 * @param event
 */
function onInputValueChange(event) {
    const progressComponent = window.progressComponent;
    if (!progressComponent) return;

    progressComponent.value = Number(event.currentTarget.value);
}

document.addEventListener("DOMContentLoaded", () => {
    window.animateCheckbox = document.getElementById("progress-control__animate");

    const progressSvg = document.getElementById('progress-circle');
    const valueInput = document.getElementById("progress-control__value");
    const hideCheckbox = document.getElementById("progress-control__hide");

    animateCheckbox.addEventListener("change", onAnimateCheckboxChanged);
    hideCheckbox.addEventListener("change", onHideCheckboxChanged);
    valueInput.addEventListener('change', onInputValueChange);


    window.progressComponent = new Progress(progressSvg);

    valueInput.value = progressComponent.value;
})


