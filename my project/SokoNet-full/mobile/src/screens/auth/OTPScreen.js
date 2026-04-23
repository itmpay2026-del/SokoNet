/**
 * OTP Verification Screen - Mobile
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OTPScreen({ route, navigation }) {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/users/verify-otp', {
        phone,
        otp
      });

      await AsyncStorage.setItem('userToken', res.data.token);
      await AsyncStorage.setItem('userType', res.data.user.userType);

      // Navigate based on user type
      navigation.reset({
        index: 0,
        routes: [{ name: res.data.user.userType === 'worker' ? 'WorkerApp' : 'CustomerApp' }]
      });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2563EB', '#4F46E5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>Enter the code sent to {phone}</Text>

          <View style={styles.form}>
            <Text style={styles.label}>6-Digit Code</Text>
            <TextInput
              style={styles.input}
              placeholder="000000"
              value={otp}
              onChangeText={(text) => setOtp(text.slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    width: '90%',
    alignItems: 'center'
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 30,
    textAlign: 'center'
  },
  form: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 20,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  backLink: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600'
  }
});
