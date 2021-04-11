export const getTablesBySection = (tables, section) => {
  const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
  var selectedTables = tables.filter(sec => sec.section === section)[0].tables;
  selectedTables = selectedTables.sort((a, b) => collator.compare(a.number, b.number));
  return selectedTables;
};
