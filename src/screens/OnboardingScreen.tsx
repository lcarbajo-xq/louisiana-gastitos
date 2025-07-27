import React from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

export const OnboardingScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Logo con gradientes */}
      <View style={styles.logoContainer}>
        <View style={styles.logoRow}>
          <View style={[styles.logoBox, styles.logoBox1]}>
            <Text style={styles.logoText}>N</Text>
          </View>
          <View style={[styles.logoBox, styles.logoBox2]}>
            <Text style={styles.logoText}>F</Text>
          </View>
          <View style={[styles.logoBox, styles.logoBox3]}>
            <Text style={styles.logoText}>A</Text>
          </View>
        </View>
      </View>

      {/* Título principal */}
      <Text style={styles.title}>
        Control over{'\n'}your finances{'\n'}is in your hands
      </Text>

      {/* Subtítulo */}
      <Text style={styles.subtitle}>
        Your path to conscious spending{'\n'}and control starts here
      </Text>

      {/* Botón Get Started */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log('Navigate to Dashboard')}>
        <Text style={styles.buttonText}>Get started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  logoContainer: {
    marginBottom: 48
  },
  logoRow: {
    flexDirection: 'row',
    gap: 8
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoBox1: {
    backgroundColor: '#8B5CF6'
  },
  logoBox2: {
    backgroundColor: '#3B82F6'
  },
  logoBox3: {
    backgroundColor: '#EC4899'
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 48
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 16
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600'
  }
})
