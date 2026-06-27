# Manhattan Housing Explorer

Interactive web map showing Manhattan housing composition by block.

## Updates in this version

- Removed the search bar
- Added a Neighborhood dropdown using `ntaname`
- Community District and Neighborhood filters both update the dashboard pie chart
- If both filters are selected, the map displays the intersection; the dashboard prioritizes the Neighborhood summary
- Zero-unit blocks are hidden

## Updating data

Replace `data/manhattan_blocks.geojson` with a new file using the same field names. If field names change, update `js/config.js`.
