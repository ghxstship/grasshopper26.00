'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { addBudgetLineItem } from '@/lib/actions/budgets';
import styles from './BudgetLineItemForm.module.css';

export interface BudgetLineItemFormProps {
  budgetId: string;
  categories: Array<{ id: string; category_name: string; budget_type: string }>;
}

export const BudgetLineItemForm: React.FC<BudgetLineItemFormProps> = ({
  budgetId,
  categories,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [itemType, setItemType] = React.useState<'revenue' | 'expense'>('expense');

  const filteredCategories = categories.filter(c => c.budget_type === itemType);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      await addBudgetLineItem(budgetId, formData);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>LINE ITEM DETAILS</h2>
        
        <div className={styles.field}>
          <label htmlFor="item_type" className={styles.label}>
            TYPE *
          </label>
          <select
            id="item_type"
            name="item_type"
            value={itemType}
            onChange={(e) => setItemType(e.target.value as 'revenue' | 'expense')}
            required
            className={styles.select}
          >
            <option value="expense">EXPENSE</option>
            <option value="revenue">REVENUE</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="line_item_name" className={styles.label}>
            NAME *
          </label>
          <input
            type="text"
            id="line_item_name"
            name="line_item_name"
            required
            className={styles.input}
            placeholder="e.g., Venue Rental, Ticket Sales"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="category_id" className={styles.label}>
            CATEGORY *
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            className={styles.select}
          >
            <option value="">SELECT CATEGORY</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>
            DESCRIPTION
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className={styles.textarea}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>BUDGET AMOUNT</h2>
        
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="quantity" className={styles.label}>
              QUANTITY
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              defaultValue="1"
              min="1"
              step="1"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="unit_cost" className={styles.label}>
              UNIT COST
            </label>
            <input
              type="number"
              id="unit_cost"
              name="unit_cost"
              step="0.01"
              min="0"
              className={styles.input}
              placeholder="0.00"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="budgeted_amount" className={styles.label}>
              TOTAL AMOUNT *
            </label>
            <input
              type="number"
              id="budgeted_amount"
              name="budgeted_amount"
              step="0.01"
              min="0"
              required
              className={styles.input}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="vendor_name" className={styles.label}>
            VENDOR
          </label>
          <input
            type="text"
            id="vendor_name"
            name="vendor_name"
            className={styles.input}
          />
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => router.back()}
          className={styles.buttonSecondary}
          disabled={isSubmitting}
        >
          CANCEL
        </button>
        <button
          type="submit"
          className={styles.buttonPrimary}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'ADDING...' : 'ADD LINE ITEM'}
        </button>
      </div>
    </form>
  );
};

BudgetLineItemForm.displayName = 'BudgetLineItemForm';
