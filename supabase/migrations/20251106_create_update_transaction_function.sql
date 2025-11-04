create or replace function update_transaction(transaction_id uuid, updates jsonb)
returns void as $$
begin
  -- 1. Get the original transaction
  declare
    original_transaction account_transactions;
    account customer_accounts;
    subsequent_transactions account_transactions[];
    amount_difference numeric;
    new_balance numeric;
    current_balance numeric;
    tx record;
  begin
    select * from account_transactions where id = transaction_id into original_transaction;

    -- 2. Get the customer account
    select * from customer_accounts where id = original_transaction.customer_account_id into account;

    -- 3. Get all transactions for that account created after the one to be updated
    select array_agg(t) from account_transactions t where customer_account_id = account.id and created_at > original_transaction.created_at into subsequent_transactions;

    -- 4. Calculate the difference in the amount
    amount_difference := (updates->>'amount')::numeric - original_transaction.amount;

    -- 5. Update the customer account balance
    new_balance := account.balance + amount_difference;
    update customer_accounts set balance = new_balance where id = account.id;

    -- 6. Update the balance_after for all subsequent transactions
    current_balance := new_balance;
    foreach tx in array subsequent_transactions
    loop
      if tx.transaction_type = 'sale' then
        current_balance := current_balance + tx.amount;
      elsif tx.transaction_type = 'payment' then
        current_balance := current_balance - tx.amount;
      end if;
      update account_transactions set balance_after = current_balance where id = tx.id;
    end loop;

    -- 7. Update the transaction
    update account_transactions
    set
      transaction_type = updates->>'transaction_type',
      amount = (updates->>'amount')::numeric,
      notes = updates->>'notes'
    where id = transaction_id;
  end;
end;
$$ language plpgsql;