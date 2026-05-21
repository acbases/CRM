import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

/* LISTES */
const natureVisiteList = ['Prospection', 'Suivi', 'Réclamation'];
const typeVisiteList = ['Physique', 'Téléphonique', 'Visio'];
const typeClientList = ['Particulier', 'Entreprise', 'Revendeur'];
const agenceList = ['Agence Centrale', 'Agence Nord', 'Agence Sud'];
const acquereurList = ['Agent 1', 'Agent 2', 'Agent 3'];

const clientsMock = ['Jumbo Score', 'TELMA', 'Orange', 'Star'];

export default function NewVisiteScreen() {
  /* STATES */
  const [nature, setNature] = useState('');
  const [typeVisite, setTypeVisite] = useState('');
  const [typeClient, setTypeClient] = useState('');
  const [agenceClient, setAgenceClient] = useState('');
  const [acquisiteur, setAcquisiteur] = useState('');
  const [client, setClient] = useState('');
  const [dateVisite, setDateVisite] = useState('');
  const [objectif, setObjectif] = useState('');

  const [showClientList, setShowClientList] = useState(false);

  /* MODALS */
  const [modalNature, setModalNature] = useState(false);
  const [modalTypeVisite, setModalTypeVisite] = useState(false);
  const [modalTypeClient, setModalTypeClient] = useState(false);
  const [modalAgence, setModalAgence] = useState(false);
  const [modalAcquisiteur, setModalAcquisiteur] = useState(false);

  /* AUTRE INPUTS */
  const [otherNature, setOtherNature] = useState('');
  const [otherTypeVisite, setOtherTypeVisite] = useState('');
  const [otherTypeClient, setOtherTypeClient] = useState('');
  const [otherAgence, setOtherAgence] = useState('');

const [date, setDate] = useState(new Date());
const [showPicker, setShowPicker] = useState(false);

  const filteredClients = clientsMock.filter((c) =>
    c.toLowerCase().includes(client.toLowerCase())
  );

  const handleSubmit = () => {
    console.log({
      nature,
      typeVisite,
      typeClient,
      agenceClient,
      acquisiteur,
      client,
      dateVisite: date.toISOString(),
      objectif,
    });
  };

const onChangeDate = (event: any, selectedDate?: Date) => {
  if (selectedDate) {
    setDate(selectedDate);
  }
  setShowPicker(false);
};

  /* GENERIC SELECT COMPONENT */
  const renderSelect = (
    label: string,
    value: string,
    setValue: any,
    modalVisible: boolean,
    setModalVisible: any,
    data: string[],
    otherValue: string,
    setOtherValue: any
  ) => (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.select}
        onPress={() => setModalVisible(true)}
      >
        <Text>
          {value || 'Sélectionner...'}
        </Text>
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="slide">
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modal}>
            {data.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.item}
                onPress={() => {
                  setValue(item);
                  setModalVisible(false);
                }}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            ))}

            {/* AUTRE */}
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                setValue('Autre');
              }}
            >
              <Text>Autre...</Text>
            </TouchableOpacity>

            {value === 'Autre' && (
              <TextInput
                style={styles.input}
                placeholder="Saisir autre valeur"
                value={otherValue}
                onChangeText={setOtherValue}
              />
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nouvelle visite</Text>

        {/* NATURE */}
        {renderSelect(
          'Nature visite',
          nature,
          setNature,
          modalNature,
          setModalNature,
          natureVisiteList,
          otherNature,
          setOtherNature
        )}

        {/* TYPE VISITE */}
        {renderSelect(
          'Type visite',
          typeVisite,
          setTypeVisite,
          modalTypeVisite,
          setModalTypeVisite,
          typeVisiteList,
          otherTypeVisite,
          setOtherTypeVisite
        )}

        {/* TYPE CLIENT */}
        {renderSelect(
          'Type client',
          typeClient,
          setTypeClient,
          modalTypeClient,
          setModalTypeClient,
          typeClientList,
          otherTypeClient,
          setOtherTypeClient
        )}

        {/* AGENCE CLIENT */}
        {renderSelect(
          'Agence client',
          agenceClient,
          setAgenceClient,
          modalAgence,
          setModalAgence,
          agenceList,
          otherAgence,
          setOtherAgence
        )}

        {/* CLIENT AUTOCOMPLETE */}
        <Text style={styles.label}>Client</Text>
        <TextInput
          style={styles.input}
          placeholder="Rechercher client..."
          value={client}
          onChangeText={(t) => {
            setClient(t);
            setShowClientList(true);
          }}
        />

        {showClientList && client.length > 0 && (
          <View style={styles.suggestion}>
            {filteredClients.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => {
                  setClient(c);
                  setShowClientList(false);
                }}
              >
                <Text style={styles.item}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ACQUISITEUR (LISTE SIMPLE) */}
        <View style={styles.block}>
          <Text style={styles.label}>Acquisiteur</Text>

          {acquereurList.map((a) => (
            <TouchableOpacity
              key={a}
              style={[
                styles.chip,
                acquisiteur === a && styles.chipActive,
              ]}
              onPress={() => setAcquisiteur(a)}
            >
              <Text>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DATE */}
        <View style={styles.block}>
            <Text style={styles.label}>Date visite</Text>

            {/* MOBILE */}
            {Platform.OS !== 'web' ? (
                <>
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowPicker(true)}
                >
                    <Text>
                    {date.toLocaleDateString('fr-FR')}
                    </Text>
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                    value={date}
                    mode="date"
                    display="calendar"
                    onChange={onChangeDate}
                    />
                )}
                </>
            ) : (
                /* WEB fallback */
                <input
                type="date"
                style={{
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid #ddd',
                    width: '100%',
                }}
                value={date.toISOString().split('T')[0]}
                onChange={(e) =>
                    setDate(new Date(e.target.value))
                }
                />
            )}
            </View>

        {/* OBJECTIF */}
        <View style={styles.block}>
          <Text style={styles.label}>Objectif</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            multiline
            value={objectif}
            onChangeText={setObjectif}
          />
        </View>

        {/* BUTTON */}
        <TouchableOpacity
          style={styles.btn}
          onPress={handleSubmit}
        >
          <Text style={styles.btnText}>
            Enregistrer
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },

  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },

  label: {
    fontWeight: '600',
    marginBottom: 8,
  },

  block: {
    marginBottom: 15,
  },

  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  select: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  chip: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
    marginBottom: 8,
  },

  chipSelected: {
    backgroundColor: '#d71f27',
  },

  chipActive: {
    backgroundColor: '#d71f27',
  },

  btn: {
    backgroundColor: '#d71f27',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },

  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },

  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },

  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  suggestion: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
});