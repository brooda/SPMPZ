import { partnerCities, renderPartnerPopup } from "./partner-map-data.mjs";

const leaflet = globalThis.L;

if (leaflet) {
  for (const element of document.querySelectorAll("[data-partner-map]")) {
    const lang = element.dataset.language === "en" ? "en" : "pl";
    const map = leaflet.map(element, {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    });

    leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const markers = new Map();
    for (const [index, city] of partnerCities.entries()) {
      const markerLabel = city.relationship === "host" ? "Z" : String(index).padStart(2, "0");
      const icon = leaflet.divIcon({
        className: `partner-marker partner-marker--${city.relationship}`,
        html: `<span aria-hidden="true">${markerLabel}</span>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -22],
      });
      const marker = leaflet.marker([city.coordinates.lat, city.coordinates.lng], {
        alt: `${city.name}, ${city.country[lang]}`,
        title: `${city.name}, ${city.country[lang]}`,
        icon,
        keyboard: true,
      }).addTo(map).bindPopup(renderPartnerPopup(city, lang), { maxWidth: 280 });
      markers.set(city.id, marker);
    }

    map.fitBounds(partnerCities.map((city) => [city.coordinates.lat, city.coordinates.lng]), {
      padding: [38, 38],
    });

    const region = element.closest("[data-partner-map-region]");
    for (const button of region?.querySelectorAll("[data-map-city]") ?? []) {
      button.addEventListener("click", () => {
        const marker = markers.get(button.dataset.mapCity);
        if (!marker) return;
        map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 6), { duration: 0.7 });
        marker.openPopup();
      });
    }

    new MutationObserver(() => map.invalidateSize()).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-variant"],
    });
  }
}
