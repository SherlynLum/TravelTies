import { PieChart } from 'react-native-chart-kit';
import { View, Dimensions, StyleSheet, Text } from 'react-native';

const screenWidth = Dimensions.get("window").width;

interface ExpensePieChartProps {
  expenses?: Array<any>;
}

export default function ExpensePieChart({ expenses }: ExpensePieChartProps) {
  const currentUserId = 'me';

  // STEP 1: Filter expenses that appear under the "Individual" tab
  const filteredExpenses = (expenses || []).flatMap((e) => {
    if (!e.isShared) {
      return [{ category: e.category || 'uncategorised', amount: e.amountForPayer }];
    }

    const myOwed = e.owedBy?.find((o: any) => o.owedByUid === currentUserId);
    if (myOwed) {
      return [{ category: e.category || 'uncategorised', amount: myOwed.amount }];
    }

    return [];
  });

  // STEP 2: Group by category
  const grouped = filteredExpenses.reduce<{ [key: string]: number }>((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += item.amount || 0;
    return acc;
  }, {});

  // STEP 3: Filter out zero values
  const filteredGrouped = Object.fromEntries(
    Object.entries(grouped).filter(([_, value]) => value > 0)
  );

  const data = Object.keys(filteredGrouped).map((cat) => ({
    name: cat,
    population: filteredGrouped[cat],
    color: categoryColors[cat] || '#ccc',
    legendFontColor: '#555',
    legendFontSize: 14,
  }));

  // STEP 4: Show fallback if nothing to show
  if (data.length === 0) {
    return (
      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <Text>No expenses to display yet.</Text>
      </View>
    );
  }

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

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
});

const categoryColors: { [key: string]: string } = {
  transportation: '#007AFF',
  accommodation: '#8E44AD',
  food_and_drink: '#27AE60',
  entertainment: '#E67E22',
  shopping: '#E74C3C',
  health: '#2ECC71',
  uncategorised: '#BDC3C7',
};
