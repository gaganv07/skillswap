import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getSwapRequests, acceptSwapRequest, rejectSwapRequest } from '../services/api';

export default function RequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadRequests();
    });
    return unsubscribe;
  }, [navigation]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getSwapRequests();
      setRequests(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await acceptSwapRequest(requestId);
      Alert.alert('Success', 'Request accepted!');
      loadRequests();
    } catch (error) {
      Alert.alert('Error', error.message || 'Unable to accept the request.');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await rejectSwapRequest(requestId);
      Alert.alert('Success', 'Request rejected');
      loadRequests();
    } catch (error) {
      Alert.alert('Error', error.message || 'Unable to reject the request.');
    }
  };

  const renderRequestCard = ({ item }) => {
    const fromUser = item.fromUser ?? item.requester ?? item.responder ?? {};
    const offerSkill = item.offeredSkill ?? item.requesterSkill?.name ?? item.requesterSkill?.skill ?? 'N/A';
    const wantSkill = item.requestedSkill ?? item.responderSkill?.name ?? item.responderSkill?.skill ?? 'N/A';
    const requestId = item._id ?? item.id;
    const fromUserId = fromUser._id ?? fromUser.id;

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.fromText}>
            {fromUser.name || 'Unknown User'}
          </Text>
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Offers:</Text>
          <Text style={styles.skillText}>{offerSkill}</Text>

          <Text style={styles.label}>Wants:</Text>
          <Text style={styles.skillText}>{wantSkill}</Text>
        </View>

        {item.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() => handleAccept(requestId)}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => handleReject(requestId)}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'accepted' && fromUserId && (
          <TouchableOpacity
            style={[styles.button, styles.chatButton]}
            onPress={() =>
              navigation.navigate('Chat', {
                userId: fromUserId,
                userName: fromUser.name,
              })
            }
          >
            <Text style={styles.chatButtonText}>Start Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skill Swap Requests</Text>
      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No requests yet</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestCard}
          keyExtractor={(item) => item._id ?? item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return '#FF9500';
    case 'accepted':
      return '#34C759';
    case 'rejected':
      return '#FF3B30';
    default:
      return '#666';
  }
};

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
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fromText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 13,
    color: '#333',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chatButton: {
    backgroundColor: '#007AFF',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
