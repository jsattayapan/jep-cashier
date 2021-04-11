export const getTablesBySection = (tables, section) => {
  return tables.filter(sec => sec.section === section)[0].tables;
};

export const getFoodItemsByCategory = (foodItems, category) => {
  const result = foodItems.filter(cat => (cat.category === category));
  return result[0];
}
