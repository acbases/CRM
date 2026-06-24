import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useRouter,useLocalSearchParams } from 'expo-router';
import { BASE_URL } from '../config/api';
import { useAuth } from '@/context/AuthContext';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';

export default function Scan2Screen() {
  const router = useRouter();
  const { body } = useLocalSearchParams();
  const visite = body
  ? JSON.parse(body as string) as {
      idClient:number;
      idutilisateur: number;
      idcategorie: number;
      date: string;
      statut: number;
      type: number;
      idtype: number;
      object: string;
    }
  : null;

  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const { user } = useAuth();

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // ===================== PERMISSIONS =====================
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
    initLocation();
  }, []);

  // ===================== GPS =====================
  const initLocation = async () => {
    try {
      setLoadingLocation(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Erreur', 'Permission GPS refusée');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (err) {
      console.log(err);
      Alert.alert('Erreur', 'Impossible de récupérer GPS');
    } finally {
      setLoadingLocation(false);
    }
  };

  // ===================== DISTANCE =====================
  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3;
    const toRad = (v: number) => (v * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // ===================== SCAN QR =====================
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);

    try {
      const qr = JSON.parse(data);

      if (!userLocation) {
        Alert.alert('Erreur', 'GPS non disponible');
        setScanned(false);
        return;
      }

      const distance = getDistance(
        userLocation.latitude,
        userLocation.longitude,
        qr.latitude,
        qr.longitude
      );

      console.log('Distance:', distance);

      if (distance <= 50) {
        Alert.alert('OK', 'Client validé');

        if (!user?.id) {
            Alert.alert('Erreur', 'Utilisateur non connecté');
            return;
        }

        try {
            const body = {
                idclient: qr.id,
                idutilisateur: user.id,
                idcategorie: visite?.idcategorie ?? 4,
                date: visite?.date ?? new Date().toISOString().split('T')[0],
                statut: 0,
                type: visite?.idcategorie ?? 1,
                idtype: visite?.idtype ?? 2,
                object: visite?.object ?? null,
            };

            const response = await fetchWithTimeout(
            `${BASE_URL}/visite`,
            {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                },
                body: JSON.stringify(body),
            }
            );

            console.log('Status:', response.status);

            const text = await response.text();
            console.log('Réponse brute:', text);

            let result;
            
            console.log('TEXT VISITE :', text);

            try {
            result = JSON.parse(text);
            console.log('RESULTAT VISITE :', result);
            } catch {
            throw new Error('Réponse serveur invalide');
            }

            if (!response.ok) {
            throw new Error(result.message || 'Erreur insertion visite');
            }

            const idVisite = result.id; // à adapter selon la structure retournée

            Alert.alert('Succès', 'Visite enregistrée avec succès');

            router.push({
            pathname: '/rapportRetail',
            params: {
                idClient: qr.id,
                idVisite: idVisite,
            },
            });
        } catch (err: any) {
            Alert.alert('Erreur', err.message);
        }
      } else {
        Alert.alert(
          'Hors zone',
          `Vous êtes à ${Math.round(distance)}m du client`
        );

        setScanned(false);
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Erreur', 'QR code invalide');
      setScanned(false);
    }
  };

  // ===================== PERMISSION CAMERA =====================
  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Chargement caméra...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Permission caméra refusée</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>
            Autoriser caméra
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ===================== LOADING GPS =====================
  if (loadingLocation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d71f27" />
        <Text style={{ marginTop: 10 }}>
          Récupération position...
        </Text>
      </View>
    );
  }

  // ===================== UI =====================
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={
          scanned ? undefined : handleBarCodeScanned
        }
      />

      <View style={styles.overlay}>
        <Text style={styles.title}>
          Scanner QR Client
        </Text>

        <View style={styles.scanBox} />

        <Text style={styles.subtitle}>
          Placez le QR dans le cadre
        </Text>
      </View>

      {scanned && (
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() => setScanned(false)}
        >
          <Text style={{ color: '#fff' }}>
            Scanner à nouveau
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ===================== STYLE =====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  button: {
    marginTop: 10,
    backgroundColor: '#d71f27',
    padding: 12,
    borderRadius: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  subtitle: {
    color: '#fff',
    marginTop: 20,
  },

  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#d71f27',
    borderRadius: 20,
  },

  resetBtn: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#d71f27',
    padding: 12,
    borderRadius: 10,
  },
});