import axios from "axios";

const API = axios.create({
  baseURL: "https://travelties-expensetracker.onrender.com/api",
});

// Get Expense Tracker by tripId
export const getExpenseTracker = async (tripId: string) => {
  try {
    const response = await API.get(`/expense-tracker/${tripId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch expense tracker", error);
    throw error;
  }
};

// Get Expenses by trackerId
export const getExpenses = async (trackerId: string) => {
  try {
    const response = await API.get(`/expenses/${trackerId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch expenses", error);
    throw error;
  }
};
