import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

export default function ScanScreen() {
  const router = useRouter();

  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] =
    useState<string>('');

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = ({
    data,
  }: {
    data: string;
  }) => {
    if (scanned) return;

    setScanned(true);
    setScannedData(data);

    Alert.alert(
      'QR Code détecté',
      `Valeur : ${data}`,
      [
        {
          text: 'Scanner encore',
          onPress: () => setScanned(false),
        },
        {
          text: 'OK',
        },
      ]
    );

    console.log('QR DATA:', data);

    // Exemple navigation
    // router.push({
    //   pathname: '/detail',
    //   params: { qr: data },
    // });
  };

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
        <Text style={styles.permissionText}>
          Permission caméra refusée
        </Text>

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

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={
          scanned
            ? undefined
            : handleBarCodeScanned
        }
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.title}>
          Scanner un QR Code
        </Text>

        <View style={styles.scanBox} />

        <Text style={styles.subtitle}>
          Placez le QR code dans le cadre
        </Text>
      </View>

      {scannedData !== '' && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>
            Dernier scan :
          </Text>

          <Text style={styles.resultText}>
            {scannedData}
          </Text>

          <TouchableOpacity
            style={styles.scanAgainBtn}
            onPress={() => {
              setScanned(false);
              setScannedData('');
            }}
          >
            <Text style={styles.buttonText}>
              Scanner à nouveau
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  permissionText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },

  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
  },

  subtitle: {
    color: '#fff',
    marginTop: 20,
    fontSize: 15,
  },

  scanBox: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: '#d71f27',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },

  button: {
    backgroundColor: '#d71f27',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },

  resultContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
  },

  resultTitle: {
    fontWeight: '700',
    marginBottom: 6,
  },

  resultText: {
    color: '#444',
    marginBottom: 12,
  },

  scanAgainBtn: {
    backgroundColor: '#d71f27',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
});