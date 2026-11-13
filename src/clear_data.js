import pool, { testConnection } from './config/database.js';

async function clearData() {
  console.log('Connecting to Neon PostgreSQL to clean transactional data...');
  await testConnection();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Clearing order_items...');
    await client.query('DELETE FROM order_items');

    console.log('Clearing payments...');
    await client.query('DELETE FROM payments');

    console.log('Clearing orders...');
    await client.query('DELETE FROM orders');

    console.log('Clearing activity_logs...');
    await client.query('DELETE FROM activity_logs');

    console.log('Clearing contact_messages...');
    await client.query('DELETE FROM contact_messages');

    console.log('Clearing newsletter_subscribers...');
    await client.query('DELETE FROM newsletter_subscribers');

    console.log('Clearing password_reset_tokens...');
    await client.query('DELETE FROM password_reset_tokens');

    console.log('Resetting table status to available...');
    await client.query("UPDATE restaurant_tables SET status = 'available'");

    await client.query('COMMIT');
    console.log('✅ All orders, payments, logs, and transaction data cleared successfully!');

    // Verify remaining counts
    const tables = [
      'users',
      'restaurants',
      'restaurant_members',
      'menu_categories',
      'menu_items',
      'restaurant_tables',
      'staff',
      'orders',
      'order_items',
      'payments',
      'activity_logs',
    ];

    console.log('\nUpdated table row counts:');
    for (const t of tables) {
      const res = await client.query(`SELECT COUNT(*) as c FROM ${t}`);
      console.log(`  - ${t}: ${res.rows[0].c}`);
    }

    const userRes = await client.query('SELECT id, full_name, email, role FROM users');
    console.log('\nPreserved Login Users:');
    console.table(userRes.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error clearing data:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

clearData();
