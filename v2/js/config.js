const APP_CONFIG = {
  dataUrl: "data/manhattan_blocks.geojson",
  fields: {
    block: "Block",
    objectId: "OBJECTID",
    communityDistrict: "CD",
    neighborhood: "ntaname",
    incomeRestricted: "IncomeRestrictedUnits",
    nycha: "NYCHA_25",
    rentStabilized: "NotIncomeRestrictedUnits",
    other: "OtherUnits"
  },
  colors: {
    incomeRestricted: "#d7191c",
    rentStabilized: "#f28e2b",
    nycha: "#b36b00",
    other: "#f6d76b",
    outline: "#ffffff",
    neutralCircle: "rgba(255, 250, 240, 0.62)"
  },
  labels: {
    incomeRestricted: "Income restricted, not NYCHA",
    rentStabilized: "Rent stabilized, not income restricted",
    nycha: "Income restricted, NYCHA",
    other: "Other units, mostly market rate"
  }
};
