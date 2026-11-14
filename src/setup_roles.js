import bcrypt from 'bcrypt';
import pool, { testConnection } from './config/database.js';

async function setupRoles() {
  console.log('Connecting to Neon PostgreSQL...');
  await testConnection();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get the restaurant ID (The Golden Plate)
    const restRes = await client.query("SELECT id FROM restaurants LIMIT 1");
    let restaurantId;
    if (restRes.rows.length === 0) {
      console.log('Creating default restaurant...');
      const newRest = await client.query(`
        INSERT INTO restaurants (name, slug, currency, currency_symbol, tax_rate, tax_name)
        VALUES ('The Golden Plate', 'the-golden-plate', 'INR', '₹', 5.00, 'GST')
        RETURNING id
      `);
      restaurantId = newRest.rows[0].id;
    } else {
      restaurantId = restRes.rows[0].id;
    }
    console.log('Restaurant ID:', restaurantId);

    // Update constraints to allow all role names if needed
    try {
      await client.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
      await client.query("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('owner', 'admin', 'manager', 'staff', 'waiter', 'chef', 'kitchen'))");
      console.log('✅ users_role_check constraint updated');
    } catch (e) {
      console.log('Constraint note:', e.message);
    }

    try {
      await client.query('ALTER TABLE restaurant_members DROP CONSTRAINT IF EXISTS restaurant_members_role_check');
      await client.query("ALTER TABLE restaurant_members ADD CONSTRAINT restaurant_members_role_check CHECK (role IN ('owner', 'admin', 'manager', 'staff', 'waiter', 'chef', 'kitchen'))");
      console.log('✅ restaurant_members_role_check constraint updated');
    } catch (e) {
      console.log('Member constraint note:', e.message);
    }

    const passwordHash = await bcrypt.hash('Demo@1234', 12);

    const usersToCreate = [
      {
        email: 'owner@dineflow.com',
        name: 'Rajesh Sharma (Owner)',
        role: 'owner',
        phone: '+91-9876543210'
      },
      {
        email: 'manager@dineflow.com',
        name: 'Sita Devi (Billing Manager)',
        role: 'manager',
        phone: '+91-9876543211'
      },
      {
        email: 'waiter@dineflow.com',
        name: 'Anil Kumar (Waiter / Staff)',
        role: 'waiter',
        phone: '+91-9876543212'
      },
      {
        email: 'kitchen@dineflow.com',
        name: 'Ramesh Chef (Kitchen)',
        role: 'chef',
        phone: '+91-9876543213'
      },
      {
        email: 'demo@dineflow.com',
        name: 'Demo Owner',
        role: 'owner',
        phone: '+91-9876543200'
      }
    ];

    for (const u of usersToCreate) {
      // Upsert user
      const existing = await client.query('SELECT id FROM users WHERE email = $1', [u.email.toLowerCase()]);
      let userId;
      if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
        await client.query(
          `UPDATE users SET full_name = $1, password_hash = $2, role = $3, is_active = true WHERE id = $4`,
          [u.name, passwordHash, u.role, userId]
        );
        console.log(`Updated user: ${u.email} (${u.role})`);
      } else {
        const insertRes = await client.query(
          `INSERT INTO users (full_name, email, phone, password_hash, role, is_active)
           VALUES ($1, $2, $3, $4, $5, true)
           RETURNING id`,
          [u.name, u.email.toLowerCase(), u.phone, passwordHash, u.role]
        );
        userId = insertRes.rows[0].id;
        console.log(`Created user: ${u.email} (${u.role})`);
      }

      // Link to restaurant
      await client.query(
        `INSERT INTO restaurant_members (user_id, restaurant_id, role, is_active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (user_id, restaurant_id) 
         DO UPDATE SET role = EXCLUDED.role, is_active = true`,
        [userId, restaurantId, u.role]
      );
    }

    // Ensure all restaurant_tables are available
    await client.query("UPDATE restaurant_tables SET status = 'available'");
    console.log('✅ Tables status reset to available');

    await client.query('COMMIT');
    console.log('🎉 Setup roles completed successfully!');

    // Show summary
    const allUsers = await client.query('SELECT id, full_name, email, role FROM users ORDER BY created_at');
    console.table(allUsers.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Setup roles error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

setupRoles();
