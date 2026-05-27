import { expect, test } from "@playwright/test";

test("browser explorer supports filesystem operations", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Rootbase" })).toBeVisible();

  await page.getByTestId("reset-button").click();
  await page.getByTestId("reset-confirm-button").click();
  await expect(page.getByText("This directory is empty.")).toBeVisible();

  await page.getByTestId("create-directory-input").fill("project");
  await page.getByTestId("create-directory-button").click();
  await expect(page.getByTestId("directory-entry-/project")).toBeVisible();

  await page.getByTestId("directory-entry-/project").click();
  await expect(page.getByText("/project").first()).toBeVisible();

  await page.getByTestId("create-directory-input").fill("interior");
  await page.getByTestId("create-directory-button").click();
  await expect(page.getByTestId("directory-entry-/project/interior")).toBeVisible();

  await page.getByTestId("create-file-input").fill("test.csv");
  await page.getByTestId("create-file-button").click();
  await expect(page.getByTestId("directory-entry-/project/test.csv")).toBeVisible();

  await page.getByTestId("directory-entry-/project/test.csv").click();
  await expect(page.getByTestId("file-editor")).toBeEnabled();
  await page.getByTestId("file-editor").fill("hello from the browser");
  await page.getByTestId("write-file-button").click();

  await page.getByTestId("directory-entry-/project/test.csv").click();
  await expect(page.getByTestId("file-editor")).toHaveValue("hello from the browser");

  await page.getByTestId("rename-name-input").fill("report.csv");
  await page.getByTestId("rename-button").click();
  await expect(page.getByTestId("directory-entry-/project/report.csv")).toBeVisible();
  await expect(page.getByTestId("directory-entry-/project/test.csv")).toHaveCount(0);

  await page.getByTestId("directory-entry-/project/report.csv").click();
  await page.getByTestId("move-destination-input").fill("interior");
  await page.getByTestId("move-button").click();
  await expect(page.getByTestId("directory-entry-/project/report.csv")).toHaveCount(0);

  await page.getByTestId("directory-entry-/project/interior").click();
  await expect(page.getByTestId("directory-entry-/project/interior/report.csv")).toBeVisible();

  await page.getByTestId("find-name-input").fill("report.csv");
  await page.getByTestId("find-button").click();
  await expect(page.getByTestId("find-result-/project/interior/report.csv")).toBeVisible();

  await page.getByTestId("directory-entry-/project/interior/report.csv").click();
  await page.getByTestId("remove-file-button").click();
  await expect(page.getByTestId("directory-entry-/project/interior/report.csv")).toHaveCount(0);

  await page.getByRole("button", { name: "Parent" }).click();
  await expect(page.getByTestId("directory-entry-/project/interior")).toBeVisible();
  await page.getByTestId("remove-directory-input").fill("interior");
  await page.getByTestId("remove-directory-button").click();
  await expect(page.getByTestId("directory-entry-/project/interior")).toHaveCount(0);

  await page.getByTestId("sample-button").click();
  await page.getByTestId("sample-confirm-button").click();
  await expect(page.getByTestId("directory-entry-/school")).toBeVisible();
  await expect(page.getByTestId("directory-entry-/notes")).toBeVisible();
});
