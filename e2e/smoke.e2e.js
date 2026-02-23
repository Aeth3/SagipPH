describe("SagipPH smoke", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it("shows root app accessibility label", async () => {
    await expect(element(by.label("SagipPH application"))).toBeVisible();
  });
});
