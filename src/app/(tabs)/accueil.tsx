import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';


export default function Accueil() {
  const router = useRouter();
  const logo = require('../../../assets/logo.png');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.title}>Bienvenue 👋</Text>
        <Text style={styles.subtitle}>
          Choisissez une action
        </Text>

        {/* VISITE */}
        <TouchableOpacity
          style={[styles.button, styles.visite]}
          onPress={() => router.push('/planning')}
        >
          <Text style={styles.buttonText}>📍 Visite</Text>
        </TouchableOpacity>

        {/* PROSPECTION */}
        <TouchableOpacity
          style={[styles.button, styles.prospection]}
          onPress={() => router.push('/newClient')}
        >
          <Text style={styles.buttonText}>🔎 Prospection</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logo: {
  width: 120,
  height: 120,
  resizeMode: 'contain',
  alignSelf: 'center',
  marginBottom: 20,
},

  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 40,
    marginTop: 10,
  },

  button: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 15,
  },

  visite: {
    backgroundColor: '#e74c3c',
  },

  prospection: {
    backgroundColor: '#3498db',
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});