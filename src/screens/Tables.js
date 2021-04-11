import React from 'react';
import {connect} from 'react-redux';
import swal from 'sweetalert';

import peopleIcon from './../assets/icons/people.svg';
import {clearUser} from './../Redux/actions/user';
import {loadTables, setSectionTables, setHistoryTables} from './../Redux/actions/tables';
import {
  setSelectedTable,
  setCurrentOrders,
  setTableLogs
} from './../Redux/actions/customerTable';
import {loadCookingFoodItems, loadCompleteFoodItems} from './../Redux/actions/foodItems';
import {getCookingFoods, getCompleteFoods} from './../brains/foodItems';


import {getTablesBySection} from './../Redux/selectors/tables';
import LoadingScreen from '../components/LoadingScreen';
import {HeaderBar} from './../components/HeaderBar';
import {TopBuffer} from '../helpers/utilities';
import RegisterTablePopup from './../components/RegisterTable'

import {getTables, isTableOnHold, updateTableStatus, activeMorningShift, changeShift, getHistrotyTable, submitRefund, getSomtum, changeSomtum, getStaffsSale} from './../brains/tables';
import {isAuth} from './../brains/authentication';
import {
  getCurrentOrder,
  createCustomerTable,
  getTableLogs,
  submitVoidPayment
} from './../brains/customerTable';
import {logout, resetTableNUser} from '../brains/user';


import { formatNumber } from './../helpers/utilities';

import numeral from 'numeral'

import './Tables.css';

var moment = require('moment');

