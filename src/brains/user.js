
import  {serverIpAddress} from './../constanst';

const { axios } = require('./networking');

export function login(number, passcode, callback){
  const url = `${ serverIpAddress }api/users/staffs/login`;
  axios.post(url, { number, passcode, platform: 'web-app-cashier' })
    .then((res) => {
      console.log(res);
      callback({
        status: true,
        data: res.data
      });
    }).catch(e => {
      console.log(e.response);
      const msg = e.response !== undefined ? e.response.data.msg : 'ไม่สามารถเชื่อมต่อกับเซิฟเวอร์ได้' ;
      callback({
        status: false,
        msg
      });
    });
}

export const logout = (id) => {
  const url = `${ serverIpAddress }api/users/staffs/logout`;
  axios.post(url, {id}).then();
}

export const resetTableNUser = (user_id, passcode, callback) => {
  var url = `${ serverIpAddress }api/users/staffs/reset-signed-in`;
  axios.post(url, {user_id, passcode}).then((response) => {
    if(response.data.status){
      url = `${ serverIpAddress }api/restaurant/tables/tables/reset-status`;
      axios.post(url, {user_id, passcode}).then((response) => {
        if(response.data.status){
          callback(true, 'สถานะของผู้ใช้และโต๊ะถูกรีเซ็ทแล้ว');
        }else{
          callback(false, response.data.msg || 'เกิดข้อผิดพลาด');
        }
      }).catch(eroor => {
        console.log(eroor);
        callback(false, 'เกิดข้อผิดพลาด');
      });
    }else{
      callback(false, response.data.msg || 'เกิดข้อผิดพลาด');
    }
  }).catch(eroor => {
    console.log(eroor);
    callback(false, 'เกิดข้อผิดพลาด');
  });
}
