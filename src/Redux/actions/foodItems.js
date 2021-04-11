
export const setSelectedFoodItems = (foodItems) => ({
  type: 'SET_SELECTED_FOOD_ITEMS',
  foodItems
});

export const loadAllFoodItems = (foodItems) => ({
  type: 'LOAD_ALL_FOOD_ITEMS',
  foodItems
});

export const loadCookingFoodItems = (foodItems) => ({
  type: 'LOAD_COOKING_FOOD_ITEMS',
  foodItems
});

export const loadCompleteFoodItems = (foodItems) => ({
  type: 'LOAD_COMPLETE_FOOD_ITEMS',
  foodItems
});
