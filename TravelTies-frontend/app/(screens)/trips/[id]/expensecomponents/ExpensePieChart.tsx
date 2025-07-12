import { PieChart } from 'react-native-chart-kit';
import { View, Dimensions, StyleSheet, Text } from 'react-native';

const screenWidth = Dimensions.get("window").width;

interface ExpensePieChartProps {
  expenses?: Array<any>; // You might want to replace 'any' with a proper expense type
}

export default function ExpensePieChart({ expenses }: ExpensePieChartProps) {
  if (!expenses || expenses.length === 0) {
    return (
      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <Text>No expenses to display yet.</Text>
      </View>
    );
  }

  // Group expenses by category and sum their amounts
  const grouped = expenses.reduce((acc, expense) => {
    const cat = expense.category || 'uncategorised';
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += expense.amountForPayer || 0;
    return acc;
  }, {} as { [key: string]: number });

  // Prepare data for PieChart
  const data = Object.keys(grouped).map((cat) => ({
    name: cat,
    population: grouped[cat],
    color: categoryColors[cat] || '#ccc',
    legendFontColor: '#555',
    legendFontSize: 14,
  }));

  return (
    <View style={styles.container}>
      <PieChart
        data={data}
        width={screenWidth - 40}
        height={240}
        chartConfig={{
          color: () => `black`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        hasLegend={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({ container: { alignItems: 'center' } });

const categoryColors: { [key: string]: string } = {
  transportation: '#007AFF',
  accommodation: '#8E44AD',
  food_and_drink: '#27AE60',
  entertainment: '#E67E22',
  shopping: '#E74C3C',
  health: '#2ECC71',
  uncategorised: '#BDC3C7',
};
