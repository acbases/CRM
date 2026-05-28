import { useEffect, useState } from 'react';
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
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';



interface Client {
  id: number;
  nom: string;
  latitude: string;
  longitude: string;
  zone: string;
  quartier: string;
  idagence: number;
  idcategorie: number;
}

interface CategorieClient {
  id: number;
  intitule: string;
}

interface Agence {
  id: number;
  intitule: string;
}

interface TypeVisite {
  id: number;
  nom: string;
}

interface CategorieVisite {
  id: number;
  intitule: string;
}

export default function NewVisiteScreen() {
  /* STATES */
  const [typeVisite, setTypeVisite] = useState<string>('');
  const [motifVisite, setMotifVisite] = useState<string>('');
  const [motifVisiteList, setMotifVisiteList] = useState<CategorieVisite[]>([]);
  const [typeVisiteList, setTypeVisiteList] = useState<TypeVisite[]>([]);
  const [typeClient, setTypeClient] = useState<string>('');
  const [typeClientList, setTypeClientList] = useState<CategorieClient[]>([]);
  const [agenceClient, setAgenceClient] = useState<string>('');
  const [agenceClientList, setAgenceClientList] = useState<Agence[]>([]);
  const [acquisiteur, setAcquisiteur] = useState('');
  const [client, setClient] = useState('');
  const [objectif, setObjectif] = useState('');
  const [error, setError] = useState('');
  const [showClientList, setShowClientList] = useState(false);

  const [motifVisiteId, setMotifVisiteId] =
  useState<number | null>(null);

  const [typeVisiteId, setTypeVisiteId] =
  useState<number | null>(null);

  /* MODALS */
  const [modalNature, setModalNature] = useState(false);
  const [modalTypeVisite, setModalTypeVisite] = useState(false);
  const [modalTypeClient, setModalTypeClient] = useState(false);
  const [modalAgence, setModalAgence] = useState(false);

  /* AUTRE INPUTS */

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [dataClient, setDataClient] = useState<Client[]>([]);
  const [typeClientId, setTypeClientId] = useState<number | null>(null);
  const [agenceClientId, setAgenceClientId] = useState<number | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    fetch('https://allapps.alphaciment.com/crm_back/api/clients')
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setDataClient(Array.isArray(json) ? json : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setError('Erreur lors du chargement: ' + err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
      fetch('https://allapps.alphaciment.com/crm_back/api/categorieClients')
        .then(res => res.json())
        .then(json => setTypeClientList(Array.isArray(json) ? json : []))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
      fetch('https://allapps.alphaciment.com/crm_back/api/categorieVisites')
        .then(res => res.json())
        .then(json => setMotifVisiteList(Array.isArray(json) ? json : []))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
      fetch('https://allapps.alphaciment.com/crm_back/api/typeVisites')
        .then(res => res.json())
        .then(json => setTypeVisiteList(Array.isArray(json) ? json : []))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
      fetch('https://allapps.alphaciment.com/crm_back/api/agences')
        .then(res => res.json())
        .then(json => setAgenceClientList(Array.isArray(json) ? json : []))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }, []);


    const filteredClients = dataClient.filter((c: Client) => {
        const matchNom =
            c.nom?.toLowerCase().includes(client.toLowerCase());

        const matchType =
            !typeClientId || c.idcategorie === typeClientId;

        const matchAgence =
            !agenceClientId || c.idagence === agenceClientId;

        return matchNom && matchType && matchAgence;
    });

    const formatDate = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    };

    const handleSubmit = async () => {
        try {
            setError('');

            if (!clientId) {
            setError('Veuillez sélectionner un client');
            return;
            }

            if (!motifVisiteId) {
            setError('Veuillez sélectionner une nature de visite');
            return;
            }

            if (!typeVisiteId) {
            setError('Veuillez sélectionner un type de visite');
            return;
            }

            const body = {
                idclient: clientId,
                idutilisateur: 3,
                idcategorie: motifVisiteId,
                date: formatDate(date),
                statut: 1,
                type: 1,
                idtype: typeVisiteId,
                object: objectif, // ✅ CORRIGÉ (pas "object")
            };

            console.log('BODY:', body);

            const response = await fetch(
            'https://allapps.alphaciment.com/crm_back/api/visite',
            {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                },
                body: JSON.stringify(body),
            }
            );

            const result = await response.json();

            if (!response.ok) {
            throw new Error(result.message || 'Erreur insertion visite');
            }

            Alert.alert('Succès', 'Visite enregistrée avec succès');

            // reset
            setClient('');
            setClientId(null);

            setAgenceClient('');
            setAgenceClientId(null);

            setMotifVisite('');
            setMotifVisiteId(null);

            setTypeVisite('');
            setTypeVisiteId(null);

            setTypeClient('');
            setTypeClientId(null);

            setObjectif('');
            setDate(new Date());
        } catch (err: any) {
            console.error(err);
            Alert.alert('Erreur', err.message);
        }
    };

