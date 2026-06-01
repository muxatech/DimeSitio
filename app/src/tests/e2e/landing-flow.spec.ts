import { test, expect } from '@playwright/test'

test.describe('Landing → Flow', () => {
  test('loads landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('DimeSitio')).toBeVisible()
    await expect(page.getByText('Encuentra dónde')).toBeVisible()
  })

  test('clicking CTA starts the flow', async ({ page }) => {
    await page.goto('/')
    await page.getByText('comer').first().click()
    await expect(page.getByText('¿Qué te apetece?')).toBeVisible()
  })

  test('shows 404 page for unknown routes', async ({ page }) => {
    await page.goto('/ruta-inexistente')
    await expect(page.getByText('Página no encontrada')).toBeVisible()
  })
})