class Tables extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTablePage: [],
      showPopup: false,
      isLoading: false,
      selectedSection: '###',
    somtumPrinter:'',
        showPage: 'tables',
        staffs: [],
        totalCash: {count: 0, amount: 0},
        totalCard: {count: 0, amount: 0},
        totalRoom: {count: 0, amount: 0},
        totalTransfer: {count: 0, amount: 0},
        totalHalfHalf: {count: 0, amount: 0},
        totalThaiChana: {count: 0, amount: 0},
        totalGWallet: {count: 0, amount: 0},
        totalServiceCharge: {count: 0, amount: 0},
    };
    //AUTHENTICATION
    isAuth(this.props.user.id, data => {
      if (data) {
        getHistrotyTable(tables => {
          this.props.dispatch(setHistoryTables(tables))

        })
        getTables(data => {
          this.props.dispatch(loadTables(data));
          this.props.dispatch(
            setSectionTables(
              getTablesBySection(
                this.props.tables.allTables,
                this.props.tables.allTables[0].section
              )
            )
          );
        });
      } else {
        this.props.dispatch(clearUser());
        this.props.history.push('/');
      }
    });

  }

  calculateTotal = input => {
    let cash = {count: 0, amount: 0}
    let card = {count: 0, amount: 0}
    let room = {count: 0, amount: 0}
    let transfer = {count: 0, amount: 0}
    let halfHalf = {count: 0, amount: 0}
    let ThaiChana = {count: 0, amount: 0}
    let GWallet = {count: 0, amount: 0}
    let serviceCharge = {count: 0, amount: 0}
    if(input.tables !== undefined){
      input.tables.forEach(x => {
        console.log(cash.amount);
        console.log(x);

        if(x.service_charge_amount > 0){
          serviceCharge['count'] += 1
          serviceCharge['amount'] += x.service_charge_amount
        }
        if(x.method === 'cash'){
          cash['count'] += 1
          cash['amount'] += x.total_amount
        }
        if(x.method === 'card'){
          card['count'] += 1
          card['amount'] += x.total_amount
        }
        if(x.method === 'transfer'){
          transfer['count'] += 1
          transfer['amount'] += x.total_amount
        }
        if(x.method === 'room'){
          room['count'] += 1
          room['amount'] += x.total_amount
        }
        if(x.method === 'multiple'){
          x.multiple_payment.forEach(y => {
            if(y.paymentType === 'cash'){
              cash['count'] += 1
              cash['amount'] += y.amount
            }
            if(y.paymentType === 'creditCard'){
              card['count'] += 1
              card['amount'] += y.amount
            }
            if(y.paymentType === 'halfHalf'){
              halfHalf['count'] += 1
              halfHalf['amount'] += y.amount
            }
            if(y.paymentType === 'transfer'){
              transfer['count'] += 1
              transfer['amount'] += y.amount
            }
            if(y.paymentType === 'ThaiChana'){
              ThaiChana['count'] += 1
              ThaiChana['amount'] += y.amount
            }
            if(y.paymentType === 'G-Wallet'){
              GWallet['count'] += 1
              GWallet['amount'] += y.amount
            }
          })
        }
      })
    }
    console.log(cash);
    this.setState(() => ({
      totalCash: cash,
      totalCard: card,
      totalTransfer: transfer,
      totalRoom: room,
      totalHalfHalf: halfHalf,
      totalThaiChana: ThaiChana,
      totalGWallet: GWallet,
      totalServiceCharge: serviceCharge
    }))
  }

    componentDidMount(){
         getSomtum(res => {
            this.setState(() => ({
                somtumPrinter: res.data.value
            }))
        })

        getStaffsSale(res => {
            if(res.status){
                this.setState(() => ({
                    staffs: res.staffs.sort((a, b) => b.total - a.total)
                }))
            }
        })

        getHistrotyTable(tables => {
          this.calculateTotal(tables)
        })
    }


    setSomtumPrinter = () =>{
        changeSomtum(res => {
            this.setState(() => ({
                somtumPrinter: res.data.value
            }))
        })
    }

  togglePopup = tableNumber => {
    if (this.state.showPopup) {
      console.log('Update statu to available');
      updateTableStatus(this.state.tableNumber, 'available', '');
    }
    this.setState(state => ({
      tableNumber,
      showPopup: !state.showPopup
    }));
  };
  tableBoxClick = tableInfo => {
    this.setState({
      isLoading: true
    })
    isTableOnHold(tableInfo.number, res => {
      if (res.status === 'available') {
        if (tableInfo.id !== null) {
          updateTableStatus(tableInfo.number, 'on_order', this.props.user.id);
          this.props.dispatch(setSelectedTable(tableInfo));
          getCurrentOrder(tableInfo.id, response => {
            this.props.dispatch(setCurrentOrders(response));
            getTableLogs(tableInfo.id, logs => {
              this.props.dispatch(setTableLogs(logs));
              this.props.history.push('/customer-table');
            });
          });
        } else {
          console.log('Tabble Info: ', tableInfo);
          if(tableInfo.outlet === 'customer'){
            this.setState({
              isLoading: false
            })
            updateTableStatus(tableInfo.number, 'on_create', this.props.user.id);
            this.togglePopup(tableInfo.number);
          }else{
            this.setState({
              isLoading: false
            });
            this.submitCreateTable({
              language: 'ไทย',
              number_of_guest: 1,
              tableNumber: tableInfo.number,
              zone: 'B1'
            });
          }
        }
      } else {
        this.setState({
          isLoading: false
        })
        console.log('Someone is useing');
        swal({
          icon: 'error',
          title: 'ไม่สามารถเข้าได้',
          text: `${res.short_name} กำลังให้บริการโต๊ะ ${tableInfo.number}`
        });
      }
    });
  };
  logoutButtonClick = () => {
    logout(this.props.user.id);
    this.props.dispatch(clearUser());
    this.props.history.push('/');
  };
  changeTableSection = section => {
    this.setState({
      selectedSection: section
    });
    const result = getTablesBySection(this.props.tables.allTables, section);
    if (result !== this.props.tables.sectionTables) {
      this.props.dispatch(setSectionTables(result));
    }
  };
  submitCreateTable = ({language, number_of_guest, tableNumber, zone}) => {
    this.setState({
      showPopup: false,
      isLoading: true
    })
    updateTableStatus(tableNumber, 'on_order', this.props.user.id);
    const info = {
      table_number: tableNumber,
      number_of_guest,
      language,
      zone,
      create_by: this.props.user.id
    };
    createCustomerTable(info, data => {
      this.props.dispatch(setSelectedTable(data));
      getCurrentOrder(data.id, response => {
        this.props.dispatch(setCurrentOrders(response));
        getTableLogs(data.id, logs => {
          this.props.dispatch(setTableLogs(logs));
          this.props.history.push('/customer-table');
        });
      });
    });
  };


  activeMorningShift = () => {
    activeMorningShift(this.props.user.id, (response) => {
      if(!response.status){
        swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: response.msg
        });
      }
    });
  };

  dailyReportPage = () => {
    this.props.history.push('/daily-total-items');
  }

  checkerPage = () => {

this.props.history.push('/checker');
    // getCookingFoods(data => {
    //   this.props.dispatch(loadCookingFoodItems(data));
    //   getCompleteFoods(data => {
    //     this.props.dispatch(loadCompleteFoodItems(data));
    //     this.props.history.push('/checker');
    //   })
    // })
  }

  changeShift = (passcode) => {
    changeShift(this.props.user.id, passcode, this.props.tables.currentShift.period, (status, msg) => {
      if(status){
        swal({
          icon: 'success',
          title: 'สำเร็จ',
          text: msg
        });
      }else{
        swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: msg
        });
      }
    });
  }

  resetTableNUser = (passcode) => {
    if(passcode !== null){
      resetTableNUser(this.props.user.id, passcode, (status, msg) => {
        if(status){
          swal({
            icon: 'success',
            title: 'สำเร็จ',
            text: msg
          });
        }else{
          swal({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: msg
          });
        }
      });
    }
  }

  linkToHistoryPage = (page) => {
    this.setState({
      showPage: page
    })
  }

  submitRefund = ({amount, remark, table_id}) => {
    submitRefund({amount, remark, table_id, user_id: this.props.user.id}, (status, msg) => {
      if(status){
        swal({
          icon: 'success',
          title: 'สำเร็จ',
          text: msg
        });
      }else{
        swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: msg
        });
      }
    })
  }

  submitVoidPayment = (table_id) => {
    submitVoidPayment(table_id, (status, msg) => {
      if(status){
        swal({
          icon: 'success',
          title: 'สำเร็จ',
          text: msg
        }).then(() => {
          getHistrotyTable(tables => {
            this.props.dispatch(setHistoryTables(tables))
          })
        });
      }else{
        swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: msg
        });
      }
    })
  }

  render() {
    return (
      <div className="container-fluid" >
        { this.state.isLoading && <LoadingScreen /> }
        {this.state.showPopup && (
          <RegisterTablePopup
            togglePopup={this.togglePopup}
            submitCreateTable={this.submitCreateTable}
            tableNumber={this.state.tableNumber}
          />
        )}
        <HeaderBar
          name={this.props.user.name}
          buttonFunction={this.logoutButtonClick}
          buttonLabel="ออกจากระบบ"
          activeMorningShift={this.activeMorningShift}
          currentShift={this.props.tables.currentShift}
          changeShift={this.changeShift}
          resetTableNUser={this.resetTableNUser}
          dailyReportPage={this.dailyReportPage}
          checkerPage={this.checkerPage}
            setSomtumPrinter={this.setSomtumPrinter}
            somtumPrinter={this.state.somtumPrinter}
        />
        {this.props.tables.currentShift.status === 'active'?
          <div className="row fixed-content" style={{background: 'black'}}>
              <div className="col-sm-3 text-right">
                <button style={{color: 'white'}} className="btn btn-link" onClick={() => this.linkToHistoryPage('tables')}>โต๊ะปัจจุบัน</button>
              </div>
              <div className="col-sm-3 text-right">
                <button style={{color: 'white'}} className="btn btn-link" onClick={() => this.linkToHistoryPage('histrory')}>โต๊ะที่รับเงินแล้ว</button>
              </div>
            <div className="col-sm-3 text-right">
                <button style={{color: 'white'}} className="btn btn-link" onClick={() => this.linkToHistoryPage('staffsSale')}>ยอดรับออเดอร์วันนี้</button>
              </div>
          </div>:
          <div></div>
        }
        {
          this.props.tables.currentShift.status === 'active' ?
              <div className="row">
                <div className="col-12">
              {
                      this.state.showPage === 'tables' &&
          <div className="row">
            <div className="col-1">
              {this.props.tables.allTables.map((section, index) => (
                <TableSection
                  label={section.section}
                  key={index}
                  onclick={this.changeTableSection}
                  currentShift={this.props.tables.currentShift}
                  selectedSection={this.state.selectedSection}
                />
              ))}
            </div>
            <div className="col-11" style={{background: '#36B6DB'}}>
              <div className="row">
                {this.props.tables.sectionTables.map((table, index) => (
                  <TableBox tableInfo={table} link={this.tableBoxClick} />
                ))}
              </div>
            </div>
          </div>
                          }
          {
                      this.state.showPage === 'histrory' &&
                          <div className="row mt-4" fixed-content>

          <div className="col-12">
            <div className="row justify-content-center">
              <div className="col-2 text-right sumPaymentBox">
                <h4>เงินสด</h4>
              <p >{numeral(this.state.totalCash.amount).format('0,0')} บาท</p>
            <p>{this.state.totalCash.count} รายการ</p>
              </div>

              <div className="col-2 text-right sumPaymentBox">
                <h4>Service Charge</h4>
              <p >{numeral(this.state.totalServiceCharge.amount).format('0,0')} บาท</p>
            <p>{this.state.totalServiceCharge.count} รายการ</p>
              </div>
              <div className="col-2 text-right box1 sumPaymentBox">
                <h4>บัตร</h4>
              <p>{numeral(this.state.totalCard.amount).format('0,0')} บาท</p>
            <p>{this.state.totalCard.count} รายการ</p>
              </div>
              <div className="col-2 text-right box2 sumPaymentBox">
                <h4>ห้องพัก</h4>
              <p>{numeral(this.state.totalRoom.amount).format('0,0')} บาท</p>
            <p>{this.state.totalRoom.count} รายการ</p>
              </div>
            </div>
            <div className="row justify-content-center my-3">
              <div className="col-2  text-right box3 sumPaymentBox">
                <h4>โอนเงิน</h4>
              <p >{numeral(this.state.totalTransfer.amount).format('0,0')} บาท</p>
            <p>{this.state.totalTransfer.count} รายการ</p>
              </div>
              <div className="col-2  text-right box4 sumPaymentBox">
                <h4>คนละครึ่ง</h4>
              <p >{numeral(this.state.totalHalfHalf.amount).format('0,0')} บาท</p>
            <p>{this.state.totalHalfHalf.count} รายการ</p>
              </div>
              <div className="col-2 text-right box5 sumPaymentBox">
                <h4>ไทยชนะ</h4>
              <p >{numeral(this.state.totalThaiChana.amount).format('0,0')} บาท</p>
            <p>{this.state.totalThaiChana.count} รายการ</p>
              </div>
              <div className="col-2 text-right box6 sumPaymentBox">
                <h4>G-Wallet</h4>
              <p >{numeral(this.state.totalGWallet.amount).format('0,0')} บาท</p>
            <p>{this.state.totalGWallet.count} รายการ</p>
              </div>
            </div>
          </div>


            <div className="col-sm-12 text-center">
              <h4>โต๊ะที่รับเงินแล้ว</h4>
            </div>
            <div className="co-sm-12 mx-auto">
              <table className="table table-hover" style={{width: '1200px'}}>
                <thead>
                    <tr>
                      <th style={{ width: '10%', textAlign: 'left'}}>Bill No.</th>
                      <th style={{ width: '10%', textAlign: 'left'}}>โต๊ะ</th>
                      <th style={{ width: '10%', textAlign: 'right'}}>ยอดชำระ</th>
                    <th style={{ width: '10%', textAlign: 'center'}}>จ่ายโดย</th>
                      <th style={{ width: '10%', textAlign: 'center'}}>จำนวนลูกค้า</th>
                      <th style={{ width: '10%', textAlign: 'center'}}>ภาษา</th>
                      <th style={{ width: '10%', textAlign: 'center'}}>เปิดโต๊ะโดย</th>
                      <th style={{ width: '10%', textAlign: 'center'}}>เวลาเข้า</th>
                      <th style={{ width: '10%', textAlign: 'center'}}>เวลาออก</th>
                    </tr>
                </thead>
              </table>
              {
                this.props.tables.historyTables.tables.length !== 0 && this.props.tables.historyTables.tables.map( table => (
                  <HistroyTableLine
                    id={table.id}
                    table_number={table.table_number}
                    number_of_guest={table.number_of_guest}
                    total_amount={table.total_amount}
                    short_name={table.short_name}
                    orders={table.order}
                    method={table.method}
                    language={table.language}
                    open_at={table.open_at}
                    close_at={table.close_at}
                    discount_type={table.discount_type}
                    discount_amount={table.discount_amount}
                    discount_section={table.discount_section}
                    discount_remark={table.discount_remark}
                    room_number={table.room_number}
                    submitRefund={this.submitRefund}
                    refund_amount={table.refund_amount}
                    submitVoidPayment={this.submitVoidPayment}
                    payment_id={table.payment_id}
                    multiple_payment={table.multiple_payment}
                    service_charge_amount={table.service_charge_amount}
                  />
                ))
              }
              <div>
                เงินสด : {this.props.tables.historyTables.tables.reduce((total, i) => {
                  if(i.method === 'cash'){
                    return total+i.total_amount
                  }
                  if(i.method === 'multiple'){
                    let sumPayment = i.multiple_payment.reduce((multipleTotal, eachPayment) => {
                      if(eachPayment.paymentType === 'cash'){
                        return multipleTotal + eachPayment.amount
                      }
                      return multipleTotal
                    }, 0)
                    return total + sumPayment
                  }
                  return total
                }, 0)}
              </div>
            </div>
          </div>
                  }
                  { this.state.showPage === 'staffsSale' &&
                    <div className="col-12">
          {this.state.staffs.map((x, i) => (
            <div className="row rank-container">
              <div className="col-2 rank-number" style={
                  i == 0 ? {background: '#fce545', borderBottom: '5px solid red'}
                  : i == 1 ? {background: '#8cc0f0', borderBottom: '5px solid black'}
                  : {}

                }>
                {i+1}
              </div>
              <div className="col-8">
                <div className="rank-user" style={{width: `${x.total/this.state.staffs[0].total*100}%`}}>
                <div className="row">
                  <div className="col-12">
                    {x.total}
                  </div>
                </div>
              </div>
                  <b>{x.short_name}</b>
              </div>
            </div>
          ))}
        </div>
                  }

                </div>
              </div>
          :
          <div className="row" style={{marginTop:'300px'}}>
            <div className="col-sm-12 text-center">
              <h3>ยินดีต้อนรับสู่ระบบร้านอาหาร</h3>
              <h5>กรุณากดปุ่ม "เปิดรอบเช้า" เพื่อเริ่ิมการทำงาน</h5>
            </div>
          </div>
        }

      </div>
    );
  }
}

