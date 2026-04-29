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
import { rateUser } from '../services/api';

export default function RatingScreen({ route, navigation }) {
  const { userId, userName } = route.params;
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!review.trim()) {
      Alert.alert('Error', 'Please write a review');
      return;
    }

    setSubmitting(true);
    try {
      await rateUser(userId, rating, review);
      Alert.alert('Success', 'Rating submitted!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Unable to submit the rating.');
    } finally {
      setSubmitting(false);
    }
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Rate {userName}</Text>

        <Text style={styles.label}>Rating</Text>
        <View style={styles.starsContainer}>
          {stars.map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Text style={[styles.star, star <= rating && styles.filledStar]}>*</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingText}>{rating}/5 Stars</Text>

        <Text style={styles.label}>Your Review</Text>
        <TextInput
          style={[styles.input, styles.reviewInput]}
          placeholder="Share your experience"
          value={review}
          onChangeText={setReview}
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Rating</Text>
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
    paddingVertical: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 36,
    color: '#ddd',
  },
  filledStar: {
    color: '#0ea5e9',
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#0ea5e9',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 14,
  },
  reviewInput: {
    textAlignVertical: 'top',
    height: 120,
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
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
