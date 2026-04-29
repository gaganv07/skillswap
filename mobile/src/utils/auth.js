import AsyncStorage from '@react-native-async-storage/async-storage';

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.log('Error getting token:', error);
    return null;
  }
};

export const getUserId = async () => {
  try {
    return await AsyncStorage.getItem('userId');
  } catch (error) {
    console.log('Error getting userId:', error);
    return null;
  }
};

export const isLoggedIn = async () => {
  const token = await getToken();
  return !!token;
};
