export const setCurrentOrders = (orders) => ({
  type: 'LOAD_CURRENT_ORDERS',
  orders: orders
});

export const setTableLogs = (logs) => ({
  type: 'LOAD_TABLES_LOGS',
  logs: logs
});

export const setSelectedTable = (tableInfo) => ({
  type: 'SET_SELECTED_TABLE',
  payload: tableInfo
});

export const updateSelectedTableStatus = (status) => ({
  type: 'SET_TABLE_STATUS',
  status
})

export const updateSelectedTableRoomDelivery = (roomDelivery) => ({
  type: 'SET_TABLE_ROOM_DELIVERY',
  roomDelivery
})