const mapStateToprops = state => {
  return {
    user: state.user,
    tables: state.tables,
    foodItems: state.foodItems
  };
};

export default connect(mapStateToprops)(Tables);

class HistroyTableLine extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      showOrders: false,
      showRefund: false,
      amount: '',
      remark: ''
    }
  }
  showOrders = () => {
    this.setState({
      showOrders: !this.state.showOrders
    });
    if(this.state.showOrders){
      this.setState({showRefund: false});
    }
  }

  amountOnChange = (e) => {
    const input = e.target.value;
    var isMatch = parseInt(input) <= (this.props.total_amount-this.props.refund_amount) && parseInt(input) > 0 ? true : false;
    console.log(input);
    if(!input || isMatch){
      this.setState({
        amount: input
      })
    }
  }

  submitVoidPayment = () => {
    swal({
      title:  `คุณต้องการยกเลิกการจ่ายเงินของโต๊ะ ${this.props.table_number} ?`,
      buttons: {
        cancel: "ปิด",
        confirm: "ยืนยัน",
        }
    }).then((data) => {
      if(data){
        this.props.submitVoidPayment(this.props.id);
      }
    });
    console.log(this.props);
  }

  submitRefund = () => {
    if(this.state.remark){
    this.props.submitRefund({
      amount: this.state.amount,
      remark: this.state.remark,
      table_id: this.props.id
    });
    this.setState({
      showOrders: false,
      showRefund: false,
      amount: '',
      remark: ''
    });
    }
  }

  remarkOnChange = (e) => {
    const input = e.target.value.trim();
    this.setState({
      remark: input
    });
  }

  render(){
    return(
<div style={{marginTop:'-15px'}}>
      <table className="table table-hover mt-0">
        <tbody>
        <tr onClick={() => this.showOrders()}>
          <td style={{textAlign: 'left', width: '10%'}} ><b>{this.props.payment_id}</b></td>
          <td style={{textAlign: 'left', width: '10%'}} ><b>{this.props.table_number}</b></td>
          <td style={{textAlign: 'right', width: '10%'}} >{formatNumber(this.props.total_amount)}.-</td>
        <td style={{textAlign: 'center', width: '10%'}} >{this.props.method === 'cash' ? 'เงินสด' :
              this.props.method === 'card' ? 'บัตร' :
              this.props.method === 'transfer' ? 'โอนเงิน' :
              this.props.method === 'room' ? 'ย้ายเข้าบัญชีห้องพัก' :
              this.props.method === 'multiple' ? 'แบ่งจ่าย' :
              'complimentary'
          }</td>
          <td style={{textAlign: 'left', width: '10%'}} >{this.props.number_of_guest}</td>
          <td style={{textAlign: 'left', width: '10%'}} >{this.props.language}</td>
          <td style={{textAlign: 'left', width: '10%'}} >{this.props.short_name}</td>
          <td style={{textAlign: 'left', width: '10%'}} >{moment(this.props.open_at).format('HH:mm')}</td>
          <td style={{textAlign: 'left', width: '10%'}} >{moment(this.props.close_at).format('HH:mm')}</td>
        </tr>
      </tbody>
    </table>
        {this.state.showOrders &&
          <table class="table table-borderless">
            <tbody>
          <tr>
          <td colSpan='9'>
            <div className="row">
              <div className='text-left col-sm-5 pl-4'>
                <p><b>รายการอาหาร:</b></p>
                {this.props.orders.map(order => (
                  <p>{order.quantity} x {order.name}</p>
                ))}
              </div>
              <div className='text-left col-sm-4 pl-4'>
                {this.props.method === "room" && <p><b>หมายเลขห้องพัก: </b>{this.props.room_number}</p> }
                {this.props.method === "transfer" && <p><b>หมายเลขการโอน: </b>{this.props.room_number}</p> }
                {this.props.method === "multiple" && <p><b>แบ่งจ่าย:</b></p> }
                {this.props.method === "multiple" && this.props.multiple_payment.map(p => {
                  let type = p.paymentType === 'cash' ? 'เงินสด' :
                  p.paymentType === 'creditCard' ? 'บัตร' :
                  p.paymentType === 'halfHalf' ? 'คนละครึ่ง' :
                  p.paymentType === 'G-Wallet' ? 'G-Wallet' : 'ไทยชนะ';
                  return <p>{type}: {formatNumber(p.amount)}.- {p.paymentType !== 'cash' && `|| ${p.reference}`}</p>
                }) }
                <p><b>ส่วนลด: </b>
                {
                  this.props.discount_type !== undefined?
                   this.props.discount_type === 'percentage' ?
                   `${this.props.discount_amount}% ${this.props.discount_section === 'f&b' ? 'อาหารและเครื่องดื่ม' :this.props.discount_section === 'b' ? 'เฉพาะเครื่องดื่ม' : 'เฉพาะอาหาร'}`:
                   this.props.discount_type === 'amount' ? `มูลค่า${this.props.discount_amount} บาท`
                : 'โต๊ะ complimentary'
                : '-'}
              </p>
              {this.props.discount_type === 'complimentary' && <p><b>หมายเหตู: </b>{this.props.discount_remark}</p>}
              {this.props.service_charge_amount > 0 ? <p><b>Service Charge: </b>{formatNumber(this.props.service_charge_amount)} บาท</p> :''}
              </div>
              <div className='text-left col-sm-3 pl-4'>
                <button className="btn btn-danger" onClick={() => this.submitVoidPayment()}>ยกเลิกการจ่ายเงิน</button>
                {this.state.showRefund &&
                  <div>
                    <div class="input-group mb-3">
                      <div className="input-group-prepend">
                        <span className="input-group-text" >หมายเหตุ</span>
                      </div>
                      <input type="text" className="form-control" value={this.state.remark} onChange={this.remarkOnChange} />
                    </div>
                    <div class="input-group mb-3">
                    <div className="input-group-prepend">
                      <span className="input-group-text" >จำนวนเงิน</span>
                    </div>
                    <input type="text" value={this.state.amount} className="form-control" onChange={this.amountOnChange} />
                  </div>
                  <button onClick={() => this.submitRefund()} className="btn btn-danger">ยืนยัน</button>
                  </div>}
              </div>
            </div>
          </td>
        </tr>

      </tbody>
    </table>}
    </div>
    )
  }
}

