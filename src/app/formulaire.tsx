import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';


export default function FormulaireScreen() {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');

  // Date
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Liste déroulante
  const [open, setOpen] = useState(false);
  const [ville, setVille] = useState<string | null>(null);
  const [items, setItems] = useState([
    { label: 'Antananarivo', value: 'tana' },
    { label: 'Toamasina', value: 'toamasina' },
    { label: 'Fianarantsoa', value: 'fianarantsoa' },
  ]);

  // Sélection multiple
  const [selected, setSelected] = useState<string[]>([]);

  const categories = [
    { key: '1', value: 'Informatique' },
    { key: '2', value: 'Finance' },
    { key: '3', value: 'RH' },
    { key: '4', value: 'Marketing' },
  ];

  // Auto-complete
  const suggestions = [
    { id: '1', title: 'Jean Rakoto' },
    { id: '2', title: 'Marie Rabe' },
    { id: '3', title: 'Teddy Andriamihaingo' },
    { id: '4', title: 'Hery Rasolo' },
  ];

  const handleSubmit = () => {
    const data = {
      nom,
      description,
      date,
      ville,
      categories: selected,
    };

    console.log(data);
    alert('Formulaire enregistré');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Formulaire</Text>

      <Text style={styles.label}>Nom</Text>
      <TextInput
        style={styles.input}
        placeholder="Entrer un nom"
        value={nom}
        onChangeText={setNom}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Date</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}>
        <Text>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Liste déroulante</Text>
      <View style={{ zIndex: 3000 }}>
        <DropDownPicker
          open={open}
          value={ville}
          items={items}
          setOpen={setOpen}
          setValue={setVille}
          setItems={setItems}
          placeholder="Choisir une ville"
        />
      </View>

      <Text style={styles.label}>Sélection multiple</Text>
      <MultipleSelectList
        setSelected={(val: string[]) => setSelected(val)}
        data={categories}
        save="value"
        label="Catégories"
      />

      <Text style={styles.label}>Auto Complete</Text>
      <AutocompleteDropdown
        clearOnFocus={false}
        closeOnBlur={true}
        dataSet={suggestions}
        textInputProps={{
          placeholder: 'Rechercher un utilisateur',
        }}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Enregistrer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F5F5F5',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

