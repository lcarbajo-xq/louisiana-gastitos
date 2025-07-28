import React from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'

export default function SavingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Huchas</Text>
        <Text style={styles.subtitle}>
          Aquí gestionarás tus metas de ahorro
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Helvetica',
    color: '#666666',
    textAlign: 'center'
  }
})
