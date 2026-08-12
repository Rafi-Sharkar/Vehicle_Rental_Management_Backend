process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../app';
import db from '../config/db';

async function runTests() {
  console.log('🧪 Starting Vehicle Rental Management Integration Tests...\n');

  let token = '';
  let tempStaffToken = '';
  let createdVehicleId = 0;
  let createdRentalId = 0;

  try {
    // 1. Healthcheck
    console.log('1. Testing GET /health ...');
    const healthRes = await request(app).get('/health');
    console.assert(healthRes.status === 200, `Expected status 200, got ${healthRes.status}`);
    console.assert(healthRes.body.success === true, 'Expected success === true');
    console.log('✅ Healthcheck passed.\n');

    // 2. Staff Registration (POST /auth/register)
    console.log('2. Testing POST /auth/register ...');
    const registerEmail = `newstaff-${Date.now()}@vrm.com`;
    const regRes = await request(app)
      .post('/auth/register')
      .send({ email: registerEmail, password: 'Password123!', name: 'New Staff Member' });
    console.assert(regRes.status === 201, `Expected 201, got ${regRes.status}`);
    console.assert(!!regRes.body.data.token, 'Expected JWT token on registration');
    tempStaffToken = regRes.body.data.token;
    console.log(`✅ Registered staff member ${registerEmail}.\n`);

    // 3. GET /auth/profile (Fetch current staff profile)
    console.log('3. Testing GET /auth/profile ...');
    const profileRes = await request(app)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${tempStaffToken}`);
    console.assert(profileRes.status === 200, `Expected 200, got ${profileRes.status}`);
    console.assert(profileRes.body.data.email === registerEmail, `Expected email ${registerEmail}`);
    console.log('✅ Profile retrieved successfully.\n');

    // 4. PATCH /auth/profile (Update current staff profile)
    console.log('4. Testing PATCH /auth/profile ...');
    const updateProfRes = await request(app)
      .patch('/auth/profile')
      .set('Authorization', `Bearer ${tempStaffToken}`)
      .send({ name: 'Staff Updated Name' });
    console.assert(updateProfRes.status === 200, `Expected 200, got ${updateProfRes.status}`);
    console.assert(updateProfRes.body.data.name === 'Staff Updated Name', 'Expected name updated');
    console.log('✅ Profile updated successfully.\n');

    // 5. DELETE /auth/profile (Delete current staff profile)
    console.log('5. Testing DELETE /auth/profile ...');
    const delProfRes = await request(app)
      .delete('/auth/profile')
      .set('Authorization', `Bearer ${tempStaffToken}`);
    console.assert(delProfRes.status === 200, `Expected 200, got ${delProfRes.status}`);
    console.log('✅ Profile deleted successfully.\n');

    // 6. Auth Login Failure
    console.log('6. Testing POST /auth/login (Invalid Credentials) ...');
    const failLoginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@vrm.com', password: 'WrongPassword' });
    console.assert(failLoginRes.status === 401, `Expected 401, got ${failLoginRes.status}`);
    console.log('✅ Invalid login rejected.\n');

    // 7. Auth Login Success
    console.log('7. Testing POST /auth/login (Valid Admin Credentials) ...');
    const adminEmail =
      process.env.SUPER_ADMIN_EMAIL || process.env.EMAIL || 'rafisharkar144@gmail.com';
    const adminPassword =
      process.env.SUPER_ADMIN_PASSWORD || process.env.PASSWORD || '12345678';
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword });
    console.assert(loginRes.status === 200, `Expected 200, got ${loginRes.status}`);
    console.assert(!!loginRes.body.data.token, 'Expected JWT token');
    token = loginRes.body.data.token;
    console.log(`✅ Admin login successful. Received JWT token.\n`);

    // 8. Protected Route Rejection without Auth Header
    console.log('8. Testing Protected Route GET /vehicles (No Auth Header) ...');
    const noAuthRes = await request(app).get('/vehicles');
    console.assert(noAuthRes.status === 401, `Expected 401, got ${noAuthRes.status}`);
    console.log('✅ Unauthenticated request blocked.\n');

    // 9. GET /vehicles (With Auth Header)
    console.log('9. Testing GET /vehicles ...');
    const vehiclesRes = await request(app)
      .get('/vehicles')
      .set('Authorization', `Bearer ${token}`);
    console.assert(vehiclesRes.status === 200, `Expected 200, got ${vehiclesRes.status}`);
    console.assert(vehiclesRes.body.data.length >= 3, 'Expected at least 3 seeded vehicles');
    console.log(`✅ Retrieved ${vehiclesRes.body.data.length} vehicles.\n`);

    // 10. POST /vehicles (Create New Vehicle)
    console.log('10. Testing POST /vehicles ...');
    const uniquePlate = `POR-${Date.now().toString().slice(-4)}`;
    const createVehicleRes = await request(app)
      .post('/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Porsche 911 GT3')
      .field('plate_number', uniquePlate)
      .field('category', 'Sports')
      .field('daily_rate', '250.00');
    console.assert(createVehicleRes.status === 201, `Expected 201, got ${createVehicleRes.status}`);
    createdVehicleId = createVehicleRes.body.data.id;
    console.log(`✅ Created vehicle ID: ${createdVehicleId} (${createVehicleRes.body.data.name})\n`);

    // 11. GET /vehicles/:id
    console.log(`11. Testing GET /vehicles/${createdVehicleId} ...`);
    const getVehicleRes = await request(app)
      .get(`/vehicles/${createdVehicleId}`)
      .set('Authorization', `Bearer ${token}`);
    console.assert(getVehicleRes.status === 200, `Expected 200, got ${getVehicleRes.status}`);
    console.assert(getVehicleRes.body.data.plate_number === uniquePlate, `Expected plate ${uniquePlate}`);
    console.log('✅ Vehicle details retrieved successfully.\n');

    // 12. PUT /vehicles/:id (Update Daily Rate)
    console.log(`12. Testing PUT /vehicles/${createdVehicleId} ...`);
    const updateVehicleRes = await request(app)
      .put(`/vehicles/${createdVehicleId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('daily_rate', '280.00');
    console.assert(updateVehicleRes.status === 200, `Expected 200, got ${updateVehicleRes.status}`);
    console.assert(Number(updateVehicleRes.body.data.daily_rate) === 280.0, 'Expected rate 280.00');
    console.log('✅ Vehicle updated successfully.\n');

    // 13. POST /rentals (Valid Booking: 2026-08-15 to 2026-08-17 - 3 Days @ 280.00 = 840.00)
    console.log('13. Testing POST /rentals (Valid Booking: 2026-08-15 to 2026-08-17 - 3 Days @ 280.00 = 840.00) ...');
    const createRentalRes = await request(app)
      .post('/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vehicle_id: createdVehicleId,
        customer_name: 'Robert Miller',
        customer_phone: '+1-555-9988',
        start_date: '2026-08-15',
        end_date: '2026-08-17'
      });
    console.assert(createRentalRes.status === 201, `Expected 201, got ${createRentalRes.status}`);
    console.assert(
      Number(createRentalRes.body.data.total_amount) === 840.0,
      `Expected $840.00, got ${createRentalRes.body.data.total_amount}`
    );
    createdRentalId = createRentalRes.body.data.id;
    console.log(
      `✅ Rental created ID: ${createdRentalId}, Total Amount: $${createRentalRes.body.data.total_amount}\n`
    );

    // 14. POST /rentals (Double Booking Conflict Test -> Expect 409)
    console.log('14. Testing POST /rentals (Overlapping Booking -> Expect 409 Conflict) ...');
    const overlapRes = await request(app)
      .post('/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vehicle_id: createdVehicleId,
        customer_name: 'Jane Doe',
        customer_phone: '+1-555-7766',
        start_date: '2026-08-16',
        end_date: '2026-08-20'
      });
    console.assert(overlapRes.status === 409, `Expected 409 Conflict, got ${overlapRes.status}`);
    console.assert(overlapRes.body.message.includes('already booked'), 'Expected conflict message');
    console.log(`✅ Double booking correctly rejected with HTTP 409 Conflict.\n`);

    // 15. POST /rentals (Single Day Booking Test -> Same Start & End Date = 1 Day)
    console.log('15. Testing POST /rentals (Same Start/End Date -> 1 Day Calculation) ...');
    const singleDayRes = await request(app)
      .post('/rentals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vehicle_id: createdVehicleId,
        customer_name: 'Same Day User',
        customer_phone: '+1-555-1111',
        start_date: '2026-08-01',
        end_date: '2026-08-01'
      });
    console.assert(singleDayRes.status === 201, `Expected 201, got ${singleDayRes.status}`);
    console.assert(
      Number(singleDayRes.body.data.total_amount) === 280.0,
      `Expected 1 day amount $280.00, got ${singleDayRes.body.data.total_amount}`
    );
    console.log('✅ Single-day booking calculated correctly as 1 day.\n');

    // 16. GET /reports/rentals?month=2026-08 (Monthly Report Proration Verification)
    console.log('16. Testing GET /reports/rentals?month=2026-08 (Verifying Cross-Month Proration) ...');
    const reportRes = await request(app)
      .get('/reports/rentals?month=2026-08')
      .set('Authorization', `Bearer ${token}`);
    console.assert(reportRes.status === 200, `Expected 200, got ${reportRes.status}`);

    const reportData = reportRes.body.data;
    console.log(`Report Month: ${reportData.month}`);

    const camryReport = reportData.vehicles.find((v: { plate_number: string }) => v.plate_number === 'ABC-1234');
    console.assert(camryReport !== undefined, 'Expected Toyota Camry in report');
    console.assert(
      camryReport.days_rented === 3,
      `Expected 3 prorated days in Aug for July 29-Aug 3 rental, got ${camryReport.days_rented}`
    );
    console.assert(
      camryReport.revenue === 150,
      `Expected $150 revenue for 3 days @ $50/day, got ${camryReport.revenue}`
    );

    console.log(
      `✅ Cross-month rental proration verified: July 29 - Aug 3 rental contributed exactly 3 days ($150.00) to August report!`
    );
    console.log(
      `🏆 Highest Revenue Vehicle for Aug 2026: ${reportData.highest_revenue_vehicle?.name} ($${reportData.highest_revenue_vehicle?.revenue})\n`
    );

    // 17. DELETE /vehicles/:id (Soft Delete)
    console.log(`17. Testing DELETE /vehicles/${createdVehicleId} (Soft Delete) ...`);
    const deleteVehicleRes = await request(app)
      .delete(`/vehicles/${createdVehicleId}`)
      .set('Authorization', `Bearer ${token}`);
    console.assert(deleteVehicleRes.status === 200, `Expected 200, got ${deleteVehicleRes.status}`);

    const verifyDeletedRes = await request(app)
      .get(`/vehicles/${createdVehicleId}`)
      .set('Authorization', `Bearer ${token}`);
    console.assert(
      verifyDeletedRes.status === 404,
      `Expected 404 for soft deleted vehicle, got ${verifyDeletedRes.status}`
    );
    console.log('✅ Soft delete verified.\n');

    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runTests();
