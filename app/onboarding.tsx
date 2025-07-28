import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React from 'react'
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

const { width } = Dimensions.get('window')

export default function OnboardingPage() {
  const handleNext = () => {
    // Navegar a la pantalla principal
    router.push('/(tabs)')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Iconos con gradientes */}
        <View style={styles.iconsContainer}>
          <View style={styles.iconsGrid}>
            {/* Fila superior */}
            <View style={styles.iconsRow}>
              <LinearGradient
                colors={['#FF6B9D', '#FF8E9E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.iconShape, styles.shape1]}
              />
              <LinearGradient
                colors={['#4ECDC4', '#44E5E7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.iconShape, styles.shape2]}
              />
              <LinearGradient
                colors={['#FFD93D', '#FFF963']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.iconShape, styles.shape3]}
              />
            </View>
            {/* Fila inferior */}
            <View style={styles.iconsRow}>
              <LinearGradient
                colors={['#6BCF7F', '#4DD467']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.iconShape, styles.shape4]}
              />
              <LinearGradient
                colors={['#4D96FF', '#67B6FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.iconShape, styles.shape5]}
              />
              <LinearGradient
                colors={['#9B59B6', '#AF7AC5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.iconShape, styles.shape6]}
              />
            </View>
          </View>
        </View>

        {/* Título principal */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Control over</Text>
          <Text style={styles.subtitle}>your finances</Text>
          <Text style={styles.description}>is in your hands</Text>
        </View>

        {/* Subdescripción */}
        <Text style={styles.subdescription}>
          Your path to conscious spending and control starts here
        </Text>

        {/* Botón con flecha */}
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Get started</Text>
          <View style={styles.arrowContainer}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000' // Fondo negro puro como en la imagen
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24
  },
  iconsContainer: {
    marginBottom: 80,
    alignItems: 'center'
  },
  iconsGrid: {
    alignItems: 'center'
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
    gap: 16
  },
  iconShape: {
    width: 64,
    height: 64,
    borderRadius: 20
  },
  // Gradientes inspirados en la imagen
  shape1: {
    transform: [{ rotate: '15deg' }]
  },
  shape2: {
    borderRadius: 32,
    transform: [{ rotate: '-10deg' }]
  },
  shape3: {
    borderRadius: 8,
    transform: [{ rotate: '25deg' }]
  },
  shape4: {
    borderRadius: 16,
    transform: [{ rotate: '-15deg' }]
  },
  shape5: {
    borderRadius: 32,
    transform: [{ rotate: '20deg' }]
  },
  shape6: {
    borderRadius: 12,
    transform: [{ rotate: '-20deg' }]
  },
  titleContainer: {
    alignItems: 'flex-start',
    marginBottom: 24,
    width: '100%',
    paddingHorizontal: 20
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '300', // Más delgado como en la imagen
    textAlign: 'left',
    lineHeight: 42,
    marginBottom: 4
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '300',
    textAlign: 'left',
    lineHeight: 42,
    marginBottom: 4
  },
  description: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '300',
    textAlign: 'left',
    lineHeight: 42
  },
  subdescription: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'left',
    lineHeight: 24,
    marginBottom: 60,
    opacity: 0.7,
    width: '100%',
    paddingHorizontal: 20
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 160,
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center'
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center'
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
})
