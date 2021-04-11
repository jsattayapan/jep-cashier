import io from 'socket.io-client';
import  { serverIpAddress } from './../constanst';
import { getTables, getCurrentShift, getHistrotyTable } from './tables';
import { store } from './../App';
import { loadTables, setSectionTables, setCurrentShift, setHistoryTables } from './../Redux/actions/tables';

import { getTablesBySection } from './../Redux/selectors/tables';

import {loadCookingFoodItems, loadCompleteFoodItems} from './../Redux/actions/foodItems';
import {getCookingFoods, getCompleteFoods} from './foodItems';

export const initialSocket = (userId) => {
  const socket = io.connect(serverIpAddress, {transports: ["websocket"], upgrade: false});
  socket.emit('setUserId', userId);
    
  socket.on('tableUpdate', () => {
    console.log('Talbe Updating');
    getTables((data) => {
      store.dispatch(loadTables(data));
      store.dispatch(setSectionTables(
        getTablesBySection(data, store.getState().tables.sectionTables[0].section)
      ));
    });
  });
    
    socket.on('error', function (err) {
        console.log(err);
    });

  socket.on('shiftUpdate', () => {
    getCurrentShift((status) => {
      store.dispatch(setCurrentShift(status));
    })
  })

  socket.on('historyTablesUpdate', () => {
    getHistrotyTable(tables => {
      store.dispatch(setHistoryTables(tables))
    })
  })

  socket.on('updateOrders',() => {
    getCookingFoods(data => {
      store.dispatch(loadCookingFoodItems(data));
      getCompleteFoods(data => {
        store.dispatch(loadCompleteFoodItems(data));
      })
    })
  })
}
