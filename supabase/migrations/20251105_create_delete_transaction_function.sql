create or replace function delete_transaction(transaction_id uuid)
returns void as $$
begin
  -- 1. Get the transaction to be deleted
  declare
    transaction account_transactions;
    account customer_accounts;
    subsequent_transactions account_transactions[];
    new_balance numeric;
    current_balance numeric;
    tx record;
  begin
    select * from account_transactions where id = transaction_id into transaction;

    -- 2. Get the customer account
    select * from customer_accounts where id = transaction.customer_account_id into account;

    -- 3. Get all transactions for that account created after the one to be deleted
    select array_agg(t) from account_transactions t where customer_account_id = account.id and created_at > transaction.created_at into subsequent_transactions;

    -- 4. Calculate the new balance for the customer account
    new_balance := account.balance;
    if transaction.transaction_type = 'sale' then
      new_balance := new_balance - transaction.amount; -- Reverse the sale
    elsif transaction.transaction_type = 'payment' then
      new_balance := new_balance + transaction.amount; -- Reverse the payment
    end if;

    -- 5. Update the customer account balance
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

    -- 7. Delete the transaction
    delete from account_transactions where id = transaction_id;
  end;
end;
$$ language plpgsql;