-- Fix delete_transaction function with correct balance recalculation logic
CREATE OR REPLACE FUNCTION public.delete_transaction(transaction_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tx_to_delete account_transactions;
  account_rec customer_accounts;
  recalculated_balance numeric := 0;
  tx_rec record;
BEGIN
  -- Get transaction to delete
  SELECT * INTO tx_to_delete FROM account_transactions WHERE id = transaction_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  
  -- Get account
  SELECT * INTO account_rec FROM customer_accounts WHERE id = tx_to_delete.customer_account_id;
  
  -- Recalculate balance from scratch using all transactions EXCEPT the one being deleted
  FOR tx_rec IN 
    SELECT * FROM account_transactions 
    WHERE customer_account_id = account_rec.id 
      AND id != transaction_id
    ORDER BY created_at ASC, id ASC
  LOOP
    IF tx_rec.transaction_type = 'sale' THEN
      recalculated_balance := recalculated_balance + tx_rec.amount;
    ELSIF tx_rec.transaction_type = 'payment' THEN
      recalculated_balance := recalculated_balance - tx_rec.amount;
    ELSIF tx_rec.transaction_type = 'adjustment' THEN
      recalculated_balance := tx_rec.amount;
    END IF;
    
    -- Update balance_after for each transaction
    UPDATE account_transactions 
    SET balance_after = recalculated_balance 
    WHERE id = tx_rec.id;
  END LOOP;
  
  -- Update account balance
  UPDATE customer_accounts 
  SET balance = recalculated_balance, updated_at = now()
  WHERE id = account_rec.id;
  
  -- Delete the transaction
  DELETE FROM account_transactions WHERE id = transaction_id;
END;
$$;

-- Fix update_transaction function with correct balance recalculation logic
CREATE OR REPLACE FUNCTION public.update_transaction(transaction_id uuid, updates jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tx_to_update account_transactions;
  account_rec customer_accounts;
  recalculated_balance numeric := 0;
  tx_rec record;
BEGIN
  -- Get original transaction
  SELECT * INTO tx_to_update FROM account_transactions WHERE id = transaction_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  
  -- Get account
  SELECT * INTO account_rec FROM customer_accounts WHERE id = tx_to_update.customer_account_id;
  
  -- Update the transaction first
  UPDATE account_transactions
  SET
    transaction_type = COALESCE((updates->>'transaction_type')::text, transaction_type),
    amount = COALESCE((updates->>'amount')::numeric, amount),
    notes = COALESCE(updates->>'notes', notes)
  WHERE id = transaction_id;
  
  -- Recalculate balance from scratch using all transactions in chronological order
  FOR tx_rec IN 
    SELECT * FROM account_transactions 
    WHERE customer_account_id = account_rec.id 
    ORDER BY created_at ASC, id ASC
  LOOP
    IF tx_rec.transaction_type = 'sale' THEN
      recalculated_balance := recalculated_balance + tx_rec.amount;
    ELSIF tx_rec.transaction_type = 'payment' THEN
      recalculated_balance := recalculated_balance - tx_rec.amount;
    ELSIF tx_rec.transaction_type = 'adjustment' THEN
      recalculated_balance := tx_rec.amount;
    END IF;
    
    -- Update balance_after for each transaction
    UPDATE account_transactions 
    SET balance_after = recalculated_balance 
    WHERE id = tx_rec.id;
  END LOOP;
  
  -- Update account balance
  UPDATE customer_accounts 
  SET balance = recalculated_balance, updated_at = now()
  WHERE id = account_rec.id;
END;
$$;