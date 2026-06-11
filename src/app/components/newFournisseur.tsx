import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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

interface Props {
  visible: boolean;
  idclient: number | null;
  onClose: () => void;
  onSave?: (data: { id: number; nom: string }) => void;
}

export default function NewFournisseur({ visible, onClose, onSave, idclient }: Props) {
  const [nom, setNom] = useState('');
  const [allFournisseurs, setAllFournisseurs] = useState<FournisseurItem[]>([]);
  const [suggestions, setSuggestions] = useState<FournisseurItem[]>([]);
  const [selectedExisting, setSelectedExisting] = useState<FournisseurItem | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/fournisseurs`)
      .then(r => r.json())
      .then(j => setAllFournisseurs(Array.isArray(j) ? j : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!visible) resetForm();
  }, [visible]);

  const onChangeName = (text: string) => {
    setNom(text);
    setSelectedExisting(null);
    setSuggestions(
      text.trim().length >= 1
        ? allFournisseurs.filter(f => f.nom.toLowerCase().includes(text.toLowerCase())).slice(0, 6)
        : []
    );
  };

  const selectSuggestion = (item: FournisseurItem) => {
    setNom(item.nom);
    setSelectedExisting(item);
    setSuggestions([]);
  };

  const handleSave = async () => {
    if (!nom.trim() || !idclient) return;
    try {
      let idfournisseur: number;

      if (selectedExisting) {
        // Fournisseur existant → utiliser son ID directement
        idfournisseur = selectedExisting.id;
      } else {
        // Nouveau → créer, puis utiliser l'ID créé
        const res = await fetch(
          `${BASE_URL}/fournisseur`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom: nom.trim() }),
          }
        );
        if (!res.ok) throw new Error(await res.text());
        const created: FournisseurItem = await res.json();
        idfournisseur = created.id;
        setAllFournisseurs(prev => [...prev, created]);
      }

      // Lier au client
      await fetch(`${BASE_URL}/fournisseurClient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idclient, idfournisseur }),
      });

      onSave?.({ id: idfournisseur, nom: nom.trim() });
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); resetForm(); onClose(); }, 1000);
    } catch (err: any) {
      console.error('ERREUR newFournisseur:', err);
    }
  };

  const resetForm = () => {
    setNom('');
    setSelectedExisting(null);
    setSuggestions([]);
    setSubmitted(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconWrap}>
                <Ionicons name="cube-outline" size={24} color={C.white} />
              </View>
              <Text style={styles.title}>Nouveau fournisseur</Text>
            </View>

            {/* Nom + auto-complete */}
            <Text style={styles.label}>Nom <Text style={{ color: C.primary }}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Rechercher ou saisir un fournisseur..."
              placeholderTextColor={C.grey}
              value={nom}
              onChangeText={onChangeName}
            />

            {/* Suggestions */}
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

            {/* Badge fournisseur existant sélectionné */}
            {selectedExisting && (
              <View style={styles.existingBadge}>
                <Ionicons name="checkmark-circle-outline" size={14} color="#16A34A" style={{ marginRight: 6 }} />
                <Text style={styles.existingBadgeText}>Fournisseur existant — sera lié sans créer de doublon</Text>
              </View>
            )}

            {/* Boutons */}
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Ionicons name="checkmark-outline" size={16} color={C.white} style={{ marginRight: 4 }} />
                <Text style={styles.saveText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>

            {submitted && (
              <View style={styles.toast}>
                <Text style={styles.toastText}>Fournisseur ajouté !</Text>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  card: {
    backgroundColor: C.white, borderRadius: 20, padding: 22, width: '100%',
    elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconWrap: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: C.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: C.dark },
  label: { fontSize: 13, fontWeight: '600', color: C.dark, marginBottom: 8 },
  input: {
    backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: C.dark,
  },
  suggestions: {
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, marginTop: 4, overflow: 'hidden',
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 11, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  suggestionText: { fontSize: 14, color: C.dark },
  existingBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#DCFCE7', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 7, marginTop: 8,
  },
  existingBadgeText: { fontSize: 12, color: '#16A34A', fontWeight: '600', flex: 1 },
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
  toast: { marginTop: 14, backgroundColor: '#DCFCE7', padding: 12, borderRadius: 10 },
  toastText: { color: '#166534', fontWeight: '700', textAlign: 'center' },
});
