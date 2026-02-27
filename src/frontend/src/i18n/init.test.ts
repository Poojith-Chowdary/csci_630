import i18n from "i18next";
import { describe, expect, it } from "vitest";

import "./init";

describe("i18n html lang sync", () => {
  it("updates document.documentElement.lang when language changes", async () => {
    await i18n.changeLanguage("en-us");
    expect(document.documentElement.lang).toBe("en-us");

    await i18n.changeLanguage("fr-fr");
    expect(document.documentElement.lang).toBe("fr-fr");
  });
});