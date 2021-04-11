const foodItemsDefaultState = {
  allFoodItems: [],
  selectedFoodItems: [],
  cookingFoodItems:[],
  completeFoodItems:[]
};

export default (state = foodItemsDefaultState, action) => {
  switch (action.type){
    case 'SET_SELECTED_FOOD_ITEMS':
      return {
        ...state,
        selectedFoodItems: action.foodItems
      };
    case 'LOAD_ALL_FOOD_ITEMS':
      return {
        ...state,
        allFoodItems: action.foodItems
      };
    case 'LOAD_COOKING_FOOD_ITEMS':
      return {
        ...state,
        cookingFoodItems: action.foodItems
      };
    case 'LOAD_COMPLETE_FOOD_ITEMS':
      return {
        ...state,
        completeFoodItems: action.foodItems
      };
    default:
      return state;
  }
};
