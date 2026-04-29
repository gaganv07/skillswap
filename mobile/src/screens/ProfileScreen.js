import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { getProfile, updateProfile } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    skillsOffered: '',
    skillsWanted: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile({
        name: data.name || '',
        bio: data.bio || '',
        skillsOffered: data.skillsOffered?.map((skill) => skill.skill || skill.name || skill).join(', ') || '',
        skillsWanted: data.skillsWanted?.map((skill) => skill.skill || skill.name || skill).join(', ') || '',
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateProfile({
        name: profile.name,
        bio: profile.bio,
        skillsOffered: profile.skillsOffered.split(',').map((s) => s.trim()).filter(Boolean),
        skillsWanted: profile.skillsWanted.split(',').map((s) => s.trim()).filter(Boolean),
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Unable to update the profile.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>My Profile</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={profile.name}
          onChangeText={(text) => setProfile({ ...profile, name: text })}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Tell us about yourself"
          value={profile.bio}
          onChangeText={(text) => setProfile({ ...profile, bio: text })}
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Skills Offered (comma separated)</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="e.g. JavaScript, Guitar, Cooking"
          value={profile.skillsOffered}
          onChangeText={(text) => setProfile({ ...profile, skillsOffered: text })}
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Skills Wanted (comma separated)</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="e.g. Spanish, Drawing, Photography"
          value={profile.skillsWanted}
          onChangeText={(text) => setProfile({ ...profile, skillsWanted: text })}
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdate}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Profile</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Logout')}
        >
          <Text style={styles.secondaryButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  inner: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 14,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
