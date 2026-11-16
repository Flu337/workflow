import { test, expect } from '@playwright/test'

// полный e2e сценарий пользователя: login -> create request -> assign -> change status -> comment -> logout
test.describe('WorkFlow E2E: полный пользовательский сценарий и регрессии', () => {
  test('проходит цепочку login -> create request -> assign -> change status -> comment -> logout', async ({
    page
  }) => {
    // 1. Вход в систему под ролью Оператор
    await page.goto('/login')
    await expect(page.getByText('С возвращением')).toBeVisible()

    const emailInput = page.locator('input[type="text"], input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    await emailInput.fill('0000@mail.demo')
    await passwordInput.fill('demo1234')
    await page.getByRole('button', { name: 'Войти' }).click()

    await expect(page).toHaveURL(/\/dashboard|\/requests/)

    // 2. Переход к списку заявок и создание новой заявки
    await page.goto('/requests')
    await page.getByRole('button', { name: 'Создать заявку' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Новая заявка')).toBeVisible()

    await dialog.getByRole('button', { name: /Создать заявку|Повторить/ }).click()
    await expect(dialog).toBeHidden()

    // 3. Открытие карточки заявки #1042 и назначение активного исполнителя
    await page.goto('/requests/1042')
    await expect(page.getByText('Не работает доступ к CRM')).toBeVisible()

    const assignButton = page.getByRole('button', { name: 'Назначить исполнителя' }).first()
    if (await assignButton.isVisible()) {
      await assignButton.click()
      const assignDialog = page.getByRole('dialog')
      await expect(assignDialog.getByText('Назначить исполнителя')).toBeVisible()
      await assignDialog.getByRole('button', { name: 'Назначить' }).click()
      await expect(assignDialog).toBeHidden()
    }

    // 4. Изменение статуса заявки с указанием обязательной причины ожидания
    const statusButton = page.getByRole('button', { name: 'Изменить статус' }).first()
    if (await statusButton.isVisible()) {
      await statusButton.click()
      const statusDialog = page.getByRole('dialog')
      await expect(statusDialog.getByText('Изменить статус')).toBeVisible()
      await statusDialog.locator('textarea').fill('Ожидаем подтверждения от отдела продаж')
      await statusDialog.getByRole('button', { name: 'Сохранить статус' }).click()
      await expect(statusDialog).toBeHidden()
    }

    // 5. Отправка комментария с проверкой отсутствия дублирования при отправке
    const commentBox = page.locator('textarea').first()
    await commentBox.fill('Права группы проверены, доступ открыт.')
    await page.getByRole('button', { name: 'Отправить комментарий' }).click()
    await expect(page.getByText('Права группы проверены, доступ открыт.')).toHaveCount(1)

    // 6. Выход из аккаунта и проверка редиректа при попытке открыть приватный маршрут
    await page.goto('/profile')
    await page.getByRole('button', { name: 'Выйти из аккаунта' }).click()
    await expect(page).toHaveURL(/\/login/)

    await page.goto('/requests')
    await expect(page).toHaveURL(/\/login/)
  })
})
