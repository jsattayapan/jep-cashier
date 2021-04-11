const userReducerDefaultState = {
  id: '',
  name: '',
  shortName: '',
  position: '',
  number: ''
};

export default (state = userReducerDefaultState, action) => {
  switch (action.type){
    case 'SET_USER':
      return {
        ...state,
        id: action.id,
        name: action.name,
        shortName: action.shortName,
        position: action.position,
        number: action.number,
        token: action.token
      };
    case 'UPDATE_USER':
      return {
        ...state,
        name: action.name
      };
    case 'CLEAR_USER':
      return {
        ...state,
        id: '',
        name: '',
        shortName: '',
        position: '',
        number: ''
      };
    default:
      return state;
  }
};
