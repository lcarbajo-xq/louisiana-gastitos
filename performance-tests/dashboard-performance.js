// Dashboard loading performance test
module.exports = {
  async test({ device, logger }) {
    logger.info('Starting dashboard performance test')

    // Launch app
    await device.launchApp({
      newInstance: true,
      permissions: { location: 'always' }
    })

    // Navigate through onboarding if needed
    try {
      await device.tap('Get started')
      logger.info('Onboarding completed')
    } catch (e) {
      logger.info('Already past onboarding')
    }

    // Measure dashboard loading time
    const startTime = Date.now()
    await device.waitForElement('Expenses', 5000)
    const loadTime = Date.now() - startTime
    logger.info(`Dashboard loaded in ${loadTime}ms`)

    // Test chart rendering performance
    await device.waitForElement('victory-pie', 3000)
    logger.info('Charts rendered successfully')

    // Test scrolling performance
    for (let i = 0; i < 10; i++) {
      await device.scroll('smart-dashboard-scroll', 'down')
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    logger.info('Scrolling performance test completed')

    // Test navigation performance
    const navStartTime = Date.now()
    await device.tap('add-expense-tab')
    await device.waitForElement('$0.00', 2000)
    const navTime = Date.now() - navStartTime
    logger.info(`Navigation completed in ${navTime}ms`)

    // Return to dashboard
    await device.tap('dashboard-tab')
    await device.waitForElement('Expenses', 2000)

    logger.info('Dashboard performance test completed')

    return {
      dashboardLoadTime: loadTime,
      navigationTime: navTime,
      success: true
    }
  }
}
