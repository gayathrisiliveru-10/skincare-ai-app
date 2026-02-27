import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient
      colors={['#FF6B9D', '#C06C84', '#6C5B7B']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🌸</Text>

          <Text style={styles.title}>Skincare AI</Text>

          <Text style={styles.subtitle}>
            Your personal skincare intelligence assistant
          </Text>

          <View style={styles.features}>
            <Text style={styles.feature}>✨ AI-powered product analysis</Text>
            <Text style={styles.feature}>🔍 Ingredient deep-dive</Text>
            <Text style={styles.feature}>💡 Personalized recommendations</Text>
            <Text style={styles.feature}>📊 Track your skin journey</Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProfileSetup')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
  },
  features: {
    marginBottom: 50,
  },
  feature: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#FF6B9D',
    fontSize: 18,
    fontWeight: 'bold',
  },
});