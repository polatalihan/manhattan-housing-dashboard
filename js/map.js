/* global L, d3, APP_CONFIG */

const state = {
  allFeatures: [],
  residentialFeatures: [],
  p95Total: 1,
  baseBounds: null
};

const map = L.map("map", {
  center: [40.7831, -73.9712],
  zoom: 12,
  preferCanvas: false,
  zoomControl: true
});

L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  subdomains: "abcd",
  maxZoom: 20,
  crossOrigin: true
}).addTo(map);

const polygonLayer = L.geoJSON(null, {
  style: {
    color: "rgba(255, 250, 240, 0.45)",
    weight: 0.65,
    opacity: 0.85,
    fillColor: "rgba(255,255,255,0.015)",
    fillOpacity: 0.015
  }
}).addTo(map);

const markerLayer = L.layerGroup().addTo(map);

const tooltip = L.tooltip({
  permanent: false,
  direction: "top",
  offset: [0, -8],
  className: "tooltip-card",
  opacity: 1
});

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function fmt(value) {
  return Math.round(num(value)).toLocaleString();
}

function pct(value, total) {
  if (!total) return "0.0%";
  return `${(value / total * 100).toFixed(1)}%`;
}

function getValues(properties = {}) {
  const f = APP_CONFIG.fields;

  const incomeRestricted = num(properties[f.incomeRestricted]);
  const nycha = num(properties[f.nycha]);
  const rentStabilized = num(properties[f.rentStabilized]);
  const other = num(properties[f.other]);

  const total = incomeRestricted + nycha + rentStabilized + other;

  return {
    incomeRestricted,
    nycha,
    rentStabilized,
    other,
    total
  };
}

function getBlockLabel(properties = {}) {
  const f = APP_CONFIG.fields;
  return properties[f.block] ?? properties[f.objectId] ?? "Unknown";
}

function getCd(properties = {}) {
  const cd = properties[APP_CONFIG.fields.communityDistrict];
  return cd === null || cd === undefined || String(cd).trim() === "" ? null : String(cd);
}

function zoomScale() {
  const z = map.getZoom();

  if (z <= 10) return 0.16;
  if (z === 11) return 0.23;
  if (z === 12) return 0.33;
  if (z === 13) return 0.48;
  if (z === 14) return 0.68;
  if (z === 15) return 0.92;
  if (z === 16) return 1.15;

  return 1.38;
}

function markerRadius(total) {
  const minR = 2.5;
  const maxR = 22;
  const base =
    minR +
    Math.sqrt(Math.min(total, state.p95Total) / state.p95Total) *
      (maxR - minR);

  return Math.max(2, base * zoomScale());
}

function showPieSlices() {
  return document.getElementById("togglePie").checked && map.getZoom() >= 12;
}

function centroidLatLng(feature) {
  const layer = L.geoJSON(feature);
  const bounds = layer.getBounds();

  if (bounds.isValid()) return bounds.getCenter();

  const coords = feature.geometry && feature.geometry.coordinates;

  if (feature.geometry && feature.geometry.type === "Point") {
    return L.latLng(coords[1], coords[0]);
  }

  return null;
}

function makeMarkerIcon(values) {
  const r = markerRadius(values.total);
  const size = Math.ceil(r * 2 + 5);
  const center = size / 2;

  const data = [
    {
      key: "incomeRestricted",
      value: values.incomeRestricted,
      color: APP_CONFIG.colors.incomeRestricted
    },
    {
      key: "rentStabilized",
      value: values.rentStabilized,
      color: APP_CONFIG.colors.rentStabilized
    },
    {
      key: "nycha",
      value: values.nycha,
      color: APP_CONFIG.colors.nycha
    },
    {
      key: "other",
      value: values.other,
      color: APP_CONFIG.colors.other
    }
  ].filter(d => d.value > 0);

  let svg;

  if (!showPieSlices() || data.length === 0) {
    svg = `
      <svg class="pie-marker" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${center}" cy="${center}" r="${r}" fill="${APP_CONFIG.colors.neutralCircle}" stroke="${APP_CONFIG.colors.outline}" stroke-width="0.8"/>
      </svg>`;
  } else {
    const pie = d3.pie().value(d => d.value).sort(null)(data);
    const arc = d3.arc().innerRadius(0).outerRadius(r);

    const paths = pie
      .map(slice => `<path d="${arc(slice)}" fill="${slice.data.color}"></path>`)
      .join("");

    svg = `
      <svg class="pie-marker" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(${center},${center})">
          ${paths}
          <circle cx="0" cy="0" r="${r}" fill="none" stroke="${APP_CONFIG.colors.outline}" stroke-width="0.9"/>
        </g>
      </svg>`;
  }

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [center, center],
    popupAnchor: [0, -r]
  });
}

