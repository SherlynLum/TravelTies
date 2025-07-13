import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import BudgetChart from './expensecomponents/BudgetChart';
import ExpenseList from './expensecomponents/ExpenseList';
import ExpensePieChart from './expensecomponents/ExpensePieChart';
import AddExpenseModal from './expensecomponents/AddExpenseModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExpenseItem } from '@/types/ExpenseItem';

// Define OwedBy type locally if needed
type OwedBy = {
  owedByUid: string;
  amount: number;
};

export default function ExpenseTracker() {
  const [view, setView] = useState<'budget' | 'breakdown'>('budget');
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [budget, setBudget] = useState(0);
  const [currency, setCurrency] = useState('$');
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [individualSpent, setIndividualSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackerId, setTrackerId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [knownUsers, setKnownUsers] = useState<{ label: string; uid: string }[]>([]);

  const tripId = '64abcdef9876543210abcd45';

  const fetchData = async () => {
    try {
      const trackerRes = await fetch(
        `https://travelties-expensetracker.onrender.com/api/expense-tracker/${tripId}`
      );
      const trackerData = await trackerRes.json();
      if (!trackerData._id) throw new Error('No tracker found');

      setTrackerId(trackerData._id);
      setBudget(trackerData.budget || 0);
      setCurrency(trackerData.currencySymbol || '$');
      setTotalExpenses(trackerData.totalExpenses || 0);

      const expensesRes = await fetch(
        `https://travelties-expensetracker.onrender.com/api/expenses/${trackerData._id}`
      );
      const expensesData: ExpenseItem[] = await expensesRes.json();
      setExpenses(expensesData);

      const individualExpenses = expensesData.filter(
        (e: ExpenseItem) =>
          !e.isShared ||
          (e.isShared && e.owedBy?.some((o: OwedBy) => o.owedByUid === 'me'))
      );

      const spent = individualExpenses.reduce((sum: number, e: ExpenseItem) => {
        if (!e.isShared) return sum + e.amountForPayer;
        const myOwed = e.owedBy?.find((o: OwedBy) => o.owedByUid === 'me');
        return sum + (myOwed?.amount || 0);
      }, 0);

      setIndividualSpent(spent);
    } catch (err) {
      console.error('Error loading tracker or expenses:', err);
      setError('Failed to load expense data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBudget = async (newBudget: number) => {
    try {
      const res = await fetch(
        `https://travelties-expensetracker.onrender.com/api/expense-tracker/${tripId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ budget: newBudget }),
        }
      );
      const data = await res.json();
      setBudget(data.budget);
    } catch (err) {
      console.error('Failed to update budget', err);
    }
  };

  const loadStoredUsers = async () => {
    try {
      const stored = await AsyncStorage.getItem('knownUsers');
      if (stored) setKnownUsers(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load known users', e);
    }
  };

  const updateStoredUsers = async (newUsers: { label: string; uid: string }[]) => {
    try {
      await AsyncStorage.setItem('knownUsers', JSON.stringify(newUsers));
      setKnownUsers(newUsers);
    } catch (e) {
      console.error('Failed to save known users', e);
    }
  };

  useEffect(() => {
    fetchData();
    loadStoredUsers();
  }, []);

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const res = await fetch(
        `https://travelties-expensetracker.onrender.com/api/expenses/${expenseId}`,
        {
          method: 'DELETE',
        }
      );

      if (res.ok) {
        fetchData();
      } else {
        console.error('Failed to delete expense');
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const handleEditExpense = (expense: ExpenseItem) => {
    setEditingExpense(expense);
    setShowAddModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>
          {view === 'budget' ? 'Budget Tracking' : 'Expense Breakdown'}
        </Text>

        <TouchableOpacity onPress={() => setView(view === 'budget' ? 'breakdown' : 'budget')}>
          <Text style={styles.switchText}>
            {view === 'budget' ? 'Switch to Expense Breakdown' : 'Switch to Budget Tracking'}
          </Text>
        </TouchableOpacity>

        {view === 'budget' ? (
          <BudgetChart
            currency={currency}
            budget={budget}
            spent={individualSpent}
            onEditBudget={handleEditBudget}
          />
        ) : (
          <ExpensePieChart expenses={expenses} />
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <ExpenseList
            expenses={expenses}
            currency={currency}
            onDelete={handleDeleteExpense}
            onEdit={handleEditExpense}
            onTogglePaidStatus={(updatedExpense) => {
              setExpenses(prev =>
                prev.map(e => e._id === updatedExpense._id ? updatedExpense : e)
              );
            }}
          />
        )}

        {view === 'breakdown' && (
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>Add Expense</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <AddExpenseModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingExpense(null);
        }}
        onSubmit={() => {
          setShowAddModal(false);
          setEditingExpense(null);
          fetchData();
          loadStoredUsers();
        }}
        expenseTrackerId={trackerId}
        editingExpense={editingExpense}
        knownUsers={knownUsers}
        updateKnownUsers={updateStoredUsers}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  switchText: { color: '#007AFF', textAlign: 'center', marginBottom: 10 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20, fontSize: 16 },
  addBtn: {
    backgroundColor: '#007AFF',
    padding: 10,
    margin: 10,
    borderRadius: 6,
    alignSelf: 'center',
  },
  addBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
