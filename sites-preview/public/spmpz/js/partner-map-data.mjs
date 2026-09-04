export const partnerCities = [
  {
    id: "zamosc",
    name: "Zamość",
    code: "PL",
    country: { pl: "Polska", en: "Poland" },
    coordinates: { lat: 50.7231, lng: 23.2519 },
    relationship: "host",
    url: "",
  },
  {
    id: "bagnols-sur-ceze",
    name: "Bagnols-sur-Cèze",
    code: "FR",
    country: { pl: "Francja", en: "France" },
    coordinates: { lat: 44.1625, lng: 4.6202 },
    relationship: "seven-cities",
    url: "https://www.jumelages-bagnols.fr/",
  },
  {
    id: "braunfels",
    name: "Braunfels",
    code: "DE",
    country: { pl: "Niemcy", en: "Germany" },
    coordinates: { lat: 50.5155, lng: 8.3896 },
    relationship: "seven-cities",
    url: "https://www.partnerschaftsring-braunfels.de/",
  },
  {
    id: "carcaixent",
    name: "Carcaixent",
    code: "ES",
    country: { pl: "Hiszpania", en: "Spain" },
    coordinates: { lat: 39.1218, lng: -0.4481 },
    relationship: "seven-cities",
    url: "https://www.facebook.com/Associaci%C3%B3-Municipal-dAgermanament-de-Carcaixent-115559442115602",
  },
  {
    id: "eeklo",
    name: "Eeklo",
    code: "BE",
    country: { pl: "Belgia", en: "Belgium" },
    coordinates: { lat: 51.1845, lng: 3.5667 },
    relationship: "seven-cities",
    url: "https://www.facebook.com/CISEeklo/",
  },
  {
    id: "feltre",
    name: "Feltre",
    code: "IT",
    country: { pl: "Włochy", en: "Italy" },
    coordinates: { lat: 46.0184, lng: 11.9062 },
    relationship: "seven-cities",
    url: "",
  },
  {
    id: "kiskunfelegyhaza",
    name: "Kiskunfélegyháza",
    code: "HU",
    country: { pl: "Węgry", en: "Hungary" },
    coordinates: { lat: 46.7121, lng: 19.8446 },
    relationship: "seven-cities",
    url: "https://www.facebook.com/tekiskunfelegyhaza/",
  },
  {
    id: "newbury",
    name: "Newbury",
    code: "GB",
    country: { pl: "Wielka Brytania", en: "United Kingdom" },
    coordinates: { lat: 51.4014, lng: -1.3231 },
    relationship: "seven-cities",
    url: "https://www.newburytwintown.co.uk/",
  },
  {
    id: "loughborough",
    name: "Loughborough",
    code: "GB",
    country: { pl: "Wielka Brytania", en: "United Kingdom" },
    coordinates: { lat: 52.7721, lng: -1.2062 },
    relationship: "bilateral",
    url: "",
  },
];

const relationshipLabels = {
  pl: {
    host: "Siedziba SPMPZ i miasto-gospodarz",
    "seven-cities": "Europejska sieć 7 Cities",
    bilateral: "Wieloletnia wymiana mieszkańców",
    website: "Odwiedź stronę",
  },
  en: {
    host: "Home of SPMPZ and host town",
    "seven-cities": "European 7 Cities network",
    bilateral: "Long-standing resident exchange",
    website: "Visit website",
  },
};

export function getPartnerMarkerLabel(city) {
  return city.name;
}

export function getPartnerRoute(city) {
  const host = partnerCities.find(({ relationship }) => relationship === "host");
  if (!host || !city || city.id === host.id) return [];

  return [
    [host.coordinates.lat, host.coordinates.lng],
    [city.coordinates.lat, city.coordinates.lng],
  ];
}

export function renderPartnerPopup(city, lang = "pl") {
  const locale = lang === "en" ? "en" : "pl";
  const labels = relationshipLabels[locale];
  const website = city.url
    ? `<a href="${city.url}" target="_blank" rel="noopener noreferrer">${labels.website} <span aria-hidden="true">↗</span></a>`
    : "";

  return `<div class="partner-popup"><span class="country-code">${city.code}</span><h3>${city.name}</h3><p>${city.country[locale]}</p><small>${labels[city.relationship]}</small>${website}</div>`;
}
