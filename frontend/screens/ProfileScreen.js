import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

export default function ProfileScreen({ route }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = route?.params?.userId ?? 'demo-user';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/users/${userId}`);
      setProfile(response?.data ?? null);
    } catch (error) {
      console.log('Profile load error:', error.message);
      Alert.alert('Error', 'Failed to load profile.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B9D" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const firstLetter = profile?.name
    ? profile.name.charAt(0).toUpperCase()
    : '?';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👤 My Profile</Text>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>{firstLetter}</Text>
            </View>
            <Text style={styles.name}>
              {profile?.name ?? 'User'}
            </Text>
            <Text style={styles.age}>
              {profile?.age ?? '--'} years old
            </Text>
          </View>

          {/* Skin Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌸 Skin Profile</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoCard}>
                <Ionicons name="water" size={24} color="#FF6B9D" />
                <Text style={styles.infoLabel}>Skin Type</Text>
                <Text style={styles.infoValue}>
                  {profile?.skin_type ?? 'N/A'}
                </Text>
              </View>

              <View style={styles.infoCard}>
                <Ionicons name="sunny" size={24} color="#FF6B9D" />
                <Text style={styles.infoLabel}>Climate</Text>
                <Text style={styles.infoValue}>
                  {profile?.climate ?? 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Concerns */}
          {profile?.concerns?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Skin Concerns</Text>
              <View style={styles.tagContainer}>
                {profile.concerns.map((concern, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{concern}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Allergies */}
          {profile?.allergies?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Allergies</Text>
              <View style={styles.tagContainer}>
                {profile.allergies.map((allergy, idx) => (
                  <View key={idx} style={[styles.tag, styles.allergyTag]}>
                    <Text style={[styles.tagText, styles.allergyText]}>
                      {allergy}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Activity Stats (Static for now) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Activity</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Products Scanned</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>28</Text>
                <Text style={styles.statLabel}>Days Active</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="settings-outline" size={20} color="#666" />
              <Text style={styles.actionText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="notifications-outline" size={20} color="#666" />
              <Text style={styles.actionText}>Notification Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="help-circle-outline" size={20} color="#666" />
              <Text style={styles.actionText}>Help & Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
            >
              <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
              <Text style={[styles.actionText, styles.logoutText]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { fontSize: 18, marginBottom: 20 },
  retryButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryText: { color: '#fff', fontWeight: 'bold' },

  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 22, fontWeight: 'bold' },
  age: { fontSize: 16, color: '#999' },

  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
  },
  infoLabel: { fontSize: 12, color: '#999', marginTop: 8 },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },

  tagContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: { color: '#1976D2', fontWeight: '600' },
  allergyTag: { backgroundColor: '#FFEBEE' },
  allergyText: { color: '#C62828' },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  statLabel: { fontSize: 12, color: '#999', textAlign: 'center' },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  actionText: { marginLeft: 15, fontSize: 16 },
  logoutButton: { marginTop: 10 },
  logoutText: { color: '#FF3B30' },
});