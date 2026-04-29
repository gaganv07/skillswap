import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { isLoggedIn } from './utils/auth';
import logo from '../assets/skillswap-logo.png';

// Auth Screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';

// Main Screens
import ProfileScreen from './screens/ProfileScreen';
import MatchesScreen from './screens/MatchesScreen';
import SendRequestScreen from './screens/SendRequestScreen';
import RequestsScreen from './screens/RequestsScreen';
import ChatScreen from './screens/ChatScreen';
import RatingScreen from './screens/RatingScreen';
import LogoutScreen from './screens/LogoutScreen';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#0f172a',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerBackTitle: 'Back',
    }}
  >
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'My Profile' }}
    />
    <Stack.Screen
      name="Matches"
      component={MatchesScreen}
      options={{ title: 'Find Matches' }}
    />
    <Stack.Screen
      name="SendRequest"
      component={SendRequestScreen}
      options={{ title: 'Send Request' }}
    />
    <Stack.Screen
      name="Requests"
      component={RequestsScreen}
      options={{ title: 'My Requests' }}
    />
    <Stack.Screen
      name="Chat"
      component={ChatScreen}
      options={{ title: 'Chat' }}
    />
    <Stack.Screen
      name="Rating"
      component={RatingScreen}
      options={{ title: 'Rate User' }}
    />
    <Stack.Screen
      name="Logout"
      component={LogoutScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default function Navigation() {
  const [isLoading, setIsLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const loggedIn = await isLoggedIn();
      setUserLoggedIn(loggedIn);
    } catch (e) {
      console.log('Error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image source={logo} style={{ width: 88, height: 88, borderRadius: 20, marginBottom: 16 }} />
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 8 }}>SkillSwap Connect</Text>
        <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Learn what you need. Teach what you know.</Text>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userLoggedIn ? (
          <Stack.Screen name="MainStack" component={MainStack} />
        ) : (
          <Stack.Screen name="AuthStack" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
