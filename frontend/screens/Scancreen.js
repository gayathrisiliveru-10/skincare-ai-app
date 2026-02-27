import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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

export default function ScanScreen({ route }) {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const userId = route?.params?.userId ?? 'demo-user';

  const scanProduct = async () => {
    if (!barcode.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/api/products/scan`, {
        barcode: barcode.trim(),
        user_id: userId,
      });

      setResult(response?.data ?? null);
    } catch (error) {
      console.log('Scan error:', error.message);
      Alert.alert('Scan Failed', 'Please check your backend server.');
    } finally {
      setLoading(false);
    }
  };

  const analysis = result?.analysis;
  const product = result?.product;
  const alternatives = result?.alternatives ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔍 Scan Product</Text>
        </View>

        <View style={styles.content}>
          {/* Scan UI */}
          <View style={styles.scanBox}>
            <Ionicons name="scan-outline" size={80} color="#FF6B9D" />
            <Text style={styles.scanText}>Enter barcode manually</Text>
            <Text style={styles.scanSubtext}>
              (Camera scanning coming soon!)
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter barcode number"
            value={barcode}
            onChangeText={setBarcode}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={scanProduct}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Analyze Product</Text>
            )}
          </TouchableOpacity>

          {/* Result Section */}
          {analysis && product && (
            <ScrollView
              style={styles.resultContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.productCard}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productBrand}>{product.brand}</Text>

                {/* Score */}
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>AI Score</Text>
                  <Text style={styles.scoreValue}>
                    {analysis?.overall_score ?? 0}/100
                  </Text>
                </View>

                {/* Recommendation */}
                <View
                  style={[
                    styles.recommendationBadge,
                    analysis?.recommendation === 'recommended' &&
                      styles.recommendedBadge,
                    analysis?.recommendation === 'not_recommended' &&
                      styles.notRecommendedBadge,
                  ]}
                >
                  <Text style={styles.recommendationText}>
                    {(analysis?.recommendation ?? 'unknown').toUpperCase()}
                  </Text>
                </View>

                {/* Warnings */}
                {analysis?.warnings?.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚠️ Warnings</Text>
                    {analysis.warnings.map((warning, idx) => (
                      <Text key={idx} style={styles.listItem}>
                        • {warning}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Benefits */}
                {analysis?.benefits?.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✅ Benefits</Text>
                    {analysis.benefits.map((benefit, idx) => (
                      <Text key={idx} style={styles.listItem}>
                        • {benefit}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Alternatives */}
                {alternatives.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      💡 Better Alternatives
                    </Text>
                    {alternatives.map((alt, idx) => (
                      <View key={idx} style={styles.alternativeCard}>
                        <Text style={styles.altName}>{alt.name}</Text>
                        <Text style={styles.altBrand}>{alt.brand}</Text>
                        <Text style={styles.altReason}>
                          {alt.why_better}
                        </Text>
                        <Text style={styles.altPrice}>
                          {alt.price_range}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

/* -------------------- Styles -------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FF6B9D',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
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
  content: {
    flex: 1,
    padding: 20,
  },
  scanBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  scanText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
  },
  scanSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  productBrand: {
    fontSize: 16,
    color: '#999',
    marginBottom: 15,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F7F9FC',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  recommendationBadge: {
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  recommendedBadge: {
    backgroundColor: '#4CAF50',
  },
  notRecommendedBadge: {
    backgroundColor: '#FF5252',
  },
  recommendationText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listItem: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  alternativeCard: {
    backgroundColor: '#F7F9FC',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  altName: {
    fontWeight: 'bold',
  },
  altBrand: {
    color: '#999',
  },
  altReason: {
    color: '#666',
  },
  altPrice: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
});