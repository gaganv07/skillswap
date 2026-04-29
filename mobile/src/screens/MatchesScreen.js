import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getMatchedUsers } from '../services/api';

export default function MatchesScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadMatches();
    });
    return unsubscribe;
  }, [navigation]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await getMatchedUsers();
      setMatches(data);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const renderUserCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.bio}>{item.bio || 'No bio available yet.'}</Text>

      {item.skillsOffered?.length > 0 && (
        <>
          <Text style={styles.label}>Offering:</Text>
          <Text style={styles.skills}>{item.skillsOffered.map((skill) => skill.skill || skill.name || skill).join(', ')}</Text>
        </>
      )}

      {item.skillsWanted?.length > 0 && (
        <>
          <Text style={styles.label}>Wants:</Text>
          <Text style={styles.skills}>{item.skillsWanted.map((skill) => skill.skill || skill.name || skill).join(', ')}</Text>
        </>
      )}

      {((item.rating?.average ?? item.rating) > 0) && (
        <Text style={styles.rating}>Rating {(item.rating?.average ?? item.rating).toFixed(1)}/5</Text>
      )}

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SendRequest', { user: item })}
        >
          <Text style={styles.buttonText}>Send Request</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Chat', { userId: item._id ?? item.id, userName: item.name })}
        >
          <Text style={styles.secondaryButtonText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Matched Users</Text>
      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No matches found yet</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderUserCard}
          keyExtractor={(item) => item._id ?? item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 16,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 8,
    marginBottom: 4,
  },
  skills: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  rating: {
    fontSize: 13,
    color: '#0ea5e9',
    marginVertical: 8,
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
  },
});
