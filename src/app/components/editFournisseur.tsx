import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '@/config/api';

const C = {
  primary: '#EF2D24',
  white: '#FFFFFF',
  grey: '#88898E',
  dark: '#1A1A1A',
  border: '#E5E7EB',
  inputBg: '#F3F4F6',
};

interface FournisseurItem { id: number; nom: string; }

type Props = {
  visible: boolean;
  idfournisseur: number | null;
  idfournisseurclient?: number | null;
  idclient?: number | null;
  onClose: () => void;
  onSave: () => void;
};

export default function EditFournisseur({
  visible, idfournisseur, idfournisseurclient, idclient, onClose, onSave,
}: Props) {
  const [nom, setNom] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [allFournisseurs, setAllFournisseurs] = useState<FournisseurItem[]>([]);
  const [suggestions, setSuggestions] = useState<FournisseurItem[]>([]);
  const [selectedExisting, setSelectedExisting] = useState<FournisseurItem | null>(null);

  // Liste des fournisseurs pour auto-complete
  useEffect(() => {
    fetch(`${BASE_URL}/fournisseurs`)
      .then(r => r.json())
      .then(j => setAllFournisseurs(Array.isArray(j) ? j : []))
      .catch(() => {});
  }, []);

  // Charger le fournisseur courant
  useEffect(() => {
    if (!idfournisseur || !visible) return;
    const load = async () => {
      try {
        setLoadingFetch(true);
        const res = await fetch(`${BASE_URL}/fournisseur/${idfournisseur}`);
        const json = await res.json();
        setNom(json.nom ?? '');
        setSelectedExisting(null);
        setSuggestions([]);
      } catch {
        Alert.alert('Erreur', 'Impossible de charger le fournisseur');
      } finally {
        setLoadingFetch(false);
      }
    };
    load();
  }, [idfournisseur, visible]);

  const onChangeName = (text: string) => {
    setNom(text);
    setSelectedExisting(null);
    setSuggestions(
      text.trim().length >= 1
        ? allFournisseurs
            .filter(f => f.id !== idfournisseur && f.nom.toLowerCase().includes(text.toLowerCase()))
            .slice(0, 6)
        : []
    );
  };

  const selectSuggestion = (item: FournisseurItem) => {
    setNom(item.nom);
    setSelectedExisting(item);
    setSuggestions([]);
  };

  const handleUpdate = async () => {
    if (!nom.trim()) return;
    setLoading(true);
    try {
      if (selectedExisting && idfournisseurclient && idclient) {
        // Remplacer la liaison par un fournisseur existant
        await fetch(
          `${BASE_URL}/fournisseurClient/${idfournisseurclient}`,
          { method: 'DELETE', headers: { Accept: 'application/json' } }
        );
        await fetch(`${BASE_URL}/fournisseurClient`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idclient, idfournisseur: selectedExisting.id }),
        });
      } else {
        // Mettre à jour le nom du fournisseur actuel
        const res = await fetch(
          `${BASE_URL}/fournisseur/${idfournisseur}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ nom: nom.trim() }),
          }
        );
        if (!res.ok) throw new Error(await res.text());
      }
      Alert.alert('Succès', 'Fournisseur modifié avec succès');
      onSave();
      onClose();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Erreur modification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>Modifier le fournisseur</Text>

            {loadingFetch ? (
              <ActivityIndicator size="large" color={C.primary} style={{ marginVertical: 20 }} />
            ) : (
              <>
                <Text style={styles.label}>Nom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Rechercher ou modifier..."
                  placeholderTextColor={C.grey}
                  value={nom}
                  onChangeText={onChangeName}
                />

                {suggestions.length > 0 && (
                  <View style={styles.suggestions}>
                    {suggestions.map(item => (
                      <TouchableOpacity key={item.id} style={styles.suggestionItem} onPress={() => selectSuggestion(item)}>
                        <Ionicons name="search-outline" size={13} color={C.grey} style={{ marginRight: 8 }} />
                        <Text style={styles.suggestionText}>{item.nom}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {selectedExisting && (
                  <View style={styles.existingBadge}>
                    <Ionicons name="swap-horizontal-outline" size={14} color="#1D4ED8" style={{ marginRight: 6 }} />
                    <Text style={styles.existingBadgeText}>
                      Remplacera le lien par ce fournisseur existant
                    </Text>
                  </View>
                )}

                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                    <Text style={styles.cancelText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
                    {loading
                      ? <ActivityIndicator size="small" color={C.white} />
                      : <>
                          <Ionicons name="checkmark-outline" size={16} color={C.white} style={{ marginRight: 4 }} />
                          <Text style={styles.saveText}>Sauvegarder</Text>
                        </>
                    }
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', padding: 20,
  },
  card: {
    backgroundColor: C.white, borderRadius: 18, padding: 22,
    elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8,
  },
  title: { fontSize: 17, fontWeight: '700', color: C.dark, marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: C.dark, marginBottom: 8 },
  input: {
    backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: C.dark,
  },
  suggestions: {
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, marginTop: 4, overflow: 'hidden', elevation: 4,
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 11, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  suggestionText: { fontSize: 14, color: C.dark },
  existingBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#DBEAFE', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 7, marginTop: 8,
  },
  existingBadgeText: { fontSize: 12, color: '#1D4ED8', fontWeight: '600', flex: 1 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  cancelBtn: {
    flex: 1, backgroundColor: '#F3F4F6',
    borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  cancelText: { color: C.dark, fontWeight: '600' },
  saveBtn: {
    flex: 1, backgroundColor: C.primary, borderRadius: 12, paddingVertical: 13,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  saveText: { color: C.white, fontWeight: '700' },
});
