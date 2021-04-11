import { createStore, combineReducers } from 'redux';
import expenseReducer from '../reducers/expenses';
import filterReducer from '../reducers/filters';
import userReducer from '../reducers/user';
import tablesReducer from '../reducers/tables';
import customerTableReducer from '../reducers/customerTable';
import foodItemsReducer from '../reducers/foodItems';

export default () => {
  const store = createStore(
    combineReducers({
      expense: expenseReducer,
      filter: filterReducer,
      user: userReducer,
      tables: tablesReducer,
      customerTable: customerTableReducer,
      foodItems: foodItemsReducer
    })
  );

  return store;
}

//Store creation
