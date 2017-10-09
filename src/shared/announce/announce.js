const ARIA_RELEVANT = 'aria-relevant';
const ARIA_ATOMIC = 'aria-atomic';
const ARIA_LIVE = 'aria-live';
const ROLE = 'role';
let liveRegion;

export default function announce(message, expire = 7000) {
  const element = document.createElement('div');
  element.innerHTML = message;
  liveRegion.appendChild(element);
  return setTimeout(() => {
    liveRegion.removeChild(element);
  }, expire);
}

document.addEventListener('DOMContentLoaded', () => {
  liveRegion = createRegion();
  document.body.appendChild(liveRegion);
});

function createRegion() {
  const element = document.createElement('div');

  element.setAttribute(ARIA_RELEVANT, 'additions');
  element.setAttribute(ARIA_ATOMIC, 'false');
  element.setAttribute(ARIA_LIVE, 'assertive');
  element.setAttribute(ROLE, 'status');


  element.style.position = 'fixed';
  element.style.width = '1px';
  element.style.height = '1px';
  element.style.top = '-1px';
  element.style.overflow = 'hidden';

  return element;
}
