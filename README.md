# Manhattan Housing Explorer

An interactive web map showing Manhattan housing composition by block.

The map uses Leaflet, D3, and a CARTO Dark Matter basemap. It is designed as a lightweight static web application that can be hosted for free on GitHub Pages.

## Features

- One marker per residential Manhattan block
- Zero-unit blocks are hidden
- Marker size scales by total mapped units and zoom level
- Low zoom levels show proportional circles; closer zoom levels show pie markers
- Community District filter
- Districtwide unit breakdown chart and percentages
- Search by block, OBJECTID, or Community District
- Downloadable GeoJSON data file
- Updatable data architecture

## Housing categories

The application expects these fields in `data/manhattan_blocks.geojson`:

| Field | Display label |
|---|---|
| `IncomeRestrictedUnits` | Income restricted, not NYCHA |
| `NotIncomeRestrictedUnits` | Rent stabilized, not income restricted |
| `NYCHA_25` | Income restricted, NYCHA |
| `OtherUnits` | Other units, mostly market rate |

## Updating the data

Replace:

```text
data/manhattan_blocks.geojson
```

with a new GeoJSON file that uses the same field names.

If your field names change, edit:

```text
js/config.js
```

and update the `fields` section.

## Running locally

Because the app loads the GeoJSON file separately, run a simple local server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Once published through GitHub Pages, no local server is needed.

## GitHub Pages

1. Upload this repository to GitHub.
2. Go to **Settings → Pages**.
3. Select **Deploy from a branch**.
4. Select the `main` branch and `/root`.
5. Open the published URL.

## Suggested license

MIT License for the code, with a data-source note in the README.

Housing data should be attributed to its underlying public data sources, such as NYC Open Data, HPD, DHCR/property tax bill data, NYCHA, and MapPLUTO, as applicable.
