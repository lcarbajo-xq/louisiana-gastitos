// Jest polyfills for React Native environment
global.process = require('process')

// Polyfill for TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock performance.now if not available
if (!global.performance) {
  global.performance = { now: () => Date.now() }
}

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0)
}

global.cancelAnimationFrame = (id) => {
  clearTimeout(id)
}

// Mock setImmediate
if (!global.setImmediate) {
  global.setImmediate = (callback) => setTimeout(callback, 0)
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}
