import React from 'react'
import { Modal, StyleSheet, Text, View } from 'react-native'

interface SuccessMessageProps {
  visible: boolean
  message: string
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  visible,
  message
}) => {
  return (
    <Modal visible={visible} transparent animationType='fade'>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 280,
    marginHorizontal: 20
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#10B981',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  checkIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    fontFamily: 'Helvetica'
  }
})
