# Manhattan Housing Explorer

An [interactive web map](https://polatalihan.github.io/manhattan-housing-dashboard/v2/) showing Manhattan housing composition by block.

The application is a lightweight static web application built with Leaflet, D3.js, and the CARTO Dark Matter basemap. Housing data is compiled from multiple public datasets, processed using Python and ArcGIS Pro, and exported as a GeoJSON dataset for visualization. The web application was developed using JavaScript with AI-assisted coding workflows.

## Features

- Interactive map of residential Manhattan blocks
- One marker per residential block
- Blocks with zero residential units are automatically hidden
- Marker size scales by total residential units and map zoom level
- Proportional circles at small scales that transition to pie charts as users zoom in
- Community District / Neighborhood Tabulation Area filtering
- District-wide housing composition charts and percentages
- Downloadable GeoJSON dataset
- Easily updateable data architecture

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

## Data Sources

The housing dataset integrates information from multiple New York City open data sources, including:

- [MapPLUTO](https://www.nyc.gov/content/planning/pages/resources/datasets/mappluto-pluto-change)
- [Affordable Housing Production by Building](https://data.cityofnewyork.us/Housing-Development/Affordable-Housing-Production-by-Building/hg8x-zxpr/about_data), NYC Department of Housing Preservation & Development (HPD)
- [Advertised Lotteries on Housing Connect By Building](https://data.cityofnewyork.us/Housing-Development/Advertised-Lotteries-on-Housing-Connect-By-Buildin/nibs-na6y/about_data), NYC Department of Housing Preservation & Development (HPD)
- [NYC Property Tax Bills](https://github.com/polatalihan/Rent-Stabilized-Data-NYC)

These datasets are processed and combined into a block-level GeoJSON for visualization.

## Further Reading
## Additional Reading

A detailed discussion of the methodology, housing categories, and data sources is available in:
[Understanding New York City's Housing Data Landscape: A Block-by-Block View]

