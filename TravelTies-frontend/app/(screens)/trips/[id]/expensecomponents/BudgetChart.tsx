import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

type Props = {
  currency: string;
  budget: number;
  spent: number;
  onEditBudget: (newBudget: number) => void;
};

export default function BudgetChart({ currency, budget, spent, onEditBudget }: Props) {
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  const [newBudget, setNewBudget] = useState(budget.toString());
  
  const percentage = budget > 0 ? spent / budget : 0;

  // Dynamic ring color based on percentage spent
  let chartColor = 'green';
  if (percentage > 1) chartColor = 'red';
  else if (percentage > 0.9) chartColor = 'orange';
  else if (percentage > 0.75) chartColor = 'gold';

  const handleSave = () => {
    const numericValue = parseFloat(newBudget);
    if (!isNaN(numericValue)) {
      onEditBudget(numericValue);
    }
    setShowBudgetInput(false);
  };

  return (
    <View style={styles.container}>
      <ProgressChart
        data={{ data: [percentage] }}
        width={screenWidth - 40}
        height={240}
        strokeWidth={16}
        radius={40}
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: () => chartColor,
        }}
        hideLegend={true}
      />
      <Text style={styles.text}>
        {currency}{spent.toFixed(2)} / {currency}{budget.toFixed(2)}
      </Text>

      {showBudgetInput ? (
        <View style={styles.inputContainer}>
          <TextInput
            value={newBudget}
            onChangeText={setNewBudget}
            keyboardType="numeric"
            style={styles.input}
            autoFocus={true}
          />
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          onPress={() => setShowBudgetInput(true)} 
          style={styles.editBtn}
        >
          <Text style={styles.editText}>Edit Budget</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    alignItems: 'center', 
    marginVertical: 10 
  },
  text: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginTop: 10 
  },
  editBtn: {
    marginTop: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    width: 200,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: 'green',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    width: 200,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
  },
});