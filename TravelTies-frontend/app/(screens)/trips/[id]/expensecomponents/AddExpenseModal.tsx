import React, { useState, useEffect } from 'react';
import { ExpenseItem } from '@/types/ExpenseItem';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const categoryOptions = [
  { label: 'Transportation', value: 'transportation', color: '#007AFF' },
  { label: 'Accommodation', value: 'accommodation', color: '#8E44AD' },
  { label: 'Food & Drink', value: 'food_and_drink', color: '#27AE60' },
  { label: 'Entertainment', value: 'entertainment', color: '#E67E22' },
  { label: 'Shopping', value: 'shopping', color: '#E74C3C' },
  { label: 'Health', value: 'health', color: '#2ECC71' },
];

type AddExpenseModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  expenseTrackerId: string;
  editingExpense: ExpenseItem | null;
  knownUsers: { label: string; uid: string }[];
  updateKnownUsers: (newUsers: { label: string; uid: string }[]) => void;
};

export default function AddExpenseModal({
  visible,
  onClose,
  onSubmit,
  expenseTrackerId,
  editingExpense,
  knownUsers,
  updateKnownUsers,
}: AddExpenseModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [splitMethod, setSplitMethod] = useState<'even' | 'custom'>('even');
  const [participants, setParticipants] = useState<string[]>([]);
  const [customSplits, setCustomSplits] = useState<{ [uid: string]: string }>({});
  const [newUserName, setNewUserName] = useState('');

  const currentUser = { label: 'Me', uid: 'me' };

  useEffect(() => {
    if (!knownUsers.find(u => u.uid === 'me')) {
      updateKnownUsers([...knownUsers, currentUser]);
    }
  }, []);

  useEffect(() => {
    if (editingExpense) {
      setName(editingExpense.name);
      setAmount(editingExpense.amountForPayer.toString());
      setCategory(editingExpense.category || '');
      setIsShared(editingExpense.isShared || false);

      if (editingExpense.isShared && editingExpense.owedBy) {
        const owedBy = editingExpense.owedBy;
        if (editingExpense.splitMethod === 'custom') {
          const splits: { [uid: string]: string } = {};
          owedBy.forEach(item => {
            splits[item.owedByUid] = item.amount.toString();
          });
          setCustomSplits(splits);
          setSplitMethod('custom');
          setParticipants(owedBy.map(item => item.owedByUid));
        } else {
          setSplitMethod('even');
          setParticipants(owedBy.map(item => item.owedByUid));
        }
      }
    } else {
      setName('');
      setAmount('');
      setCategory('');
      setIsShared(false);
      setSplitMethod('even');
      setParticipants([]);
      setCustomSplits({});
    }
  }, [editingExpense]);

  const handleSubmit = async () => {
    if (!name || !amount) {
      Alert.alert('Error', 'Please enter name and amount');
      return;
    }

    if (isShared && splitMethod === 'custom') {
      const totalCustomSplit = Object.values(customSplits).reduce((sum, val) => {
        const num = parseFloat(val);
        return sum + (isNaN(num) ? 0 : num);
      }, 0);

      const totalAmount = Number(amount);
      if (Math.abs(totalCustomSplit - totalAmount) > 0.01) {
        Alert.alert(
          'Split Mismatch',
          `Total custom split ($${totalCustomSplit.toFixed(2)}) does not match total amount ($${totalAmount.toFixed(2)}).`
        );
        return;
      }
    }

    let owedBy: { owedByUid: string; amount: number; isPaid: boolean }[] = [];

    if (isShared) {
      if (splitMethod === 'even') {
        const perPerson = Number(amount) / participants.length;
        owedBy = participants.map(uid => ({
          owedByUid: uid,
          amount: perPerson,
          isPaid: false,
        }));
      } else {
        owedBy = Object.keys(customSplits)
          .filter(uid => customSplits[uid] && !isNaN(Number(customSplits[uid])))
          .map(uid => ({
            owedByUid: uid,
            amount: Number(customSplits[uid]),
            isPaid: false,
          }));
      }
    }

    const payload = {
      expenseTrackerId,
      name,
      category,
      isShared,
      splitMethod: isShared ? splitMethod : undefined,
      amountForPayer: Number(amount),
      owedBy,
      ...(editingExpense && { _id: editingExpense._id }),
    };

    try {
      const url = editingExpense
        ? `https://travelties-expensetracker.onrender.com/api/expenses/${editingExpense._id}`
        : 'https://travelties-expensetracker.onrender.com/api/expenses';

      const method = editingExpense ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSubmit();
        setName('');
        setAmount('');
        setCategory('');
        setIsShared(false);
        setParticipants([]);
        setCustomSplits({});
        setNewUserName('');
      } else {
        Alert.alert('Failed', 'Could not save expense');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.innerContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.title}>{editingExpense ? 'Edit Expense' : 'Add Expense'}</Text>

            <TextInput
              placeholder="Expense Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Amount"
              style={styles.input}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <View style={Platform.OS === 'ios' ? undefined : styles.pickerWrapper}>
              <Picker
                selectedValue={category}
                onValueChange={(val) => setCategory(val)}
                style={Platform.OS === 'ios' ? undefined : styles.picker}
              >
                <Picker.Item label="-- Select Category (optional) --" value="" />
                {categoryOptions.map((opt) => (
                  <Picker.Item
                    key={opt.value}
                    label={opt.label}
                    value={opt.value}
                    color={opt.color}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, !isShared && styles.toggleActive]}
                onPress={() => setIsShared(false)}
              >
                <Text style={!isShared ? styles.toggleTextActive : styles.toggleText}>Individual</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, isShared && styles.toggleActive]}
                onPress={() => setIsShared(true)}
              >
                <Text style={isShared ? styles.toggleTextActive : styles.toggleText}>Shared</Text>
              </TouchableOpacity>
            </View>

            {isShared && (
              <View>
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, splitMethod === 'even' && styles.toggleActive]}
                    onPress={() => setSplitMethod('even')}
                  >
                    <Text style={splitMethod === 'even' ? styles.toggleTextActive : styles.toggleText}>Even Split</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, splitMethod === 'custom' && styles.toggleActive]}
                    onPress={() => setSplitMethod('custom')}
                  >
                    <Text style={splitMethod === 'custom' ? styles.toggleTextActive : styles.toggleText}>Custom Split</Text>
                  </TouchableOpacity>
                </View>

                {splitMethod === 'even' && (
                  <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Select participants:</Text>
                    {knownUsers.map(user => (
                      <TouchableOpacity
                        key={user.uid}
                        onPress={() => {
                          if (participants.includes(user.uid)) {
                            setParticipants(participants.filter(id => id !== user.uid));
                          } else {
                            setParticipants([...participants, user.uid]);
                          }
                        }}
                        style={styles.checkboxRow}
                      >
                        <Text style={{ color: participants.includes(user.uid) ? 'blue' : 'black' }}>
                          {participants.includes(user.uid) ? '✅' : '⬜'} {user.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <View style={{ marginTop: 10 }}>
                      <TextInput
                        placeholder="Add new user (name)"
                        style={styles.input}
                        value={newUserName}
                        onChangeText={setNewUserName}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          if (newUserName.trim()) {
                            const newUser = {
                              label: newUserName,
                              uid: newUserName.toLowerCase().replace(/\s+/g, '_'),
                            };
                            if (!knownUsers.some(u => u.uid === newUser.uid)) {
                              updateKnownUsers([...knownUsers, newUser]);
                            }
                            setNewUserName('');
                          }
                        }}
                        style={[styles.btn, styles.saveBtn, { marginTop: 5 }]}
                      >
                        <Text style={[styles.btnText, { color: 'white' }]}>Add User</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {splitMethod === 'custom' && (
                  <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Custom amount for each:</Text>
                    {knownUsers.map(user => (
                      <View key={user.uid} style={styles.customRow}>
                        <Text style={{ flex: 1 }}>{user.label}</Text>
                        <TextInput
                          placeholder="Amount"
                          keyboardType="numeric"
                          style={[styles.input, { flex: 1 }]}
                          value={customSplits[user.uid] || ''}
                          onChangeText={(val) => setCustomSplits({ ...customSplits, [user.uid]: val })}
                        />
                      </View>
                    ))}
                    <Text
                      style={{
                        marginTop: 5,
                        fontWeight: 'bold',
                        color:
                          Math.abs(
                            Object.values(customSplits).reduce((sum, val) => {
                              const num = parseFloat(val);
                              return sum + (isNaN(num) ? 0 : num);
                            }, 0) - Number(amount)
                          ) > 0.01
                            ? 'red'
                            : 'green',
                      }}
                    >
                      Total Split: $
                      {Object.values(customSplits)
                        .reduce((sum, val) => {
                          const num = parseFloat(val);
                          return sum + (isNaN(num) ? 0 : num);
                        }, 0)
                        .toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.btnRow}>
              <TouchableOpacity onPress={onClose} style={[styles.btn, styles.cancelBtn]}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} style={[styles.btn, styles.saveBtn]}>
                <Text style={[styles.btnText, { color: 'white' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    backgroundColor: '#fff',
    width: '90%',
    maxHeight: '85%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  scrollContainer: {
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  pickerWrapper: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: { height: 50, width: '100%' },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { padding: 10, flex: 1, alignItems: 'center', marginHorizontal: 5, borderRadius: 6 },
  cancelBtn: { backgroundColor: '#eee' },
  saveBtn: { backgroundColor: '#007AFF' },
  btnText: { fontWeight: 'bold' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toggleBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 5,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  toggleActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toggleText: {
    color: '#333',
  },
  toggleTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
});
