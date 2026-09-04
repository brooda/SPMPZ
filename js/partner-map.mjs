import {
  getPartnerMarkerLabel,
  getPartnerRoute,
  partnerCities,
  renderPartnerPopup,
} from "./partner-map-data.mjs";

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
    const cities = new Map();
    for (const city of partnerCities) {
      const markerLabel = getPartnerMarkerLabel(city);
      const icon = leaflet.divIcon({
        className: `partner-marker partner-marker--${city.relationship}`,
        html: `<span aria-hidden="true">${markerLabel}</span>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -24],
      });
      const marker = leaflet.marker([city.coordinates.lat, city.coordinates.lng], {
        alt: `${city.name}, ${city.country[lang]}`,
        title: `${city.name}, ${city.country[lang]}`,
        icon,
        keyboard: true,
      }).addTo(map).bindPopup(renderPartnerPopup(city, lang), { maxWidth: 280 });
      markers.set(city.id, marker);
      cities.set(city.id, city);
    }

    map.fitBounds(partnerCities.map((city) => [city.coordinates.lat, city.coordinates.lng]), {
      padding: [38, 38],
    });

    let selectedCity = null;
    let routeLayer = null;

    const drawSelectedRoute = () => {
      if (routeLayer) {
        map.removeLayer(routeLayer);
        routeLayer = null;
      }

      if (document.documentElement.dataset.variant !== "d" || !selectedCity) return;

      const route = getPartnerRoute(selectedCity);
      if (route.length < 2) return;

      routeLayer = leaflet.polyline(route, {
        className: "partner-route",
        color: "#d7a23a",
        dashArray: "2 12",
        interactive: false,
        lineCap: "round",
        opacity: 0.94,
        weight: 4,
      }).addTo(map);
      routeLayer.bringToBack();
    };

    const region = element.closest("[data-partner-map-region]");
    for (const button of region?.querySelectorAll("[data-map-city]") ?? []) {
      button.addEventListener("click", () => {
        const marker = markers.get(button.dataset.mapCity);
        if (!marker) return;
        selectedCity = cities.get(button.dataset.mapCity);
        drawSelectedRoute();
        map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 6), { duration: 0.7 });
        marker.openPopup();
      });
    }

    new MutationObserver(() => {
      map.invalidateSize();
      drawSelectedRoute();
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-variant"],
    });
  }
}
