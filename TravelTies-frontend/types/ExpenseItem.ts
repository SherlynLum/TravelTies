export type ExpenseItem = {
  _id: string;
  name: string;
  amountForPayer: number;
  category?: string;
  isShared?: boolean;
  splitMethod?: 'even' | 'custom';
  owedBy?: {
    owedByUid: string;
    amount: number;
    isPaid?: boolean;
  }[];
};
