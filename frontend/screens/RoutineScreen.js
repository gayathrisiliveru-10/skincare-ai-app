import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

/*
IMPORTANT:
- Android Emulator → http://10.0.2.2:8000
- Physical Device → use your PC WiFi IP (ex: http://192.168.1.5:8000)
*/

const API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000'
    : 'http://localhost:8000';

export default function RoutineScreen({ route }) {
  const [loading, setLoading] = useState(false);
  const [routine, setRoutine] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState('mid-range');

  const userId = route?.params?.userId ?? 'demo-user';

  const budgetOptions = [
    { value: 'budget', label: 'Budget', icon: 'wallet-outline' },
    { value: 'mid-range', label: 'Mid-Range', icon: 'card-outline' },
    { value: 'premium', label: 'Premium', icon: 'diamond-outline' },
  ];

  const generateRoutine = async () => {
    setLoading(true);
    setRoutine(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/routine/generate`,
        null,
        {
          params: {
            user_id: userId,
            budget: selectedBudget,
          },
        }
      );

      setRoutine(response?.data ?? null);
    } catch (error) {
      console.log('Routine error:', error.message);
      Alert.alert('Error', 'Failed to generate routine.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = (step, index) => {
    if (!step) return null;

    return (
      <View key={index} style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepNumber}>
            {step.step ?? index + 1}
          </Text>
          <View style={styles.stepInfo}>
            <Text style={styles.stepType}>
              {step.product_type ?? 'Product'}
            </Text>
            <Text style={styles.stepProduct}>
              {step.recommendation ?? 'Recommended Product'}
            </Text>
          </View>
        </View>
        {step.why && (
          <Text style={styles.stepWhy}>{step.why}</Text>
        )}
        {step.price && (
          <Text style={styles.stepPrice}>{step.price}</Text>
        )}
      </View>
    );
  };

  const morning = routine?.morning ?? [];
  const night = routine?.night ?? [];
  const weekly = routine?.weekly ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📋 My Routine</Text>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Choose Your Budget</Text>

          <View style={styles.budgetContainer}>
            {budgetOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.budgetOption,
                  selectedBudget === option.value &&
                    styles.budgetOptionActive,
                ]}
                onPress={() => setSelectedBudget(option.value)}
              >
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={
                    selectedBudget === option.value
                      ? '#FF6B9D'
                      : '#999'
                  }
                />
                <Text
                  style={[
                    styles.budgetLabel,
                    selectedBudget === option.value &&
                      styles.budgetLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[
              styles.generateButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={generateRoutine}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={styles.generateButtonText}>
                  Generate AI Routine
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Routine Output */}
          {routine && !routine.error && (
            <View style={styles.routineContainer}>
              {routine.total_monthly_cost && (
                <View style={styles.routineHeader}>
                  <Text style={styles.routineTitle}>
                    Your Personalized Routine
                  </Text>
                  <Text style={styles.monthlyCost}>
                    💰 {routine.total_monthly_cost}/month
                  </Text>
                </View>
              )}

              {/* Morning */}
              {morning.length > 0 && (
                <View style={styles.timeSection}>
                  <View style={styles.timeSectionHeader}>
                    <Ionicons
                      name="sunny"
                      size={24}
                      color="#FFB74D"
                    />
                    <Text style={styles.timeSectionTitle}>
                      Morning Routine
                    </Text>
                  </View>
                  {morning.map(renderStep)}
                </View>
              )}

              {/* Night */}
              {night.length > 0 && (
                <View style={styles.timeSection}>
                  <View style={styles.timeSectionHeader}>
                    <Ionicons
                      name="moon"
                      size={24}
                      color="#7E57C2"
                    />
                    <Text style={styles.timeSectionTitle}>
                      Night Routine
                    </Text>
                  </View>
                  {night.map(renderStep)}
                </View>
              )}

              {/* Weekly */}
              {weekly.length > 0 && (
                <View style={styles.timeSection}>
                  <View style={styles.timeSectionHeader}>
                    <Ionicons
                      name="calendar"
                      size={24}
                      color="#FF6B9D"
                    />
                    <Text style={styles.timeSectionTitle}>
                      Weekly Treatments
                    </Text>
                  </View>
                  {weekly.map(renderStep)}
                </View>
              )}
            </View>
          )}

          {/* Error */}
          {routine?.error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                Failed to generate routine.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FF6B9D' },
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: { flex: 1, padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  budgetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  budgetOption: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  budgetOptionActive: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF0F5',
  },
  budgetLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  budgetLabelActive: { color: '#FF6B9D' },
  generateButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  routineContainer: { marginTop: 25 },
  routineHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
  },
  routineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  monthlyCost: {
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  timeSection: { marginBottom: 25 },
  timeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  stepCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  stepHeader: { flexDirection: 'row', marginBottom: 10 },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6B9D',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: 'bold',
  },
  stepInfo: { flex: 1, marginLeft: 12 },
  stepType: { fontSize: 14, color: '#999' },
  stepProduct: { fontSize: 16, fontWeight: 'bold' },
  stepWhy: { fontSize: 14, color: '#666', marginBottom: 8 },
  stepPrice: { fontSize: 14, color: '#FF6B9D', fontWeight: '600' },
  errorBox: {
    backgroundColor: '#FFEBEE',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
  },
});