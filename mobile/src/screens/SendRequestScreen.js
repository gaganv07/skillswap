import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { sendSwapRequest } from '../services/api';

export default function SendRequestScreen({ route, navigation }) {
  const { user } = route.params;
  const [offeredSkill, setOfferedSkill] = useState('');
  const [requestedSkill, setRequestedSkill] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendRequest = async () => {
    if (!offeredSkill.trim() || !requestedSkill.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setSending(true);
    try {
      await sendSwapRequest(user._id ?? user.id, offeredSkill, requestedSkill);
      Alert.alert('Success', 'Request sent successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Unable to send the request.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Send Skill Swap Request</Text>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          {user.bio && <Text style={styles.userBio}>{user.bio}</Text>}
        </View>

        <Text style={styles.label}>I can teach:</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="What skill would you like to offer?"
          value={offeredSkill}
          onChangeText={setOfferedSkill}
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>I want to learn:</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="What skill would you like to learn?"
          value={requestedSkill}
          onChangeText={setRequestedSkill}
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSendRequest}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send Request</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  userInfo: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userBio: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
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
    backgroundColor: '#007AFF',
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
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
