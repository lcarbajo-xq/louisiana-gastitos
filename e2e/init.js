const { detox, cleanup, init } = require('detox')
const config = require('../.detoxrc.json')

beforeAll(async () => {
  await init(config, { initGlobals: false })
}, 300000)

beforeEach(async () => {
  await detox.beforeEach()
})

afterEach(async () => {
  await detox.afterEach()
})

afterAll(async () => {
  await cleanup()
})
