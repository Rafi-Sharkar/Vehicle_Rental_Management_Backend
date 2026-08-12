import { Knex } from 'knex';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export async function seed(knex: Knex): Promise<void> {
  // Truncate existing tables in cascade order
  await knex('rentals').del();
  await knex('vehicles').del();
  await knex('staff').del();

  // Read SuperAdmin credentials from environment
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.EMAIL || 'rafisharkar144@gmail.com';
  const adminRawPassword =
    process.env.SUPER_ADMIN_PASSWORD || process.env.PASSWORD || '12345678';

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
  const superAdminPasswordHash = await bcrypt.hash(adminRawPassword, 10);

  // 1. Seed Staff Members
  const staffMembers = await knex('staff')
    .insert([
      {
        email: adminEmail,
        password_hash: superAdminPasswordHash,
        name: 'Super Admin Manager'
      },
      {
        email: 'manager@vrm.com',
        password_hash: defaultPasswordHash,
        name: 'Operations Manager'
      },
      {
        email: 'staff@vrm.com',
        password_hash: defaultPasswordHash,
        name: 'Rental Fleet Agent'
      }
    ])
    .returning('*');

  console.log(`Seeded ${staffMembers.length} Staff Members (SuperAdmin: ${adminEmail})`);

  // 2. Seed Vehicle Fleet
  const vehicles = await knex('vehicles')
    .insert([
      {
        name: 'Toyota Camry 2024',
        plate_number: 'ABC-1234',
        category: 'Sedan',
        daily_rate: 50.0
      },
      {
        name: 'Tesla Model 3',
        plate_number: 'EV-9999',
        category: 'Electric',
        daily_rate: 100.0
      },
      {
        name: 'Ford Transit Commercial Van',
        plate_number: 'VAN-5555',
        category: 'Van',
        daily_rate: 120.0
      },
      {
        name: 'BMW X5 Luxury SUV',
        plate_number: 'SUV-7777',
        category: 'SUV',
        daily_rate: 150.0
      },
      {
        name: 'Mercedes-Benz S-Class',
        plate_number: 'LUX-1000',
        category: 'Luxury',
        daily_rate: 250.0
      },
      {
        name: 'Hyundai Ioniq 5',
        plate_number: 'EV-5050',
        category: 'Electric',
        daily_rate: 90.0
      }
    ])
    .returning('*');

  console.log(`Seeded ${vehicles.length} Vehicles in Fleet`);

  const camry = vehicles.find((v) => v.plate_number === 'ABC-1234')!;
  const tesla = vehicles.find((v) => v.plate_number === 'EV-9999')!;
  const bmw = vehicles.find((v) => v.plate_number === 'SUV-7777')!;
  const mercedes = vehicles.find((v) => v.plate_number === 'LUX-1000')!;
  const hyundai = vehicles.find((v) => v.plate_number === 'EV-5050')!;

  // 3. Seed Rentals (including month boundary rental: July 29 - Aug 3)
  await knex('rentals').insert([
    {
      vehicle_id: camry.id,
      customer_name: 'John Doe',
      customer_phone: '+1-555-0199',
      start_date: '2026-07-29',
      end_date: '2026-08-03',
      total_amount: 300.0, // 6 days total (3 days in July, 3 days in Aug)
      status: 'completed'
    },
    {
      vehicle_id: tesla.id,
      customer_name: 'Alice Smith',
      customer_phone: '+1-555-0288',
      start_date: '2026-08-05',
      end_date: '2026-08-10',
      total_amount: 600.0, // 6 days
      status: 'completed'
    },
    {
      vehicle_id: bmw.id,
      customer_name: 'Michael Jordan',
      customer_phone: '+1-555-0377',
      start_date: '2026-08-12',
      end_date: '2026-08-18',
      total_amount: 1050.0, // 7 days @ $150
      status: 'ongoing'
    },
    {
      vehicle_id: mercedes.id,
      customer_name: 'Sarah Connor',
      customer_phone: '+1-555-0466',
      start_date: '2026-08-20',
      end_date: '2026-08-25',
      total_amount: 1500.0, // 6 days @ $250
      status: 'booked'
    },
    {
      vehicle_id: hyundai.id,
      customer_name: 'David Warner',
      customer_phone: '+1-555-0555',
      start_date: '2026-08-01',
      end_date: '2026-08-04',
      total_amount: 360.0, // 4 days @ $90
      status: 'completed'
    }
  ]);

  console.log('Seeded 5 Realistic Demo Rentals (including cross-month boundary rental)');
}
