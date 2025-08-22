import { Tabs, useRouter } from 'expo-router'
import React from 'react'
import { Platform, Text, TouchableOpacity } from 'react-native'

import { HapticTab } from '@/components/HapticTab'
import { IconSymbol } from '@/components/ui/IconSymbol'

function FloatingAddButton() {
  const router = useRouter()

  const handlePress = () => {
    console.log('FloatingAddButton pressed - navigating to /add')
    try {
      router.push('/add')
      console.log('Navigation attempted')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        position: 'absolute',
        bottom: Platform.select({
          ios: 25 + 65 / 2 - 20, // marginBottom + (altura barra / 2) - (radio botón)
          default: 25 + 60 / 2 - 20 // marginBottom + (altura barra / 2) - (radio botón)
        }),
        left: '50%',
        marginLeft: -20, // -radius para centrar
        width: 48,
        height: 48,
        borderRadius: 20,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8
      }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: '300',
          color: '#FFFFFF',
          lineHeight: 24
        }}>
        +
      </Text>
    </TouchableOpacity>
  )
}
export default function TabLayout() {
  return (
    <>
      <Tabs
        initialRouteName='index'
        screenOptions={{
          tabBarActiveTintColor: '#000000',
          tabBarInactiveTintColor: '#808080',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarItemStyle: {
            paddingHorizontal: 4,
            minWidth: 50
          },
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              backgroundColor: '#FFFFFF',
              borderTopWidth: 0,
              height: 65,
              paddingBottom: 10,
              paddingTop: 10,
              borderRadius: 32,
              marginHorizontal: 40,
              marginBottom: 25,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: -6 },
              shadowOpacity: 0.15,
              shadowRadius: 15,
              elevation: 10,
              paddingHorizontal: 15
            },
            default: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 0,
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
              borderRadius: 30,
              marginHorizontal: 40,
              marginBottom: 25,
              elevation: 10,
              paddingHorizontal: 15
            }
          })
        }}>
        <Tabs.Screen
          name='index'
          options={{
            title: '',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={30} name='house.fill' color={color} />
            ),
            tabBarItemStyle: {
              paddingHorizontal: 4,
              minWidth: 50,
              marginRight: 8 // Grupo 1: spacing normal entre index y charts
            }
          }}
        />
        <Tabs.Screen
          name='charts'
          options={{
            title: '',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={30} name='chart.pie.fill' color={color} />
            ),
            tabBarItemStyle: {
              paddingHorizontal: 4,
              minWidth: 50,
              marginRight: 40 // Espacio grande después de charts (donde va el botón flotante)
            }
          }}
        />

        <Tabs.Screen
          name='shared'
          options={{
            title: '',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={30} name='person.2.fill' color={color} />
            ),
            tabBarItemStyle: {
              paddingHorizontal: 4,
              minWidth: 50,
              marginLeft: 40, // Espacio grande antes de shared (donde va el botón flotante)
              marginRight: 8 // Grupo 2: spacing normal entre shared y profile
            }
          }}
        />
        <Tabs.Screen
          name='profile'
          options={{
            title: '',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={30} name='person.fill' color={color} />
            ),
            tabBarItemStyle: {
              paddingHorizontal: 4,
              minWidth: 50
            }
          }}
        />
      </Tabs>
      <FloatingAddButton />
    </>
  )
}
