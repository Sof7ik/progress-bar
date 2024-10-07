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


    window.progressComponent = new Progress(progressSvg, {
        radius: 120,
    });

    valueInput.value = progressComponent.value;
})