const onChangeDate = (event: any, selectedDate?: Date) => {
  if (selectedDate) {
    setDate(selectedDate);
  }
  setShowPicker(false);
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nouvelle visite</Text>

        {/* NATURE */}
        <View style={styles.block}>
            <Text style={styles.label}>Nature visite</Text>

            <TouchableOpacity
                style={styles.select}
                onPress={() => setModalNature(true)}
            >
                <Text>
                {motifVisite || 'Sélectionner...'}
                </Text>
            </TouchableOpacity>

            <Modal
                transparent
                visible={modalNature}
                animationType="slide"
            >
                <Pressable
                style={styles.overlay}
                onPress={() => setModalNature(false)}
                >
                <View style={styles.modal}>
                    <ScrollView>
                    {motifVisiteList.map((item) => (
                        <TouchableOpacity
                        key={item.id}
                        style={styles.item}
                        onPress={() => {
                            setMotifVisite(item.intitule);
                            setMotifVisiteId(item.id);
                            setModalNature(false);
                        }}
                        >
                        <Text>{item.intitule}</Text>
                        </TouchableOpacity>
                    ))}
                    </ScrollView>
                </View>
                </Pressable>
            </Modal>
            </View>

        {/* TYPE VISITE */}
        <View style={styles.block}>
            <Text style={styles.label}>Type visite</Text>

            <TouchableOpacity
                style={styles.select}
                onPress={() => setModalTypeVisite(true)}
            >
                <Text>
                {typeVisite || 'Sélectionner...'}
                </Text>
            </TouchableOpacity>

            <Modal
                transparent
                visible={modalTypeVisite}
                animationType="slide"
            >
                <Pressable
                style={styles.overlay}
                onPress={() =>
                    setModalTypeVisite(false)
                }
                >
                <View style={styles.modal}>
                    <ScrollView>
                    {typeVisiteList.map((item) => (
                        <TouchableOpacity
                        key={item.id}
                        style={styles.item}
                        onPress={() => {
                            setTypeVisite(item.nom);
                            setTypeVisiteId(item.id);
                            setModalTypeVisite(false);
                        }}
                        >
                        <Text>{item.nom}</Text>
                        </TouchableOpacity>
                    ))}
                    </ScrollView>
                </View>
                </Pressable>
            </Modal>
        </View>

        {/* TYPE CLIENT */}
        <View style={styles.block}>
            <Text style={styles.label}>Type client</Text>

            <TouchableOpacity
                style={styles.select}
                onPress={() => setModalTypeClient(true)}
            >
                <Text>{typeClient || 'Sélectionner...'}</Text>
            </TouchableOpacity>

            <Modal transparent visible={modalTypeClient}>
                <Pressable
                style={styles.overlay}
                onPress={() => setModalTypeClient(false)}
                >
                <View style={styles.modal}>
                    {typeClientList.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.item}
                        onPress={() => {
                        setTypeClient(item.intitule);
                        setTypeClientId(item.id); // important
                        setModalTypeClient(false);
                        }}
                    >
                        <Text>{item.intitule}</Text>
                    </TouchableOpacity>
                    ))}
                </View>
                </Pressable>
            </Modal>
            </View>

        {/* AGENCE CLIENT */}
        <View style={styles.block}>
            <Text style={styles.label}>Agence client</Text>

            <TouchableOpacity
                style={styles.select}
                onPress={() => setModalAgence(true)}
            >
                <Text>{agenceClient || 'Sélectionner...'}</Text>
            </TouchableOpacity>

            <Modal transparent visible={modalAgence}>
                <Pressable
                style={styles.overlay}
                onPress={() => setModalAgence(false)}
                >
                <View style={styles.modal}>
                    {agenceClientList.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.item}
                        onPress={() => {
                        setAgenceClient(item.intitule);
                        setAgenceClientId(item.id); // important
                        setModalAgence(false);
                        }}
                    >
                        <Text>{item.intitule}</Text>
                    </TouchableOpacity>
                    ))}
                </View>
                </Pressable>
            </Modal>
            </View>

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
            {filteredClients.slice(0, 10).map((c: Client) => (
                <TouchableOpacity
                key={c.id}
                onPress={() => {
                    setClient(c.nom);
                    setClientId(c.id);
                    setShowClientList(false);
                }}
                >
                <Text style={styles.item}>{c.nom}</Text>
                </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ACQUISITEUR (LISTE SIMPLE) */}
        {/* <View style={styles.block}>
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
        </View> */}

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
            ✓ Enregistrer
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