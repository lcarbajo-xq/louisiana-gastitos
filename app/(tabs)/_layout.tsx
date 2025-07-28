import { Tabs } from 'expo-router'
import React from 'react'
import { Platform, Text, View } from 'react-native'

import { HapticTab } from '@/components/HapticTab'
import { IconSymbol } from '@/components/ui/IconSymbol'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#808080',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            height: 70,
            paddingBottom: 12,
            paddingTop: 12,
            borderRadius: 35,
            marginHorizontal: 25,
            marginBottom: 35,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 15
          },
          default: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            height: 65,
            paddingBottom: 10,
            paddingTop: 10,
            borderRadius: 35,
            marginHorizontal: 25,
            marginBottom: 35,
            elevation: 15
          }
        })
      }}>
      <Tabs.Screen
        name='index'
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name='house.fill' color={color} />
          )
        }}
      />
      <Tabs.Screen
        name='charts'
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name='chart.pie.fill' color={color} />
          )
        }}
      />
      <Tabs.Screen
        name='add'
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 45,
                height: 45,
                borderRadius: 22.5,
                backgroundColor: '#000000',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '400',
                  color: '#FFFFFF',
                  fontFamily: 'Helvetica'
                }}>
                +
              </Text>
            </View>
          )
        }}
      />
      <Tabs.Screen
        name='savings'
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name='banknote.fill' color={color} />
          )
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name='person.fill' color={color} />
          )
        }}
      />
    </Tabs>
  )
}
