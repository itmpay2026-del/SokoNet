/**
 * Login Screen - Mobile
 * Phone number entry for OTP authentication
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

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/users/send-otp', { phone });
      navigation.navigate('OTP', { phone });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
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
          <Text style={styles.title}>SokoNet</Text>
          <Text style={styles.subtitle}>Real-time marketplace for services</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+254 700 123456"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            By logging in, you agree to our Terms of Service
          </Text>
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
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    marginBottom: 40
  },
  form: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30
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
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 14
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
  footer: {
    fontSize: 12,
    color: '#FFF',
    textAlign: 'center'
  }
});
