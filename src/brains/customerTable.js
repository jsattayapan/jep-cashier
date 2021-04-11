import  {serverIpAddress} from './../constanst';
import io from 'socket.io-client';
const { axios } = require('./networking');

const socket = io.connect(serverIpAddress, {upgrade: false, transports: ['websocket']});

export const getCurrentOrder = (id, callback) => {
  console.log('id current: ', id);
  const url = `${ serverIpAddress }api/restaurant/tables/item-orders/${id}`;
  axios.get(url).then((response) => {
    var orders = response.data;
    orders.sort(function(a,b){
      return new Date(a.createAt) - new Date(b.createAt);
    });
    callback(orders);
  });
}

export const createCustomerTable = (payload, callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/customer-tables/add`;
  axios.post(url, payload).then(response => {
    console.log('Resonse: ', response);
    socket.emit('clientCreateTable');
    callback(response.data);
  });
}

export const getOnlineItemsByNumber = (payload, callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/item-orders/getOnlineItemsByNumber`;
  axios.post(url, payload).then(response => {
    console.log(response);
    callback(response.data);
  });
}

export const submitVoidPayment = (table_id, callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/customer-tables/void-payment`;
  axios.post(url, {table_id}).then(response => {
    console.log('Resonse: ', response);
    callback(true, 'ทำการยกเลิกการจ่ายเงินสำเร็จ');
  }).catch(e => {
    console.log(e);
    callback(false, 'เกิดข้อผิดพลาด');
  });
}

export const closeCustomerTable = (customer_table_id) => {
  const url = `${ serverIpAddress }api/restaurant/tables/customer-tables/close`;
  axios.post(url, {customer_table_id}).then().catch(err => console.log(err));
}

export const sendNewOrderToServer = ({ userId, tableId, items }) => {
  const url = `${ serverIpAddress }api/restaurant/tables/item-orders/add`;
  axios.post(url, {
    userId, tableId, items: JSON.stringify(items)
  }).then((res) =>{
    console.log(res);
  }).catch(err => console.log(err));
}

export const cancelOrder = ({order_id, quantity, remark, create_by}, callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/item-orders/cancel`;
  axios.post(url, {
    order_id,
    quantity,
    remark,
    create_by
  }).then((res) => {
    console.log(res);
    callback();
  }).catch(e => console.log(e.msg));
}

export const checkBill = ({customer_table_id, user_id}, callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/customer-tables/check-bill`;
  axios.post(url, {customer_table_id, user_id}).then(res => {
    callback();
  }).catch(e => console.log(e));
}

export const getTableLogs = (table_id, callback) => {
  var logs = [];
  console.log('Get Table logs', table_id);
  let url = `${ serverIpAddress }api/restaurant/tables/customer-tables/get-table-status/${table_id}`;
  axios.get(url).then((res) => {
    for (const status of res.data){
      logs.push(status)
    }
    url = `${ serverIpAddress }api/restaurant/tables/item-orders/get-all-orders-status/${table_id}`;
    axios.get(url).then(res => {
      for(const status of res.data){
        logs.push(status)
      }
      logs.sort(function(a,b){
        return new Date(a.timestamp) - new Date(b.timestamp);
      });
      callback(logs);
    });
  });
}

export const getTableDiscount = (table_id, callback) => {
    const url = `${ serverIpAddress }api/restaurant/tables/customer-tables/customer-table-discount/${table_id}`;
    axios.get(url).then((res) => {
      callback(res.data[0]);
    })
}

export const submitTableDiscount = (table_id, user_id, payload, callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/customer-tables/customer-table-discount/`;
  axios.post(url, {table_id, user_id, payload}).then(res => {
    if(res.status === 200){
      callback();
    }
  })
}

export const getCustomerTableInfo = (table_id, callback) => {
  console.log('getCusomtertrableInfo');
  const url = `${ serverIpAddress }api/restaurant/tables/customer-tables/${ table_id}`;
  axios.get(url).then((data) => {
    console.log(data.data);
    if(data.status === 200){
      callback(data.data);
    }else{
      console.log(data);
    }
  })
}


export const updateRoomDelivery = ({customerTableId, roomDelivery} , callback) => {
  console.log(customerTableId);
  console.log(roomDelivery);
  const url = `${ serverIpAddress }api/restaurant/tables/customer-tables/updateRoomDelivery/`;
  axios.post(url, {customerTableId, roomDelivery}).then(res => {
    if(res.status === 200){
      callback();
    }
  })
}

export const getCustomerTablePayment = (table_id, callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/customer-tables/payment/${ table_id}`;
  axios.get(url).then((data) => {
    if(data.status === 200){
      callback(data.data);
    }else{
      console.log(data);
    }
  })
}


export const completePayment = ({
  total_amount,
  receive_amount,
  method,
  table_id,
  user_id,
  room_number,
  creditCardType,
  creditCardNumber,
  paymentList,
  service_charge_amount
}, callback) => {

  const receive_total_amount = method === 'cash' ? receive_amount : total_amount;
  const url = `${ serverIpAddress }api/restaurant/tables/customer-tables/complete-payment/`;
  axios.post(url, {total_amount,
  receive_amount: receive_total_amount,
  method,
  table_id,
  user_id,
room_number,
creditCardType,
creditCardNumber,
paymentList,
service_charge_amount
}).then(data => {
    if(data.status === 200){
      callback();
    }else{
      console.log(data);
    }
  })
}


export const transferOrders = ({
  tableNumber,
  orders,
  create_by,
  transferType,
  oldTableId,
  newTable
}, callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/customer-tables/transfer-orders`;
  axios.post( url, {tableNumber, orders, create_by, oldTableId, transferType, newTable} ).then((response) => {
    if(response.status === 200){
      callback({
        status: true
      })
    }else{
      callback({
        status: false
      })
    }
  })
}
