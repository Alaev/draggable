import announce from 'shared/announce';

const ARIA_GRABBED = 'aria-grabbed';
const ARIA_LABEL = 'aria-label';
const TABINDEX = 'tabindex';

export default class Accessibility {
  constructor(draggable) {
    this.draggable = draggable;

    this.draggableElements = [];
    this.containerElements = [...this.draggable.containers];

    this._onInit = this._onInit.bind(this);
    this._onDestroy = this._onDestroy.bind(this);
    this._onDragStart = this._onDragStart.bind(this);
    this._onDragStop = this._onDragStop.bind(this);
  }

  attach() {
    this.draggable
      .on('draggable:initialize', this._onInit)
      .on('draggable:destroy', this._onDestroy)
      .on('drag:start', this._onDragStart)
      .on('drag:stop', this._onDragStop);
  }

  detach() {
    this.draggable
      .off('draggable:initialize', this._onInit)
      .off('draggable:destroy', this._onDestroy)
      .off('drag:start', this._onDragStart)
      .off('drag:stop', this._onDragStop);
  }

  _onInit() {
    for (const container of this.containerElements) {
      const draggableSelector = this.draggable.options.handle || this.draggable.options.draggable;
      const draggableElements = container.querySelectorAll(draggableSelector);

      this.draggableElements = [
        ...this.draggableElements,
        ...draggableElements,
      ];
    }

    // Can wait until the next best frame is available
    requestAnimationFrame(() => {
      this.draggableElements.forEach(decorateDraggableElement);
      this.containerElements.forEach(decorateContainerElement);
    });
  }

  _onDestroy() {
    // Can wait until the next best frame is available
    requestAnimationFrame(() => {
      this.draggableElements.forEach(stripDraggableElement);
      this.containerElements.forEach(stripContainerElement);
    });
  }

  _onDragStart({source}) {
    source.setAttribute(ARIA_GRABBED, true);
    announce('draggable picked up');
    setTimeout(() => {
      source.focus();
    }, 0);
  }

  _onDragStop({source, originalSource}) {
    source.setAttribute(ARIA_GRABBED, false);
    announce('draggable dropped');
    setTimeout(() => {
      originalSource.focus();
    }, 0);
  }
}

function decorateDraggableElement(element) {
  const missingTabindex = !element.getAttribute(TABINDEX);
  const missingAriaLabel = !element.getAttribute(ARIA_LABEL);

  if (missingTabindex) { element.setAttribute(TABINDEX, 0); }
  if (missingAriaLabel) { element.setAttribute(ARIA_LABEL, 'Draggable Item'); }

  element.setAttribute(ARIA_GRABBED, false);
}

function decorateContainerElement(element) {
  const missingTabindex = !element.getAttribute(TABINDEX);
  const missingAriaLabel = !element.getAttribute(ARIA_LABEL);

  if (missingTabindex) { element.setAttribute(TABINDEX, 0); }
  if (missingAriaLabel) { element.setAttribute(ARIA_LABEL, 'Container with draggable items'); }
}

function stripDraggableElement(element) {
  element.removeAttribute(ARIA_GRABBED);
  element.removeAttribute(ARIA_LABEL);
  element.removeAttribute(TABINDEX);
}

function stripContainerElement(element) {
  element.removeAttribute(ARIA_LABEL);
}
