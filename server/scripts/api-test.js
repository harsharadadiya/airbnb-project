// End-to-end API test. It talks to the running server like a real app would.
//
// How to use:
//   1. npm run seed        (fresh demo data)
//   2. npm run dev         (in one terminal)
//   3. npm run test:api    (in another terminal)
//
// Change the address with:  API_URL=https://your-api.onrender.com/api npm run test:api
const API = process.env.API_URL || 'http://localhost:5000/api';

let passed = 0;
let failed = 0;

async function call(method, path, { token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function check(name, condition, details = '') {
  if (condition) {
    passed += 1;
    console.log(`  ✅ ${name}`);
  } else {
    failed += 1;
    console.log(`  ❌ ${name} ${details}`);
  }
}

// "YYYY-MM-DD" for a date N days from today
const day = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

async function run() {
  console.log(`\nTesting ${API}\n`);

  console.log('Health');
  const health = await call('GET', '/health');
  check('API is up and database is connected', health.status === 200 && health.data.database === 'connected', JSON.stringify(health.data));

  console.log('\nAuth');
  const guestLogin = await call('POST', '/auth/login', { body: { email: 'guest@staynest.dev', password: 'Password123' } });
  check('Guest can log in', guestLogin.status === 200 && guestLogin.data.token);
  const guestToken = guestLogin.data.token;

  const hostLogin = await call('POST', '/auth/login', { body: { email: 'host@staynest.dev', password: 'Password123' } });
  check('Host can log in', hostLogin.status === 200 && hostLogin.data.user.role === 'host');
  const hostToken = hostLogin.data.token;

  const wrong = await call('POST', '/auth/login', { body: { email: 'guest@staynest.dev', password: 'nope' } });
  check('Wrong password is rejected (401)', wrong.status === 401);

  const badRegister = await call('POST', '/auth/register', { body: { name: 'A', email: 'not-an-email', password: '123' } });
  check('Invalid sign-up returns field errors (400)', badRegister.status === 400 && badRegister.data.errors?.length >= 3);

  const email = `tester_${Date.now()}@staynest.dev`;
  const reg = await call('POST', '/auth/register', { body: { name: 'Test User', email, password: 'Password123' } });
  check('New user can register', reg.status === 201 && reg.data.user.email === email && !reg.data.user.password);
  const dup = await call('POST', '/auth/register', { body: { name: 'Test User', email, password: 'Password123' } });
  check('Same email cannot register twice (409)', dup.status === 409);

  const me = await call('GET', '/auth/me', { token: guestToken });
  check('GET /auth/me returns the user', me.status === 200 && me.data.user.email === 'guest@staynest.dev');
  const noToken = await call('GET', '/auth/me');
  check('Protected route without token is blocked (401)', noToken.status === 401);

  console.log('\nListings & search');
  const all = await call('GET', '/listings?limit=50');
  check('Listings are returned', all.status === 200 && all.data.listings.length > 0);
  const goa = await call('GET', '/listings?location=goa');
  check('Search by location works', goa.data.listings?.every((l) => /goa/i.test(l.location.city)));
  const cheap = await call('GET', '/listings?maxPrice=100&guests=2&sort=price_asc');
  const prices = cheap.data.listings?.map((l) => l.pricePerNight) ?? [];
  check('Price filter + sort works', prices.every((p) => p <= 100) && prices.join() === [...prices].sort((a, b) => a - b).join());
  const badQuery = await call('GET', '/listings?checkIn=2026-01-05');
  check('checkIn without checkOut is rejected (400)', badQuery.status === 400);
  const badId = await call('GET', '/listings/123');
  check('Invalid id returns 400', badId.status === 400);

  console.log('\nHost creates a listing');
  const guestCreate = await call('POST', '/listings', { token: guestToken, body: {} });
  check('Guests cannot create listings (403)', guestCreate.status === 403);
  const newListing = {
    title: 'API test apartment',
    description: 'A temporary listing created by the automated API test script.',
    category: 'City',
    pricePerNight: 100,
    maxGuests: 3,
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    amenities: ['Wifi'],
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
    location: { address: '1 Test Street', city: 'Testville', country: 'Testland', lat: 10, lng: 20 },
  };
  const created = await call('POST', '/listings', { token: hostToken, body: newListing });
  check('Host can create a listing', created.status === 201 && created.data.listing._id);
  const listingId = created.data.listing._id;
  const patched = await call('PATCH', `/listings/${listingId}`, { token: hostToken, body: { pricePerNight: 120 } });
  check('Host can update the listing', patched.status === 200 && patched.data.listing.pricePerNight === 120);

  console.log('\nBooking flow');
  const booking = { listingId, checkIn: day(60), checkOut: day(63), guests: 2 };
  const b1 = await call('POST', '/bookings', { token: guestToken, body: booking });
  check('Guest can book (3 nights)', b1.status === 201 && b1.data.booking.nights === 3);
  check('Price is calculated by the server (3 × 120 + 10% fee = 396)', b1.data.booking?.totalPrice === 396, `got ${b1.data.booking?.totalPrice}`);

  const overlap = await call('POST', '/bookings', { token: guestToken, body: { ...booking, checkIn: day(62), checkOut: day(65) } });
  check('Overlapping dates are rejected (409)', overlap.status === 409);
  const back2back = await call('POST', '/bookings', { token: guestToken, body: { ...booking, checkIn: day(63), checkOut: day(64) } });
  check('Check-in on another guest’s check-out day is allowed', back2back.status === 201);

  const tooMany = await call('POST', '/bookings', { token: guestToken, body: { ...booking, checkIn: day(80), checkOut: day(81), guests: 9 } });
  check('Too many guests is rejected (400)', tooMany.status === 400);
  const past = await call('POST', '/bookings', { token: guestToken, body: { ...booking, checkIn: day(-3), checkOut: day(-1) } });
  check('Dates in the past are rejected (400)', past.status === 400);
  const own = await call('POST', '/bookings', { token: hostToken, body: { ...booking, checkIn: day(90), checkOut: day(91) } });
  check('Host cannot book own listing (400)', own.status === 400);

  // Race condition test: 5 people try to book the same nights at the same moment
  const race = await Promise.all(
    Array.from({ length: 5 }, () => call('POST', '/bookings', { token: guestToken, body: { ...booking, checkIn: day(100), checkOut: day(104) } }))
  );
  const winners = race.filter((r) => r.status === 201).length;
  check('5 simultaneous requests for the same dates -> exactly 1 succeeds', winners === 1, `(${winners} succeeded)`);

  const avail = await call('GET', `/listings/${listingId}/availability`);
  check('Availability shows booked nights', avail.data.bookedDates?.includes(day(60)) && !avail.data.bookedDates.includes(day(63 + 1)));

  const dated = await call('GET', `/listings?checkIn=${day(61)}&checkOut=${day(62)}&limit=50`);
  check('Search with dates hides booked listings', !dated.data.listings?.some((l) => l._id === listingId));

  const cancel = await call('PATCH', `/bookings/${b1.data.booking._id}/cancel`, { token: guestToken });
  check('Guest can cancel an upcoming booking', cancel.status === 200 && cancel.data.booking.status === 'cancelled');
  const rebook = await call('POST', '/bookings', { token: guestToken, body: booking });
  check('Cancelled dates can be booked again', rebook.status === 201);

  const trips = await call('GET', '/bookings/me', { token: guestToken });
  check('Guest sees their trips', trips.status === 200 && trips.data.bookings.length > 0);

  console.log('\nReviews');
  const lakeside = all.data.listings.find((l) => l.title.startsWith('Lakeside cottage'));
  if (lakeside) {
    const elig = await call('GET', `/listings/${lakeside._id}/reviews/eligibility`, { token: guestToken });
    check('Guest with a completed stay can review', elig.data.canReview === true, JSON.stringify(elig.data));
    const shortReview = await call('POST', `/listings/${lakeside._id}/reviews`, { token: guestToken, body: { rating: 6, comment: 'bad' } });
    check('Invalid review is rejected (400)', shortReview.status === 400);
    const review = await call('POST', `/listings/${lakeside._id}/reviews`, {
      token: guestToken,
      body: { rating: 4, comment: 'Lovely place by the lake, would come back again.' },
    });
    check('Review is created', review.status === 201);
    const after = await call('GET', `/listings/${lakeside._id}`);
    check('Average rating is recalculated', after.data.listing.reviewCount >= 1 && after.data.listing.avgRating > 0);
    const again = await call('POST', `/listings/${lakeside._id}/reviews`, { token: guestToken, body: { rating: 5, comment: 'Trying to review twice here.' } });
    check('Second review by the same guest is rejected (409)', again.status === 409);
    if (review.data.review) {
      const del = await call('DELETE', `/reviews/${review.data.review._id}`, { token: guestToken });
      check('Author can delete their review', del.status === 200);
    }
  } else {
    check('Seeded "Lakeside cottage" listing exists (run npm run seed)', false);
  }
  const noStay = await call('POST', `/listings/${listingId}/reviews`, { token: reg.data.token, body: { rating: 5, comment: 'I never stayed here at all.' } });
  check('Users without a completed stay cannot review (403)', noStay.status === 403);

  console.log('\nHost dashboard');
  const stats = await call('GET', '/host/stats', { token: hostToken });
  check('Host stats load', stats.status === 200 && stats.data.stats.totalListings >= 1);
  const hostBookings = await call('GET', '/host/bookings', { token: hostToken });
  check('Host sees reservations on their listings', hostBookings.data.bookings?.some((b) => b.listing?._id === listingId));
  const guestDash = await call('GET', '/host/stats', { token: guestToken });
  check('Guests cannot open the host dashboard (403)', guestDash.status === 403);

  console.log('\nCleanup');
  const blocked = await call('DELETE', `/listings/${listingId}`, { token: hostToken });
  check('Listing with upcoming bookings cannot be deleted (409)', blocked.status === 409);
  const mine = await call('GET', '/bookings/me', { token: guestToken });
  for (const b of mine.data.bookings.filter((x) => x.listing?._id === listingId && x.status === 'confirmed')) {
    await call('PATCH', `/bookings/${b._id}/cancel`, { token: hostToken }); // host cancels
  }
  const deleted = await call('DELETE', `/listings/${listingId}`, { token: hostToken });
  check('Host can delete the listing after cancelling bookings', deleted.status === 200);

  const missing = await call('GET', '/nothing-here');
  check('Unknown route returns 404', missing.status === 404);

  console.log(`\n${failed === 0 ? '🎉' : '⚠️ '} ${passed} passed, ${failed} failed\n`);
  process.exit(failed === 0 ? 0 : 1);
}

run().catch((error) => {
  console.error(`\n❌ Could not reach the API at ${API}. Is the server running?\n`, error.message);
  process.exit(1);
});
