import React from 'react';

import uuid from 'uuid';
import { createStore, combineReducers } from 'redux';

export class Playground extends React.Component{
  render(){
    const addExpense = (
    {
      description = '',
      note = '',
      amount = 0,
      createAt = 0
    } = {}
  ) => ({
      type: 'ADD_EXPENSE',
      expense: {
        id: uuid(),
        description,
        note,
        amount,
        createAt
      }
    });

    const removeExpense = ({ id }) => ({
      type: 'REMOVE_EXPENSE',
      id
    });

    const editExpense = (id, updates) => ({
      type: 'EDIT_EXPENSE',
      id,
      updates
    });

    const expenseReducerDefaultState = [];

    const expenseReducer = (state = expenseReducerDefaultState, action) => {
      switch (action.type){
        case 'ADD_EXPENSE':
          return [
            ...state,
            action.expense
          ];
        case 'REMOVE_EXPENSE':
          return state.filter(({ id }) => id !== action.id );
        case 'EDIT_EXPENSE':
          return state.map(expense => expense.id === action.id ? {...expense, ...action.updates} : expense );
        default:
          return state;
      }
    };

    // Filters Reducer
    const filterReducerDefaultState = {
      text: '',
      sortBy: 'date',
      startDate: undefined,
      endDate: undefined
    };

    const setTextFilter = (text) => ({
      type: 'SET_TEXT_FILTER',
      text
    });

    const sortByDate = () => ({
      type: 'SORT_BY_DATE'
    });

    const sortByAmount = () => ({
      type: 'SORT_BY_AMOUNT'
    });

    const setStartDate = (date = undefined) => ({
      type: 'SET_START_DATE',
      date
    });

    const setEndDate = (date = undefined) => ({
      type: 'SET_END_DATE',
      date
    });

    const filterReducer = (state = filterReducerDefaultState, action) => {
      switch (action.type){
        case 'SET_TEXT_FILTER':
          return {...state, text: action.text};
        case 'SORT_BY_DATE':
          return {...state, sortBy: 'date'};
        case 'SORT_BY_AMOUNT':
          return {...state, sortBy: 'amount'};
        case 'SET_START_DATE':
          return {...state, startDate: action.date};
        case 'SET_END_DATE':
          return {...state, endDate: action.date};
        default:
          return state;
      }
    };

    //Store creation
    const store = createStore(
      combineReducers({
        expense: expenseReducer,
        filter: filterReducer
      })
    );

    store.subscribe(() => {
      console.log(store.getState());
    });

    // const expenseOne = store.dispatch(addExpense({ description: 'Rent', amount: 1000 }));
    // const expenseTwo = store.dispatch(addExpense({ description: 'Coffee', amount: 1500 }));
    //
    // store.dispatch(removeExpense({ id: expenseOne.expense.id }));
    // store.dispatch(editExpense(expenseTwo.expense.id, { amount: 400 }));
    //
    // store.dispatch(setTextFilter('Rent'));
    // store.dispatch(setTextFilter(''));
    //
    // store.dispatch(sortByAmount());
    // store.dispatch(sortByDate());

    store.dispatch(setStartDate(125));
    store.dispatch(setStartDate());

    store.dispatch(setEndDate(300));
    store.dispatch(setEndDate());




    return(
      <div>
      </div>
    );
  };
}