class TableSection extends React.Component {
  render() {
    const style = {
      margin: '0px -30px 0px 0px',
      cursor: 'pointer',
      background: this.props.selectedSection === this.props.label ? '#36B6DB' : 'white',
      borderRadius: '5px',
      border: '2px solid #36B6DB',
      height: '80px',
      color: this.props.selectedSection === this.props.label ? 'white' : 'black'
    };
    return (
      <div
        className="row tableSection"
        style={style}
        onClick={() => this.props.onclick(this.props.label)}
      >
        <div className="col-sm-12 text-center">
          <h4 className="mt-4">{this.props.label}</h4>
        </div>
      </div>
    );
  }
}

const TableBox = props => {
  const style = {
    background:
      props.tableInfo.status === 'opened'
        ? '#5291ff'
        : props.tableInfo.status === 'checked' ? '#C82333' : 'white'
  };
  const time = moment(props.tableInfo.timestamp);
  return (
    <div className="col-2">
      <div className="row">
        <div
          className="tableBox"
          style={style}
          onClick={() => props.link(props.tableInfo)}
        >
          <h3 style={{color: 'black'}}>{props.tableInfo.number}</h3>
          {props.tableInfo.status === null ? (
            ''
          ) : (
            <p style={{color: 'black'}}>
              <span>
                <img alt="Number of customer" src={peopleIcon} width="20px" />
              </span>{' '}
              x {props.tableInfo.number_of_guest} | Zone: {props.tableInfo.zone}
              <br /> {time.format('hh:mm A')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
