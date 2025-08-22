import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface DatePickerProps {
  visible: boolean
  date: Date
  onDateChange: (date: Date) => void
  onClose: () => void
}

export const DatePicker: React.FC<DatePickerProps> = ({
  visible,
  date,
  onDateChange,
  onClose
}) => {
  const today = new Date()
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

  const handleDateSelect = (selectedDate: Date) => {
    onDateChange(selectedDate)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Date</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.doneButton}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateOptions}>
          <TouchableOpacity
            style={styles.dateOption}
            onPress={() => handleDateSelect(today)}>
            <Text style={styles.dateText}>Today</Text>
            <Text style={styles.dateSubtext}>{today.toLocaleDateString()}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateOption}
            onPress={() => handleDateSelect(yesterday)}>
            <Text style={styles.dateText}>Yesterday</Text>
            <Text style={styles.dateSubtext}>
              {yesterday.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateOption}
            onPress={() => handleDateSelect(tomorrow)}>
            <Text style={styles.dateText}>Tomorrow</Text>
            <Text style={styles.dateSubtext}>
              {tomorrow.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  cancelButton: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Helvetica'
  },
  doneButton: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
    fontFamily: 'Helvetica'
  },
  dateOptions: {
    padding: 20
  },
  dateOption: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  dateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Helvetica',
    marginTop: 4
  }
})
