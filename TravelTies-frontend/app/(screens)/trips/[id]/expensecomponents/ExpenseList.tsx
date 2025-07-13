import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const categoryColors = {
  transportation: '#007AFF',
  accommodation: '#8E44AD',
  food_and_drink: '#27AE60',
  entertainment: '#E67E22',
  shopping: '#E74C3C',
  health: '#2ECC71',
  uncategorised: '#BDC3C7',
};

type OwedBy = {
  owedByUid: string;
  amount: number;
  isPaid?: boolean;
};

type ExpenseItem = {
  _id: string;
  category?: string;
  name: string;
  amountForPayer: number;
  isShared?: boolean;
  owedBy?: OwedBy[];
};

type ExpenseListProps = {
  expenses: ExpenseItem[];
  currency: string;
  onDelete: (id: string) => void;
  onEdit: (expense: ExpenseItem) => void;
  onTogglePaidStatus?: (updatedExpense: ExpenseItem) => void;
};

export default function ExpenseList({ expenses, currency, onDelete, onEdit, onTogglePaidStatus }: ExpenseListProps) {
  const [tab, setTab] = useState<'personal' | 'split'>('personal');

  const confirmDelete = (id: string) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => onDelete(id), style: 'destructive' },
    ]);
  };

  const filteredExpenses =
    tab === 'personal'
      ? expenses.filter(
          (e) =>
            !e.isShared ||
            (e.isShared && e.owedBy?.some((o) => o.owedByUid === 'me'))
        )
      : expenses.filter(
          (e) =>
            e.isShared && e.owedBy?.some((o) => o.owedByUid !== 'me')
        );

  return (
    <View>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'personal' && styles.tabActive]}
          onPress={() => setTab('personal')}
        >
          <Text
            style={[
              styles.tabText,
              tab === 'personal' ? styles.activeTabText : styles.inactiveTabText,
            ]}
          >
            Individual
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'split' && styles.tabActive]}
          onPress={() => setTab('split')}
        >
          <Text
            style={[
              styles.tabText,
              tab === 'split' ? styles.activeTabText : styles.inactiveTabText,
            ]}
          >
            Split Requests
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        {filteredExpenses.length === 0 ? (
          <Text style={styles.noExpenseText}>
            {tab === 'personal'
              ? 'No personal expenses recorded.'
              : 'No split requests yet.'}
          </Text>
        ) : (
          filteredExpenses.map((item, index) => (
            <View key={item._id || index} style={{ paddingHorizontal: 10, marginBottom: 10 }}>
              <View style={styles.expenseItemRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor:
                        categoryColors[item.category as keyof typeof categoryColors] ||
                        categoryColors.uncategorised,
                      marginRight: 8,
                    }}
                  />
                  <Text style={styles.expenseItem}>
                    {item.name} — {currency}
                    {tab === 'personal' && item.isShared
                      ? (
                          item.owedBy?.find((o) => o.owedByUid === 'me')?.amount.toFixed(2) || '0.00'
                        )
                      : item.amountForPayer.toFixed(2)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={() => onEdit(item)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(item._id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {tab === 'personal' && item.isShared && item.owedBy?.some((p) => p.owedByUid === 'me') && (
                <Text style={{ paddingLeft: 16, color: '#555' }}>
                  • Shared expense
                </Text>
              )}

              {tab === 'split' &&
                item.owedBy
                  ?.filter((p) => p.owedByUid !== 'me')
                  .map((p, i) => {
                    const isPaid = p.isPaid;
                    return (
                      <View
                        key={i}
                        style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 16, marginBottom: 4 }}
                      >
                        <Text style={{ color: '#333', flex: 1 }}>
                          • {p.owedByUid} owes you {currency}
                          {p.amount.toFixed(2)} {isPaid ? '(done)' : ''}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            const newOwedBy = item.owedBy?.map(o =>
                              o.owedByUid === p.owedByUid ? { ...o, isPaid: !isPaid } : o
                            );
                            const updatedExpense = { ...item, owedBy: newOwedBy };
                            if (onTogglePaidStatus) onTogglePaidStatus(updatedExpense);
                          }}
                        >
                          <Text style={{ color: isPaid ? '#007AFF' : 'green', fontWeight: 'bold' }}>
                            {isPaid ? 'Undo' : '✓'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  tabActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tabText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  activeTabText: {
    color: 'white',
  },
  inactiveTabText: {
    color: 'black',
  },
  expenseItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  expenseItem: {
    fontSize: 16,
    paddingVertical: 6,
  },
  deleteText: {
    color: 'red',
    fontWeight: 'bold',
  },
  editText: {
    color: '#007AFF',
    fontWeight: 'bold',
    marginRight: 10,
  },
  noExpenseText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
  },
});