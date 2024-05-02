module.exports = function HoverIntent(el, onOver, onOut) {
  let x;
  let y;
  let pX;
  let pY;
  let mouseOver = false;
  let focused = false;
  const h = {};
  let state = 0;
  let timer = 0;

  let options = {
    sensitivity: 7,
    interval: 100,
    timeout: 0,
    handleFocus: false,
  };

  function delay(elParam, e) {
    if (timer) timer = clearTimeout(timer);
    state = 0;
    return focused ? undefined : onOut.call(elParam, e);
  }

  function tracker(e) {
    x = e.clientX;
    y = e.clientY;
  }

  function compare(elParam, e) {
    if (timer) timer = clearTimeout(timer);
    if (Math.abs(pX - x) + Math.abs(pY - y) < options.sensitivity) {
      state = 1;
      return focused ? undefined : onOver.call(elParam, e);
    }
    pX = x;
    pY = y;
    timer = setTimeout(() => {
      compare(elParam, e);
    }, options.interval);
    return undefined;
  }

  function dispatchOver(e) {
    mouseOver = true;
    if (timer) timer = clearTimeout(timer);
    el.removeEventListener('mousemove', tracker, false);

    if (state !== 1) {
      pX = e.clientX;
      pY = e.clientY;

      el.addEventListener('mousemove', tracker, false);

      timer = setTimeout(() => {
        compare(el, e);
      }, options.interval);
    }

    return this;
  }

  function dispatchOut(e) {
    mouseOver = false;
    if (timer) timer = clearTimeout(timer);
    el.removeEventListener('mousemove', tracker, false);

    if (state === 1) {
      timer = setTimeout(() => {
        delay(el, e);
      }, options.timeout);
    }

    return this;
  }

  function dispatchFocus(e) {
    if (!mouseOver) {
      focused = true;
      onOver.call(el, e);
    }
  }

  function dispatchBlur(e) {
    if (!mouseOver && focused) {
      focused = false;
      onOut.call(el, e);
    }
  }

  function addFocus() {
    el.addEventListener('focus', dispatchFocus, false);
    el.addEventListener('blur', dispatchBlur, false);
  }

  function removeFocus() {
    el.removeEventListener('focus', dispatchFocus, false);
    el.removeEventListener('blur', dispatchBlur, false);
  }

  // Public methods
  h.options = function getOptions(opt) {
    let focusFn;
    const focusOptionChanged = opt.handleFocus !== options.handleFocus;
    options = { ...options, ...opt };
    if (focusOptionChanged) {
      focusFn = options.handleFocus ? addFocus : removeFocus;
      focusFn();
    }
    return h;
  };

  h.remove = function remove(reset) {
    if (!el) return;
    if (reset === true) {
      state = 1;
      dispatchOut();
    }
    el.removeEventListener('mouseover', dispatchOver, false);
    el.removeEventListener('mouseout', dispatchOut, false);
    removeFocus();
  };

  if (el) {
    el.addEventListener('mouseover', dispatchOver, false);
    el.addEventListener('mouseout', dispatchOut, false);
  }

  return h;
};
