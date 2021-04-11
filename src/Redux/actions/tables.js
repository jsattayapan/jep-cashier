export const loadTables = (tables) => ({
  type: 'LOAD_TABLES',
  tables: tables
});

export const setSectionTables = (tables) => {
  console.log('Action Table: ', tables);
  return {
    type: 'SET_SECTION_TABLES',
    tables: tables
  }
};

export const setCurrentShift = (shift) => {
  return {
    type: 'SET_CURRENT_SHIFT',
    currentShift: shift
  }
};

export const setHistoryTables = (tables) => {
  return {
    type: 'SET_HISTOTY_TABLES',
    tables: tables
  }
};
