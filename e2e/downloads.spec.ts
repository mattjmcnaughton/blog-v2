import { test, expect } from "@playwright/test";

test.describe("Downloadable files (/dl/)", () => {
  test("serves GPG public key", async ({ request }) => {
    const response = await request.get("/dl/gpg/mattjmcnaughton.pub.asc");

    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("BEGIN PGP PUBLIC KEY BLOCK");
  });

  test("serves bootstrap scripts", async ({ request }) => {
    const response = await request.get(
      "/dl/scripts/bootstrap/install-tailscale-ubuntu-2404.sh"
    );

    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("#!/");
  });
});
