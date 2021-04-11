import { serverIpAddress } from './../constanst';
import { store } from './../App';
import { loadAllFoodItems, setSelectedFoodItems } from './../Redux/actions/foodItems';

const { axios } = require('./networking');

export const getAllFoodItems = (callback) => {
  const url =`${ serverIpAddress }api/restaurant/items/menu-items`;
  axios.get(url).then(response => {
    console.log(response.data);
    callback(response.data);
  }).catch(err => console.log(err));
}

export const getDailyTotalItem = ({date}, callback) => {
  console.log('click server', date);
  const url = `${ serverIpAddress }api/restaurant/tables/item-orders/daily-total-items`;
  axios.post(url, {date}).then(response => {
    console.log(response);
    callback(true ,response.data);
  }).catch(err => {
    console.log(err);
    callback(false , '');
  });
}

export const getCookingFoods = (callback) => {
  var url = `${ serverIpAddress }api/restaurant/tables/order-status/get-cooking-order/บาร์น้ำ`;
  axios.get(url).then(response => {
    var items = response.data.sort((a,b) => (a.timestamp - b.timestamp));
    callback(items)
  }).catch(err => {
    console.log(err);
    callback([]);
  })
}

export const getCompleteFoods = (callback) => {
  var url = `${ serverIpAddress }api/restaurant/tables/order-status/get-complete-order/บาร์น้ำ`;
  axios.get(url).then(response => {
    var items = response.data.sort((a,b) => {
      var aTime = new Date(a.timestamp).getTime();
      var bTime = new Date(b.timestamp).getTime();
      return bTime - aTime;
    });
    callback(items)
  }).catch(err => {
    console.log(err);
    callback([]);
  })
}

export const submitCompleteStatus = ({
  item_order_id,
  status,
  create_by,
  quantity
}) => {
  var url = `${ serverIpAddress }api/restaurant/tables/order-status/add`;
  axios.post(url, {
    item_order_id,
    status,
    create_by,
    quantity
  }).catch(e => {
    console.log(e);
  })
}

export const redoCompleteStatus = ({
  item_order_id
}) => {
  var url = `${ serverIpAddress }api/restaurant/tables/order-status/delete-complete`;
  axios.post(url, {
    id: item_order_id
  }).catch(e => {
    console.log(e);
  })
}
