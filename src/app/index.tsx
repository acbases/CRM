import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';

export default function Index() {
  const [logged, setLogged] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const user = await AsyncStorage.getItem('user');
      setLogged(!!user);
    };
    check();
  }, []);

  if (logged === null) return null;

  return logged ? (
    <Redirect href="/(tabs)/accueil" />
  ) : (
    <Redirect href="/login" />
  );
}