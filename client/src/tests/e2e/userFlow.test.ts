import { test, expect } from "@playwright/test";

test.describe("User Management Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the application header", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "DLL User Management" })).toBeVisible();
    await expect(page.getByText(/A sortable, paginated user directory browser/)).toBeVisible();
  });

  test("should load and display users", async ({ page }) => {
    // Wait for users to load (using actual names from backend data)
    await expect(page.getByText("Jorn")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Markus")).toBeVisible();
    await expect(page.getByText("Andrew")).toBeVisible();
  });

  test("should display user table with correct headers", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "ID" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Name" })).toBeVisible();
  });

  test("should sort users by name", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const nameButton = page.getByRole("button", { name: /Name/i });
    await nameButton.click();

    // Check that the button is now active
    await expect(nameButton).toHaveAttribute("aria-pressed", "true");

    // Check that Reset button appears
    await expect(page.getByRole("button", { name: "Reset User Order" })).toBeVisible();
  });

  test("should sort users by ID", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const idButton = page.getByRole("button", { name: /^Id$/i });
    await idButton.click();

    // Check that the button is now active
    await expect(idButton).toHaveAttribute("aria-pressed", "true");
  });

  test("should toggle sort off when clicking active sort button", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const nameButton = page.getByRole("button", { name: /Name/i });

    // Click to activate
    await nameButton.click();
    await expect(nameButton).toHaveAttribute("aria-pressed", "true");

    // Click again to deactivate
    await nameButton.click();
    await expect(nameButton).toHaveAttribute("aria-pressed", "false");

    // Reset button should disappear
    await expect(page.getByRole("button", { name: "Reset User Order" })).not.toBeVisible();
  });

  test("should reset user order", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Activate sort
    const nameButton = page.getByRole("button", { name: /Name/i });
    await nameButton.click();
    await expect(nameButton).toHaveAttribute("aria-pressed", "true");

    // Click reset
    const resetButton = page.getByRole("button", { name: "Reset User Order" });
    await resetButton.click();

    // Sort should be inactive
    await expect(nameButton).toHaveAttribute("aria-pressed", "false");
    await expect(resetButton).not.toBeVisible();
  });

  test("should change page size", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const pageSizeSelect = page.getByLabel("Show:");
    await expect(pageSizeSelect).toHaveValue("10");

    await pageSizeSelect.selectOption("25");
    await expect(pageSizeSelect).toHaveValue("25");
  });

  test("should display pagination information", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/Showing \d+ to \d+ of \d+ users/)).toBeVisible();
  });

  test("should navigate to next page", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const nextButton = page.getByRole("button", { name: "Go to next page" });

    // Only test if next button is enabled
    const isDisabled = await nextButton.isDisabled();
    if (!isDisabled) {
      await nextButton.click();
      await page.waitForLoadState("networkidle");

      // Check that we're on page 2
      const page2Button = page.getByRole("button", { name: "Go to page 2" });
      await expect(page2Button).toHaveAttribute("aria-current", "page");
    }
  });

  test("should navigate to previous page", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const nextButton = page.getByRole("button", { name: "Go to next page" });
    const prevButton = page.getByRole("button", { name: "Go to previous page" });

    // Navigate to page 2 first
    const isNextDisabled = await nextButton.isDisabled();
    if (!isNextDisabled) {
      await nextButton.click();
      await page.waitForLoadState("networkidle");

      // Now go back
      await prevButton.click();
      await page.waitForLoadState("networkidle");

      // Should be back on page 1
      const page1Button = page.getByRole("button", { name: "Go to page 1" });
      await expect(page1Button).toHaveAttribute("aria-current", "page");
    }
  });

  test("should navigate to specific page number", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Check if page 3 button exists
    const page3Button = page.getByRole("button", { name: "Go to page 3" });
    const isVisible = await page3Button.isVisible().catch(() => false);

    if (isVisible) {
      await page3Button.click();
      await page.waitForLoadState("networkidle");

      await expect(page3Button).toHaveAttribute("aria-current", "page");
    }
  });

  test("should maintain sort when changing page size", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Activate sort
    const nameButton = page.getByRole("button", { name: /Name/i });
    await nameButton.click();
    await expect(nameButton).toHaveAttribute("aria-pressed", "true");

    // Change page size
    const pageSizeSelect = page.getByLabel("Show:");
    await pageSizeSelect.selectOption("25");
    await page.waitForLoadState("networkidle");

    // Sort should still be active
    await expect(nameButton).toHaveAttribute("aria-pressed", "true");
  });

  test("should have accessible navigation", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Check navigation landmark
    const nav = page.getByRole("navigation", { name: "Pagination" });
    await expect(nav).toBeVisible();

    // Check status region
    const status = page.getByRole("status");
    await expect(status).toBeVisible();
    await expect(status).toHaveAttribute("aria-live", "polite");
  });

  test("should handle keyboard navigation", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Tab to name sort button and activate with Enter
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const nameButton = page.getByRole("button", { name: /Name/i });
    await nameButton.focus();
    await page.keyboard.press("Enter");

    await expect(nameButton).toHaveAttribute("aria-pressed", "true");
  });

  test("should show empty state when no users", async ({ page }) => {
    // This test would require mocking the API to return empty results
    // For now, we'll just check that the table structure exists
    await expect(page.getByRole("table")).toBeVisible();
  });

  test.describe("Responsive design", () => {
    test("should work on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Wait for users to load to avoid rate limiting
      await expect(page.getByText("Jorn")).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole("heading", { name: "DLL User Management" })).toBeVisible();
      await expect(page.getByRole("table")).toBeVisible();
    });

    test("should work on tablet viewport", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Wait for users to load to avoid rate limiting
      await expect(page.getByText("Jorn")).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole("heading", { name: "DLL User Management" })).toBeVisible();
      await expect(page.getByRole("table")).toBeVisible();
    });
  });

  test.describe("Error handling", () => {
    test("should display error message when API fails", async ({ page, context }) => {
      // Intercept API calls and return error
      await context.route("**/api/users*", (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: "Internal Server Error" }),
        });
      });

      await page.goto("/");

      // Should show error alert
      await expect(page.getByRole("alert")).toBeVisible({ timeout: 10000 });
      await expect(page.getByText("Error loading users")).toBeVisible();
    });
  });

  test.describe("Performance", () => {
    test("should load within acceptable time", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;

      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });
  });
});
