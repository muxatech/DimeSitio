import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('*/functions/v1/events', () => {
    return HttpResponse.json({ success: true })
  }),

  http.post('*/rest/auth/v1/*', () => {
    return HttpResponse.json({})
  }),

  http.get('*/rest/v1/categories', () => {
    return HttpResponse.json([
      { id: 'cat-1', name: 'Italiana' },
      { id: 'cat-2', name: 'Japonesa' },
      { id: 'cat-3', name: 'Mexicana' },
    ])
  }),

  http.get('*/rest/v1/restaurants', () => {
    return HttpResponse.json([
      { id: 'r-1', name: 'Test 1', zone: 'centro', price_level: 2, image_url: null, active: true, restaurant_categories: [{ category_id: 'cat-1' }] },
      { id: 'r-2', name: 'Test 2', zone: 'extensión', price_level: 1, image_url: null, active: true, restaurant_categories: [{ category_id: 'cat-2' }] },
    ])
  }),
]
