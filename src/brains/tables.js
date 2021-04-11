import  {serverIpAddress} from './../constanst';

const { axios } = require('./networking');

export const getStaffsSale = callback => {
    const url = `${ serverIpAddress }api/restaurant/report/getStaffsSaleDaily`;
     axios.get(url).then((response) => {
    callback(response.data);
  });
}

export const getTables = (callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/tables`;
  axios.get(url).then((response) => {
    callback(response.data);
  });
}

export const getSomtum = (callback) => {
    const url = `${ serverIpAddress }api/restaurant/tables/tables/getSomtumPrinter`;
    axios.get(url).then((response) => {
    callback(response);
  });
}

export const changeSomtum = (callback) => {
    const url = `${ serverIpAddress }api/restaurant/tables/tables/changeSomtumPrinter`;
    axios.post(url).then((response) => {
    callback(response);
  });
}

export const isTableOnHold = (table_number, callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/tables/${table_number}`;
  axios.get(url).then(response => {
    console.log(response);
    const body = response.data[0][0];
    if(body.status === 'available'){
      callback({status: 'available'});
    }else{
      callback({
        status: body.status,
        short_name: body.short_name
      })
    }
  });
}

export const updateTableStatus = (number, status, userId) => {
  const url = `${ serverIpAddress }api/restaurant/tables/tables/update-table-status`;
  axios.put(url, {
    number, status, hold_by: userId
  }).then().catch(e => console.log(e));
}

export const activeMorningShift = (user_id, callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/shifts/active-morning-shift`;
  axios.post(url, {
    user_id
  }).then((response) => {
    callback(response.data);
  }).catch(e => console.log(e));
}

export const getCurrentShift = (callback) => {
  const url = `${ serverIpAddress }api/restaurant/tables/shifts/current-shift`;
  axios.get(url).then((response) => {
    if(response.status === 200){
      callback(response.data);
    }else {
      callback({status: 'inactive'});
    }
  })
}

export const changeShift = (user_id, passcode, period, callback) => {
  var url;
  if(period === 'morning'){
    url = `${ serverIpAddress }api/restaurant/tables/shifts/save-morning-shift`;
  }else{
    url = `${ serverIpAddress }api/restaurant/tables/shifts/save-afternoon-shift`;
  }
  axios.post(url, {user_id, passcode}).then((response) => {
    if(response.data.status){
      callback(true, response.data.msg);
    }else{
      callback(false, response.data.msg || 'เกิดข้อผิดพลาด');
    }
  }).catch(eroor => {
    console.log(eroor);
    callback(false, 'เกิดข้อผิดพลาด');
  });
}

export const getHistrotyTable = (callback) => {
  var url = `${ serverIpAddress }api/restaurant/tables/tables/history-tables`;
  axios.get(url).then((response) => {
    var tables = response.data;
    tables.tables.sort(function(a,b){
      return new Date(b.close_at) - new Date(a.close_at);
    });
    callback(tables);
  }).catch(error => {
    console.log(error);
    callback([]);
  })
}


export const submitRefund = ({amount, remark, table_id, user_id}, callback) => {
  console.log('amount: ', amount);
  var url = `${ serverIpAddress }api/restaurant/tables/customer-tables/submit-refund`;
  axios.post(url, {amount, remark, table_id, user_id}).then(response => {
    if(response.data.status){
      callback(true, response.data.msg);
    }else{
      callback(false, response.data.msg);
    }
  }).catch(e => {
    console.log(e);
    callback(false, 'เกิดข้อผิดพลาด');
  })
}

// export const createCustomerTable = ({
//   table_number,
//   number_of_guest,
//   language,
//   zone,
//   create_by
// }) => {
//   const url = `${ serverIpAddress }api/restaurant/tables/customer-tables/add`;
//   axios.post(url, {
//     table_number,
//     number_of_guest,
//     language,
//     zone,
//     create_by
//   }).then().catch(err => console.log(err));
// }
