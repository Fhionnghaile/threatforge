import "@testing-library/jest-dom/vitest";

// jsdom implements PointerEvent but drops clientX/clientY from the init dict.
// Re-base it on MouseEvent (which jsdom honours) so pointer-drag tests get real
// coordinates — matching real-browser behaviour.
class PointerEventPolyfill extends MouseEvent {
  pointerId: number;
  constructor(type: string, props: PointerEventInit = {}) {
    super(type, props);
    this.pointerId = props.pointerId ?? 0;
  }
}
// @ts-expect-error override jsdom's incomplete PointerEvent
window.PointerEvent = PointerEventPolyfill;
// jsdom lacks pointer-capture methods; stub them so setPointerCapture is callable.
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.hasPointerCapture = () => false;
}
