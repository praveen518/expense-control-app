import AsyncStorage from '@react-native-async-storage/async-storage';

type OpeningBalanceMap = {
  [key: string]: number; // key = `${month}:${pocketId}`
};

const KEY = 'OPENING_BALANCES';

const getAll = async (): Promise<OpeningBalanceMap> => {
  const value = await AsyncStorage.getItem(KEY);
  return value ? JSON.parse(value) : {};
};

export const getOpeningBalance = async (
  month: string,
  pocketId: string
): Promise<number> => {
  const map = await getAll();
  return map[`${month}:${pocketId}`] ?? 0;
};

export const setOpeningBalance = async (
  month: string,
  pocketId: string,
  amount: number
) => {
  const map = await getAll();
  map[`${month}:${pocketId}`] = amount;
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
};
