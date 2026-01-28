import AsyncStorage from '@react-native-async-storage/async-storage';
import { Salary } from '../types/salary';

const SALARY_KEY = 'USER_SALARY';

export const saveSalary = async (salary: Salary): Promise<void> => {
  await AsyncStorage.setItem(SALARY_KEY, JSON.stringify(salary));
};

export const getSalary = async (): Promise<Salary | null> => {
  const value = await AsyncStorage.getItem(SALARY_KEY);
  return value ? JSON.parse(value) : null;
};
