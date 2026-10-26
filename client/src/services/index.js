// All API calls in one place. Components call these functions instead of using axios directly.
import { api, cleanParams } from '@/lib/api';

export const authService = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data.user),
  updateMe: (data) => api.patch('/auth/me', data).then((r) => r.data.user),
  becomeHost: () => api.post('/auth/become-host').then((r) => r.data.user),
};

export const listingService = {
  search: (params) => api.get('/listings', { params: cleanParams(params) }).then((r) => r.data),
  meta: () => api.get('/listings/meta').then((r) => r.data),
  get: (id) => api.get(`/listings/${id}`).then((r) => r.data.listing),
  availability: (id) => api.get(`/listings/${id}/availability`).then((r) => r.data.bookedDates),
  create: (data) => api.post('/listings', data).then((r) => r.data.listing),
  update: (id, data) => api.patch(`/listings/${id}`, data).then((r) => r.data.listing),
  remove: (id) => api.delete(`/listings/${id}`).then((r) => r.data),
};

export const bookingService = {
  create: (data) => api.post('/bookings', data).then((r) => r.data.booking),
  mine: () => api.get('/bookings/me').then((r) => r.data.bookings),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`).then((r) => r.data.booking),
};

export const reviewService = {
  list: (listingId) => api.get(`/listings/${listingId}/reviews`).then((r) => r.data.reviews),
  eligibility: (listingId) => api.get(`/listings/${listingId}/reviews/eligibility`).then((r) => r.data),
  create: (listingId, data) => api.post(`/listings/${listingId}/reviews`, data).then((r) => r.data.review),
  remove: (id) => api.delete(`/reviews/${id}`).then((r) => r.data),
};

export const hostService = {
  listings: () => api.get('/host/listings').then((r) => r.data.listings),
  listing: (id) => api.get(`/host/listings/${id}`).then((r) => r.data.listing),
  bookings: () => api.get('/host/bookings').then((r) => r.data.bookings),
  stats: () => api.get('/host/stats').then((r) => r.data.stats),
};
