import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getChat, sendMessage } from '../services/api';
import { getUserId } from '../utils/auth';

export default function ChatScreen({ route, navigation }) {
  const { userId, userName } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    loadChat();
    getCurrentUserId();

    const interval = setInterval(() => {
      loadChat();
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: userName });
  }, [navigation, userName]);

  const getCurrentUserId = async () => {
    const id = await getUserId();
    setCurrentUserId(id);
  };

  const loadChat = async () => {
    try {
      const data = await getChat(userId);
      setMessages(data.messages || []);
    } catch (error) {
      // Silently fail for now, just keep showing existing messages
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    const messageToSend = newMessage;
    setNewMessage('');
    setSending(true);

    try {
      await sendMessage(userId, messageToSend);
      loadChat();
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
      setNewMessage(messageToSend);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const senderId = item.sender?._id ?? item.sender?.id ?? item.senderId;
    const isCurrentUser = senderId === currentUserId;

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.sentMessage : styles.receivedMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.sentBubble : styles.receivedBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.sentText : styles.receivedText,
            ]}
          >
            {item.content}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleTimeString()}
        </Text>
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id ?? item.id}
          contentContainerStyle={styles.messagesList}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          placeholderTextColor="#999"
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={sending || !newMessage.trim()}
        >
          <Text style={styles.sendButtonText}>{sending ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  sentMessage: {
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sentBubble: {
    backgroundColor: '#007AFF',
  },
  receivedBubble: {
    backgroundColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 14,
  },
  sentText: {
    color: '#fff',
  },
  receivedText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
