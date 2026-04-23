/**
 * React Native App - Main Entry Point
 * Handles navigation and authentication for mobile platform
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import AuthContext from './src/context/AuthContext';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import OTPScreen from './src/screens/auth/OTPScreen';

// Customer Screens
import CustomerHomeScreen from './src/screens/customer/HomeScreen';
import JobSearchScreen from './src/screens/customer/JobSearchScreen';
import CreateJobScreen from './src/screens/customer/CreateJobScreen';
import MyJobsScreen from './src/screens/customer/MyJobsScreen';
import JobDetailScreen from './src/screens/customer/JobDetailScreen';
import BidsScreen from './src/screens/customer/BidsScreen';

// Worker Screens
import WorkerHomeScreen from './src/screens/worker/HomeScreen';
import NearbyJobsScreen from './src/screens/worker/NearbyJobsScreen';
import MyBidsScreen from './src/screens/worker/MyBidsScreen';
import WorkProgressScreen from './src/screens/worker/WorkProgressScreen';
import EarningsScreen from './src/screens/worker/EarningsScreen';

// Shared Screens
import ProfileScreen from './src/screens/shared/ProfileScreen';
import RatingScreen from './src/screens/shared/RatingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: false
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
    </Stack.Navigator>
  );
}

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Search') {
            iconName = 'magnify';
          } else if (route.name === 'CreateJob') {
            iconName = 'plus-circle';
          } else if (route.name === 'MyJobs') {
            iconName = 'briefcase';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false
      })}
    >
      <Tab.Screen name="Home" component={CustomerHomeScreen} />
      <Tab.Screen name="Search" component={JobSearchScreen} />
      <Tab.Screen name="CreateJob" component={CreateJobScreen} />
      <Tab.Screen name="MyJobs" component={MyJobsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function WorkerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'NearbyJobs') {
            iconName = 'map-marker';
          } else if (route.name === 'MyBids') {
            iconName = 'hand-right';
          } else if (route.name === 'Earnings') {
            iconName = 'cash-multiple';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false
      })}
    >
      <Tab.Screen name="Home" component={WorkerHomeScreen} />
      <Tab.Screen name="NearbyJobs" component={NearbyJobsScreen} />
      <Tab.Screen name="MyBids" component={MyBidsScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootStack({ userType, isAuthenticated }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true
      }}
    >
      {isAuthenticated ? (
        userType === 'worker' ? (
          <>
            <Stack.Screen name="WorkerApp" component={WorkerTabs} />
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
              <Stack.Screen name="JobDetail" component={JobDetailScreen} />
              <Stack.Screen name="WorkProgress" component={WorkProgressScreen} />
              <Stack.Screen name="Rating" component={RatingScreen} />
            </Stack.Group>
          </>
        ) : (
          <>
            <Stack.Screen name="CustomerApp" component={CustomerTabs} />
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
              <Stack.Screen name="JobDetail" component={JobDetailScreen} />
              <Stack.Screen name="Bids" component={BidsScreen} />
              <Stack.Screen name="Rating" component={RatingScreen} />
            </Stack.Group>
          </>
        )
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
            userType: action.userType
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            userType: null
          };
        case 'SET_USER_TYPE':
          return {
            ...prevState,
            userType: action.userType
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      userType: null
    }
  );

  React.useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      let userType;

      try {
        userToken = await AsyncStorage.getItem('userToken');
        userType = await AsyncStorage.getItem('userType');
      } catch (e) {
        // Restoring token failed
      }

      dispatch({ type: 'RESTORE_TOKEN', token: userToken, userType });
    };

    bootstrapAsync();
  }, []);

  return (
    <AuthContext>
      <NavigationContainer>
        <RootStack
          isAuthenticated={state.userToken != null}
          userType={state.userType}
        />
      </NavigationContainer>
    </AuthContext>
  );
}
