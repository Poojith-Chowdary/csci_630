import { test, expect } from "@playwright/test"

test("switching language updates <html lang>", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" })
  await page.waitForSelector("#root")

  // Default language should be en
  await expect(page.locator("html")).toHaveAttribute("lang", /en/)

  // Open settings panel
  await page.getByRole("button", { name: "Settings" }).click()
  await page.waitForTimeout(500)

  // Click the language select button (shows "English")
  await page.getByRole("button", { name: /English/i }).click()

  // Pick French from the listbox
  await page.getByRole("option", { name: /Français/i }).click()
  await expect(page.locator("html")).toHaveAttribute("lang", /fr/)

  // Open language select again
  await page.getByRole("button", { name: /Français/i }).click()

  // Pick Dutch
  await page.getByRole("option", { name: /Nederlands/i }).click()
  await expect(page.locator("html")).toHaveAttribute("lang", /nl/)
})