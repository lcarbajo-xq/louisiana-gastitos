import { Meta, Story } from '@storybook/react'
import React from 'react'
import { View } from 'react-native'
import { Expense } from '../../types/expense'
import { ExpenseCard } from '../ExpenseCard'

export default {
  title: 'Components/ExpenseCard',
  component: ExpenseCard,
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#000' }}>
        <Story />
      </View>
    )
  ]
} as Meta

const Template: Story = (args) => <ExpenseCard {...args} />

// Mock expense data
const mockExpense: Expense = {
  id: '1',
  amount: 25.5,
  category: {
    id: 'food',
    name: 'Food',
    icon: 'utensils',
    color: '#F59E0B'
  },
  description: 'Lunch at downtown cafe',
  date: new Date('2025-08-12T12:00:00'),
  paymentMethod: 'card'
}

export const Default = Template.bind({})
Default.args = {
  expense: mockExpense
}

export const HighAmount = Template.bind({})
HighAmount.args = {
  expense: {
    ...mockExpense,
    amount: 250.75,
    description: 'Expensive dinner'
  }
}

export const Transport = Template.bind({})
Transport.args = {
  expense: {
    ...mockExpense,
    category: {
      id: 'transport',
      name: 'Transport',
      icon: 'car',
      color: '#8B5CF6'
    },
    amount: 15.0,
    description: 'Metro ticket'
  }
}

export const Shopping = Template.bind({})
Shopping.args = {
  expense: {
    ...mockExpense,
    category: {
      id: 'shopping',
      name: 'Shopping',
      icon: 'shopping-bag',
      color: '#EC4899'
    },
    amount: 89.99,
    description: 'New headphones'
  }
}

export const LongDescription = Template.bind({})
LongDescription.args = {
  expense: {
    ...mockExpense,
    description:
      'This is a very long description that should be truncated or wrapped properly to fit within the card boundaries'
  }
}