function popupHtml(properties, values) {
  const block = getBlockLabel(properties);
  const cd = getCd(properties) ?? "—";
  const labels = APP_CONFIG.labels;

  return `
    <div class="popup-title">Block ${block}</div>
    <div class="popup-subtitle">Community District: ${cd}</div>
    <table class="popup-table">
      <tr><td>Total mapped units</td><td>${fmt(values.total)}</td></tr>
      <tr><td>${labels.incomeRestricted}</td><td>${fmt(values.incomeRestricted)} (${pct(values.incomeRestricted, values.total)})</td></tr>
      <tr><td>${labels.rentStabilized}</td><td>${fmt(values.rentStabilized)} (${pct(values.rentStabilized, values.total)})</td></tr>
      <tr><td>${labels.nycha}</td><td>${fmt(values.nycha)} (${pct(values.nycha, values.total)})</td></tr>
      <tr><td>${labels.other}</td><td>${fmt(values.other)} (${pct(values.other, values.total)})</td></tr>
    </table>
  `;
}

function tooltipHtml(properties, values) {
  return `<strong>Block ${getBlockLabel(properties)}</strong>${fmt(values.total)} total mapped units`;
}

function passesFilters(feature) {
  const properties = feature.properties || {};
  const values = getValues(properties);

  if (values.total <= 0) return false;

  const selectedCd = document.getElementById("cdFilter").value;
  const cd = getCd(properties);

  if (selectedCd !== "all" && cd !== selectedCd) return false;

  const q = document.getElementById("searchBox").value.trim().toLowerCase();

  if (q) {
    const f = APP_CONFIG.fields;
    const haystack = [
      properties[f.block],
      properties[f.objectId],
      properties[f.communityDistrict],
      `cd ${properties[f.communityDistrict]}`
    ]
      .map(v => (v === null || v === undefined ? "" : String(v).toLowerCase()))
      .join(" ");

    if (!haystack.includes(q)) return false;
  }

  return true;
}

function selectedCdTotals() {
  const selectedCd = document.getElementById("cdFilter").value;

  if (selectedCd === "all") return null;

  const totals = {
    incomeRestricted: 0,
    rentStabilized: 0,
    nycha: 0,
    other: 0,
    total: 0,
    residentialBlocks: 0
  };

  state.residentialFeatures.forEach(feature => {
    const properties = feature.properties || {};

    if (getCd(properties) !== selectedCd) return;

    const values = getValues(properties);

    totals.incomeRestricted += values.incomeRestricted;
    totals.rentStabilized += values.rentStabilized;
    totals.nycha += values.nycha;
    totals.other += values.other;
    totals.residentialBlocks += 1;
  });

  totals.total =
    totals.incomeRestricted + totals.rentStabilized + totals.nycha + totals.other;

  return { cd: selectedCd, values: totals };
}

function renderDistrictPanel() {
  const result = selectedCdTotals();
  const panel = document.getElementById("cdPanel");
  const chart = document.getElementById("cdPieChart");
  const breakdown = document.getElementById("cdBreakdown");

  chart.innerHTML = "";
  breakdown.innerHTML = "";

  if (!result) {
    panel.classList.add("is-hidden");
    return;
  }

  panel.classList.remove("is-hidden");

  document.getElementById("cdTitle").textContent = `Community District ${result.cd}`;
  document.getElementById("cdSubtitle").textContent = `${fmt(result.values.total)} total mapped units`;
  document.getElementById("cdResidentialBlocks").textContent = fmt(result.values.residentialBlocks);

  const avgUnits =
    result.values.residentialBlocks > 0
      ? result.values.total / result.values.residentialBlocks
      : 0;

  document.getElementById("cdAvgUnits").textContent = fmt(avgUnits);

  const labels = APP_CONFIG.labels;

  const data = [
    {
      key: "incomeRestricted",
      label: labels.incomeRestricted,
      value: result.values.incomeRestricted,
      color: APP_CONFIG.colors.incomeRestricted
    },
    {
      key: "rentStabilized",
      label: labels.rentStabilized,
      value: result.values.rentStabilized,
      color: APP_CONFIG.colors.rentStabilized
    },
    {
      key: "nycha",
      label: labels.nycha,
      value: result.values.nycha,
      color: APP_CONFIG.colors.nycha
    },
    {
      key: "other",
      label: labels.other,
      value: result.values.other,
      color: APP_CONFIG.colors.other
    }
  ].filter(d => d.value > 0);

  const width = 124;
  const height = 124;
  const radius = 58;

  const svg = d3.select(chart).append("svg").attr("width", width).attr("height", height);
  const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

  const pie = d3.pie().value(d => d.value).sort(null);
  const arc = d3.arc().innerRadius(24).outerRadius(radius);

  g.selectAll("path")
    .data(pie(data))
    .join("path")
    .attr("d", arc)
    .attr("fill", d => d.data.color)
    .attr("stroke", "#fffdf7")
    .attr("stroke-width", 1.5);

  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "-.1em")
    .attr("fill", "#1e2329")
    .attr("font-size", 14)
    .attr("font-weight", 820)
    .text(fmt(result.values.total));

  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "1.25em")
    .attr("fill", "#66707a")
    .attr("font-size", 10)
    .text("units");

  data.forEach(d => {
    const row = document.createElement("div");
    row.className = "breakdown-row";
    row.innerHTML = `
      <span class="dot" style="background:${d.color}"></span>
      <span>${d.label}</span>
      <strong>${pct(d.value, result.values.total)}</strong>
    `;
    breakdown.appendChild(row);
  });
}

