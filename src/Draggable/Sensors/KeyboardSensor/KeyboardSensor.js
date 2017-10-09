import {closest, matches} from 'shared/utils';
import Sensor from './../Sensor';

import {
  DragStartSensorEvent,
  DragMoveSensorEvent,
  DragStopSensorEvent,
} from './../SensorEvent';

const SPACE_CODE = 32;
const DOWN_CODE = 40;
const RIGHT_CODE = 39;
const UP_CODE = 38;
const LEFT_CODE = 37;

export default class KeyboardSensor extends Sensor {
  constructor(containers = [], options = {}) {
    super(containers, options);

    this.dragging = false;

    this._onKeyup = this._onKeyup.bind(this);
    this._onFocus = this._onFocus.bind(this);
    this._onBlur = this._onBlur.bind(this);
  }

  attach() {
    document.addEventListener('focus', this._onFocus, true);
    document.addEventListener('blur', this._onBlur, true);
    document.addEventListener('keydown', this._onKeyup, true);
  }

  detach() {
    document.removeEventListener('focus', this._onFocus, true);
    document.removeEventListener('blur', this._onBlur, true);
    document.removeEventListener('keydown', this._onKeyup, true);
  }

  _onFocus(event) {
    const draggable = event.target;
    const container = closest(event.target, this.containers);
    const isDraggable = Boolean(matches(event.target, this.options.handle || this.options.draggable));
    const isContainer = Boolean(container);

    if (isDraggable && isContainer) {
      this.potentialDraggable = draggable;
      this.potentialContainer = container;
    }
  }

  _onBlur() {
    this.potentialDraggable = null;
    this.potentialContainer = null;
  }

  _onKeyup(event) {
    if (!isRelevantKeycode(event)) {
      return;
    }

    if ((this.potentialDraggable && this.potentialContainer) || this.dragging) {
      if (event.keyCode === SPACE_CODE) {
        this._toggleDrag(event);
        event.preventDefault();
        return;
      }
    }

    if (!this.dragging) {
      return;
    }

    let target;

    if (event.keyCode === RIGHT_CODE || event.keyCode === DOWN_CODE) {
      // console.log(this._nextDraggable(this.currentDraggable));
      target = this._nextDraggable(this.currentDraggable) || this.allDraggableElements[0];

    }

    if (event.keyCode === LEFT_CODE || event.keyCode === UP_CODE) {
      // console.log(this._previousDraggable(this.currentDraggable));
      target = this._previousDraggable(this.currentDraggable) || this.allDraggableElements[this.allDraggableElements.length - 1];
      // event.preventDefault();
    }

    if (!target) {
      return;
    }

    console.log(target);

    const rect = target.getBoundingClientRect();

    const dragMoveEvent = new DragMoveSensorEvent({
      clientX: rect.left + 1,
      clientY: rect.top + 1,
      target,
      container: this.currentContainer,
      originalEvent: event,
    });

    this.trigger(this.currentContainer, dragMoveEvent);
    event.preventDefault();
  }

  _toggleDrag(event) {
    if (this.dragging) {
      this._dragStop(event);
    } else {
      this._dragStart(event);
    }
  }

  _dragStart(event) {
    const target = this.potentialDraggable;
    const container = this.potentialContainer;

    const dragStartEvent = new DragStartSensorEvent({
      target,
      container,
      originalEvent: event,
    });

    this.trigger(container, dragStartEvent);

    this.currentDraggable = target;
    this.currentContainer = container;
    this.dragging = !dragStartEvent.canceled();

    requestAnimationFrame(() => {
      if (!this.currentContainer) { return; }
      this.allDraggableElements = [];
      this.containers.forEach(() => {
        this.allDraggableElements = [
          ...this.allDraggableElements,
          ...this.currentContainer.querySelectorAll(`${this.options.draggable}:not(.draggable-source--is-dragging)`),
        ];
      });
    });
  }

  _dragStop(event) {
    const dragStopEvent = new DragStopSensorEvent({
      target: this.potentialDraggable,
      container: this.potentialContainer,
      originalEvent: event,
    });

    this.trigger(this.currentContainer, dragStopEvent);
    this.dragging = false;
    this.allDraggableElements = null;
    this.currentDraggable = null;
    this.currentContainer = null;
  }

  _nextDraggable(currentDraggable) {
    let currentIndex;
    this.allDraggableElements.forEach((draggableElement, index) => {
      if (draggableElement === currentDraggable) {
        currentIndex = index;
      }
    });
    debugger
    return this.allDraggableElements[++currentIndex];
  }

  _previousDraggable(currentDraggable) {
    let currentIndex;
    this.allDraggableElements.forEach((draggableElement, index) => {
      if (draggableElement === currentDraggable) {
        currentIndex = index;
      }
    });
    return this.allDraggableElements[--currentIndex];
  }
}

function isRelevantKeycode(event) {
  return Boolean(
    event.keyCode === SPACE_CODE ||
    event.keyCode === DOWN_CODE ||
    event.keyCode === RIGHT_CODE ||
    event.keyCode === UP_CODE ||
    event.keyCode === LEFT_CODE
  );
}
