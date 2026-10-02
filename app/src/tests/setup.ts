import '@testing-library/jest-dom'

// jsdom no implementa ResizeObserver; los componentes con medición de track lo usan.
if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
}

// jsdom devuelve 0 en todas las medidas de layout, lo que hace que la geometría del
// carrusel colapse. Un ancho por defecto permite ejercitar el centrado real.
Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  get: () => 375,
})
Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  get: () => 800,
})

// jsdom no implementa matchMedia; el hook de media query lo necesita para decidir
// entre la hoja inferior de móvil y el pop centrado de escritorio.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }),
  })
}