function render() {
  markerLayer.clearLayers();
  polygonLayer.clearLayers();

  const showPolygons = document.getElementById("togglePolygons").checked;

  let visibleUnits = 0;
  const visibleFeatures = [];

  for (const feature of state.residentialFeatures) {
    if (!passesFilters(feature)) continue;

    const properties = feature.properties || {};
    const values = getValues(properties);
    const latlng = centroidLatLng(feature);

    if (!latlng) continue;

    visibleUnits += values.total;
    visibleFeatures.push(feature);

    const marker = L.marker(latlng, {
      icon: makeMarkerIcon(values),
      riseOnHover: true
    });

    marker.bindPopup(popupHtml(properties, values), { maxWidth: 340 });

    marker.on("mouseover", () => {
      tooltip.setContent(tooltipHtml(properties, values));
      tooltip.setLatLng(latlng);
      tooltip.addTo(map);
    });

    marker.on("mouseout", () => map.removeLayer(tooltip));

    markerLayer.addLayer(marker);
  }

  if (showPolygons) {
    polygonLayer.addData({
      type: "FeatureCollection",
      features: visibleFeatures
    });
  }

  document.getElementById("visibleUnits").textContent = fmt(visibleUnits);
  document.getElementById("visibleContext").textContent =
    document.getElementById("cdFilter").value === "all"
      ? "Across visible residential blocks"
      : "Within selected Community District";

  renderDistrictPanel();
}

function populateCdFilter() {
  const cdSet = new Set();

  state.residentialFeatures.forEach(feature => {
    const cd = getCd(feature.properties || {});
    if (cd) cdSet.add(cd);
  });

  const cds = Array.from(cdSet).sort((a, b) => Number(a) - Number(b));
  const select = document.getElementById("cdFilter");

  cds.forEach(cd => {
    const option = document.createElement("option");
    option.value = cd;
    option.textContent = `CD ${cd}`;
    select.appendChild(option);
  });
}

function zoomToSelectedCd() {
  const selectedCd = document.getElementById("cdFilter").value;

  if (selectedCd === "all") return;

  const cdFeatures = state.residentialFeatures.filter(
    feature => getCd(feature.properties || {}) === selectedCd
  );

  const bounds = L.geoJSON({
    type: "FeatureCollection",
    features: cdFeatures
  }).getBounds();

  if (bounds.isValid()) map.fitBounds(bounds.pad(0.12));
}

async function loadData() {
  const loading = document.getElementById("loading");

  try {
    const response = await fetch(APP_CONFIG.dataUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const geojson = await response.json();

    state.allFeatures = geojson.features || [];
    state.residentialFeatures = state.allFeatures.filter(feature => {
      return getValues(feature.properties || {}).total > 0;
    });

    const totals = state.residentialFeatures
      .map(feature => getValues(feature.properties || {}).total)
      .filter(total => total > 0)
      .sort((a, b) => a - b);

    state.p95Total = totals.length ? totals[Math.floor(totals.length * 0.95)] : 1;

    state.baseBounds = L.geoJSON({
      type: "FeatureCollection",
      features: state.residentialFeatures
    }).getBounds();

    if (state.baseBounds.isValid()) {
      map.fitBounds(state.baseBounds.pad(0.08));
    }

    populateCdFilter();
    render();
  } catch (error) {
    console.error(error);
    loading.textContent = "Could not load data/manhattan_blocks.geojson. Use a local server or GitHub Pages.";
  } finally {
    if (loading.textContent === "Loading housing data…") {
      loading.classList.add("is-hidden");
    }
  }
}

document.getElementById("searchBox").addEventListener("input", render);

document.getElementById("cdFilter").addEventListener("change", () => {
  render();
  zoomToSelectedCd();
});

document.getElementById("togglePie").addEventListener("change", render);
document.getElementById("togglePolygons").addEventListener("change", render);

map.on("zoomend", render);

document.getElementById("resetView").addEventListener("click", () => {
  document.getElementById("searchBox").value = "";
  document.getElementById("cdFilter").value = "all";
  document.getElementById("togglePie").checked = true;
  document.getElementById("togglePolygons").checked = true;

  render();

  if (state.baseBounds && state.baseBounds.isValid()) {
    map.fitBounds(state.baseBounds.pad(0.08));
  }
});

loadData();
