import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pocket } from '../types/pocket';

const POCKETS_KEY = 'USER_POCKETS';

export const savePockets = async (pockets: Pocket[]) => {
  await AsyncStorage.setItem(POCKETS_KEY, JSON.stringify(pockets));
};

export const getPockets = async (): Promise<Pocket[]> => {
  const value = await AsyncStorage.getItem(POCKETS_KEY);
  return value ? JSON.parse(value) : [];
};
