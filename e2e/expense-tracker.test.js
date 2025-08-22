describe('Expense Tracker E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  beforeEach(async () => {
    await device.reloadReactNative()
  })

  afterAll(async () => {
    await device.terminateApp()
  })

  describe('Onboarding Flow', () => {
    it('should show onboarding screen on first launch', async () => {
      await expect(element(by.text('Control over'))).toBeVisible()
      await expect(element(by.text('your finances'))).toBeVisible()
      await expect(element(by.text('is in your hands'))).toBeVisible()
    })

    it('should navigate to dashboard after get started', async () => {
      await element(by.text('Get started')).tap()
      await expect(element(by.text('Expenses'))).toBeVisible()
    })
  })

  describe('Dashboard Flow', () => {
    beforeEach(async () => {
      // Skip onboarding if already completed
      try {
        await element(by.text('Get started')).tap()
      } catch (e) {
        // Already on dashboard
      }
    })

    it('should display dashboard with default state', async () => {
      await expect(element(by.text('Expenses'))).toBeVisible()
      await expect(element(by.text('Total expenses'))).toBeVisible()
      await expect(element(by.text('Recent Expenses'))).toBeVisible()
    })

    it('should show month selector', async () => {
      await element(by.text('June')).tap()
      // Add month picker expectations
    })

    it('should display expense categories in legend', async () => {
      await expect(element(by.text('Food'))).toBeVisible()
      await expect(element(by.text('Transport'))).toBeVisible()
      await expect(element(by.text('Shopping'))).toBeVisible()
    })
  })

  describe('Add Expense Flow', () => {
    beforeEach(async () => {
      try {
        await element(by.text('Get started')).tap()
      } catch (e) {}
    })

    it('should open add expense screen', async () => {
      await element(by.id('add-expense-tab')).tap()
      await expect(element(by.placeholder('$0.00'))).toBeVisible()
    })

    it('should add a new expense successfully', async () => {
      await element(by.id('add-expense-tab')).tap()

      // Enter amount
      await element(by.placeholder('$0.00')).typeText('25.50')

      // Select category
      await element(by.text('Health & Fitness')).tap()

      // Add description
      await element(
        by.placeholder('Write more, describe the details')
      ).typeText('Gym membership')

      // Save expense
      await element(by.id('save-expense-button')).tap()

      // Should navigate back to dashboard
      await expect(element(by.text('Expenses'))).toBeVisible()

      // Should see new expense in recent expenses
      await expect(element(by.text('Gym membership'))).toBeVisible()
      await expect(element(by.text('$25.50'))).toBeVisible()
    })

    it('should validate required fields', async () => {
      await element(by.id('add-expense-tab')).tap()

      // Try to save without amount
      await element(by.id('save-expense-button')).tap()

      // Should show validation error
      await expect(element(by.text('Amount is required'))).toBeVisible()
    })

    it('should handle category selection', async () => {
      await element(by.id('add-expense-tab')).tap()

      // Open category selector
      await element(by.id('category-selector')).tap()

      // Select different category
      await element(by.text('Food')).tap()

      // Should update selected category
      await expect(element(by.text('Food'))).toBeVisible()
    })
  })

  describe('Advanced Features Flow', () => {
    beforeEach(async () => {
      try {
        await element(by.text('Get started')).tap()
      } catch (e) {}
    })

    it('should access smart dashboard', async () => {
      await element(by.text('Smart Dashboard')).tap()
      await expect(element(by.text('Financial Health Score'))).toBeVisible()
    })

    it('should create smart budget', async () => {
      await element(by.text('Smart Dashboard')).tap()
      await element(by.text('Setup Smart Budget')).tap()

      await element(by.text('Food')).tap()
      await element(by.text('Create Smart Budget')).tap()

      await expect(
        element(by.text('Budget created successfully'))
      ).toBeVisible()
    })

    it('should view savings goals', async () => {
      await element(by.id('savings-tab')).tap()
      await expect(element(by.text('Your Savings Goals'))).toBeVisible()
    })

    it('should create new savings goal', async () => {
      await element(by.id('savings-tab')).tap()
      await element(by.text('Create New Goal')).tap()

      await element(by.placeholder('Enter goal name')).typeText('Vacation Fund')
      await element(by.placeholder('Target amount')).typeText('2000')
      await element(by.text('Create Goal')).tap()

      await expect(element(by.text('Vacation Fund'))).toBeVisible()
    })

    it('should export data', async () => {
      await element(by.id('export-tab')).tap()
      await expect(element(by.text('Export Your Data'))).toBeVisible()

      await element(by.text('Export CSV')).tap()
      await expect(element(by.text('Export successful'))).toBeVisible()
    })
  })

  describe('Performance Tests', () => {
    it('should load dashboard quickly', async () => {
      const start = Date.now()
      await device.reloadReactNative()

      try {
        await element(by.text('Get started')).tap()
      } catch (e) {}

      await expect(element(by.text('Expenses'))).toBeVisible()
      const end = Date.now()

      // Should load within 3 seconds
      expect(end - start).toBeLessThan(3000)
    })

    it('should handle large expense list', async () => {
      // Add multiple expenses quickly
      for (let i = 0; i < 10; i++) {
        await element(by.id('add-expense-tab')).tap()
        await element(by.placeholder('$0.00')).typeText('10')
        await element(
          by.placeholder('Write more, describe the details')
        ).typeText(`Test expense ${i}`)
        await element(by.id('save-expense-button')).tap()
      }

      // Should still be responsive
      await expect(element(by.text('Expenses'))).toBeVisible()
    })
  })

  describe('Offline Tests', () => {
    it('should work offline', async () => {
      await device.setNetworkEnabled(false)

      // Should still show cached data
      await expect(element(by.text('Expenses'))).toBeVisible()

      // Should be able to add expenses offline
      await element(by.id('add-expense-tab')).tap()
      await element(by.placeholder('$0.00')).typeText('15')
      await element(by.id('save-expense-button')).tap()

      await device.setNetworkEnabled(true)
    })
  })
})
