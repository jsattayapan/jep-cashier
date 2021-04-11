const tablesReducerDefaultState = {
  allTables: [],
  sectionTables: [],
  currentShift: {status: 'inactive'},
  historyTables: []
};

export default (state = tablesReducerDefaultState, action) => {
  switch (action.type){
    case 'LOAD_TABLES':
      return {
        ...state,
        allTables: action.tables
      }
      case 'SET_CURRENT_SHIFT':
        return {
          ...state,
          currentShift: action.currentShift
        }
    case 'SET_SECTION_TABLES':
      return {
        ...state,
        sectionTables: action.tables
      }
    case 'SET_HISTOTY_TABLES':
      return {
        ...state,
        historyTables: action.tables
      }
    default:
      return state;
  }
};
