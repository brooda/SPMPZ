import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const modulePath = resolve(root, "js/partner-map-data.mjs");

test("partner map data describes the host, all partner towns and the 7 Cities network", async () => {
  assert.ok(existsSync(modulePath), "Missing partner map data module");
  const { partnerCities } = await import(pathToFileURL(modulePath));

  assert.equal(partnerCities.length, 9);
  assert.equal(partnerCities.filter((city) => city.relationship === "seven-cities").length, 7);
  assert.equal(partnerCities.filter((city) => city.relationship === "bilateral").length, 1);
  assert.equal(partnerCities.filter((city) => city.relationship === "host").length, 1);

  for (const city of partnerCities) {
    assert.ok(city.coordinates.lat >= 35 && city.coordinates.lat <= 60, `${city.name} latitude is outside Europe`);
    assert.ok(city.coordinates.lng >= -12 && city.coordinates.lng <= 30, `${city.name} longitude is outside Europe`);
    assert.ok(city.country.pl);
    assert.ok(city.country.en);
  }
});

test("partner popup exposes localized relationship information and available websites", async () => {
  assert.ok(existsSync(modulePath), "Missing partner map data module");
  const { partnerCities, renderPartnerPopup } = await import(pathToFileURL(modulePath));
  const bagnols = partnerCities.find((city) => city.name === "Bagnols-sur-Cèze");
  const loughborough = partnerCities.find((city) => city.name === "Loughborough");

  assert.match(renderPartnerPopup(bagnols, "pl"), /Francja/);
  assert.match(renderPartnerPopup(bagnols, "pl"), /7 Cities/);
  assert.match(renderPartnerPopup(bagnols, "pl"), /https:\/\/www\.jumelages-bagnols\.fr\//);
  assert.match(renderPartnerPopup(bagnols, "en"), /France/);
  assert.match(renderPartnerPopup(loughborough, "pl"), /wymiana mieszkańców/i);
  assert.match(renderPartnerPopup(loughborough, "en"), /resident exchange/i);
});
