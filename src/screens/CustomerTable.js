import React from 'react';
import {connect} from 'react-redux';
import {HeaderBar} from './../components/HeaderBar';
import 'font-awesome/css/font-awesome.min.css';
import './CustomerTableStyle.css';
import swal from 'sweetalert';

import validator from 'validator';

import {updateTableStatus} from './../brains/tables';
import {
  closeCustomerTable,
  sendNewOrderToServer,
  cancelOrder,
  checkBill,
  getCurrentOrder,
  getTableDiscount,
  submitTableDiscount,
  getTableLogs,
  getCustomerTableInfo,
  getCustomerTablePayment,
  completePayment,
  transferOrders,
  getOnlineItemsByNumber,
  updateRoomDelivery
} from './../brains/customerTable';
import {getAllFoodItems} from './../brains/foodItems';

import {getFoodItemsByCategory} from './../Redux/selectors/foodItems';
import {
  loadAllFoodItems,
  setSelectedFoodItems
} from './../Redux/actions/foodItems';
import {
  setCurrentOrders,
  setTableLogs,
  updateSelectedTableStatus,
  updateSelectedTableRoomDelivery
} from './../Redux/actions/customerTable';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faFireAlt,
  faTimesCircle,
  faEdit,
  faFileInvoiceDollar,
  faTrashAlt,
  faPercentage,
  faArrowDown,
  faHotel
} from '@fortawesome/free-solid-svg-icons';

import { formatNumber } from './../helpers/utilities';


import RegisterTablePopup from './../components/RegisterTable'


var moment = require('moment');

class CustomerTable extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      tables: [],
      newOrderItems: [],
      editNewItem: {
        show: false,
        payload: {}
      },
      deleteOrderItem: {
        show: false,
        payload: {}
      },
      discount: {
        show: false,
        payload: {}
      },
      payment: {
        show: false, //Change Back To False
        payload: {}
      },
      changeTable: {
        show: false
      },
      codeInput: '',
      searchInput: '',
      filterItems: [],
      showLogs: false
    };
  }

  componentDidMount(){
    const allTables = [];
    this.props.tables.allTables.forEach((section) => {
       section.tables.forEach(table => {
         allTables.push(table);
      })
    })
    getAllFoodItems(foodItems => {
      console.log('Food item:', foodItems);
      this.props.dispatch(loadAllFoodItems(foodItems));
      this.props.dispatch(
        setSelectedFoodItems(
          getFoodItemsByCategory(
            this.props.foodItems.allFoodItems,
            this.props.foodItems.allFoodItems[0].category
          )
        )
      );
    });
    this.setState(() => ({
      tables: allTables,
    }))
  }

  refreshTableInfo = () => {
    getCustomerTableInfo(this.props.customerTable.id, (data) => {
      this.props.dispatch(updateSelectedTableStatus(data.status));
      this.props.dispatch(updateSelectedTableRoomDelivery(data.roomDelivery))
      getCurrentOrder(this.props.customerTable.id, response => {
        this.props.dispatch(setCurrentOrders(response));
        getTableLogs(this.props.customerTable.id, logs => {
          this.props.dispatch(setTableLogs(logs));
        });
      });
    });
  }

  existButtonHandler = () => {
    updateTableStatus(this.props.customerTable.table_number, 'available', '');
    this.props.history.push('/tables');
  };
  closeCustomerTableHandler = () => {
    updateTableStatus(this.props.customerTable.table_number, 'available', '');
    closeCustomerTable(this.props.customerTable.id);
    this.props.history.push('/tables');
  };
  categoryButtonHandler = category => {
    this.setState({
      searchInput: ''
    });
    this.props.dispatch(
      setSelectedFoodItems(
        getFoodItemsByCategory(this.props.foodItems.allFoodItems, category)
      )
    );
  };
  addNewItem = payload => {
    var currentItems = this.state.newOrderItems;
    var isExisted = false;
    currentItems.forEach(item => {
      if (payload.code === item.code) {
        isExisted = true;
        item.quantity += payload.quantity;
        item.remark = payload.remark || item.remark;
      }
    });
    if (!isExisted) {
      currentItems.push(payload);
    }
    this.setState(() => ({
      newOrderItems: currentItems
    }));
  };
  newOrderItemsEdit = order => {
    this.setState({
      editNewItem: {
        show: true,
        payload: order
      }
    });
  };
  onEditClickClose = () => {
    this.setState({
      editNewItem: {
        show: false,
        payload: {}
      }
    });
  };
  onEditClickDelete = code => {
    var currentItems = this.state.newOrderItems.filter(
      item => item.code !== code
    );
    this.setState({
      editNewItem: {
        show: false,
        payload: {}
      },
      newOrderItems: currentItems
    });
  };
  onEditClickSave = ({code, quantity, remark}) => {
    var currentItems = this.state.newOrderItems;
    currentItems.forEach(item => {
      if (code === item.code) {
        item.quantity = quantity;
        item.remark = remark;
      }
    });
    this.setState({
      editNewItem: {
        show: false,
        payload: {}
      },
      newOrderItems: currentItems
    });
  };
  codeInputHandler = e => {
    this.setState({
      codeInput: e.target.value
    });
  };
  codeInputSubmit = e => {
    e.preventDefault();
    if (this.state.codeInput.trim() !== '') {
      const input = this.state.codeInput;
      const firstChar = input.charAt(0);
      if(firstChar === '#'){
        getOnlineItemsByNumber({number: input.slice(1) }, data => {
          let {items} = data
          if(items.length !== 0){
          items.forEach(itemOnline => {

            var setItem;
            this.props.foodItems.allFoodItems.forEach(category => {
              category.sub_category.forEach(sub_category => {
                sub_category.items.forEach(item => {
                  if (item.code === itemOnline.code) {
                    setItem = item;
                    setItem.price = this.props.customerTable.outlet === 'staff' ? item.staff_price : item.price
                  }
                });
              });
            });

            const data = {
              code: itemOnline.code,
              name: setItem.name,
              quantity: itemOnline.quantity,
              remark: '',
              price: setItem.price
            };
            this.addNewItem(data);
            this.setState({
              codeInput: ''
            });
          })
        }else {
          swal('เกิดข้อผิดพลาด', 'ไม่พบรายการอาหาร', 'error');
        }
        })
        this.setState({
          codeInput: ''
        });

      } else {
        const splitRemark = input.split('/');
        var errorQuantity = false;
        var remark;
        var quantity;
        if (splitRemark.length === 2) {
          remark = splitRemark[1];
        }
        const splitQuantity = splitRemark[0].split('*');
        if (splitQuantity.length === 2) {
          parseInt(splitQuantity[1]);
          quantity = parseInt(splitQuantity[1]);
          errorQuantity = isNaN(quantity);
        }

        var code = splitQuantity[0];
        var setItem;
        this.props.foodItems.allFoodItems.forEach(category => {
          category.sub_category.forEach(sub_category => {
            sub_category.items.forEach(item => {
              if (item.code === code) {
                setItem = item;
                setItem.price = this.props.customerTable.outlet === 'staff' ? item.staff_price : item.price
              }
            });
          });
        });
        if (setItem !== undefined && !errorQuantity) {
          if (quantity !== undefined) {
            const data = {
              code: code,
              name: setItem.name,
              quantity: quantity,
              remark: remark,
              price: setItem.price
            };
            this.addNewItem(data);
            this.setState({
              codeInput: ''
            });
          } else {
            const data = {
              code: code,
              name: setItem.name,
              quantity: 1,
              remark: remark,
              price: setItem.price
            };
            this.addNewItem(data);
            this.setState({
              codeInput: ''
            });
          }
        } else {
          if (setItem === undefined) {
            swal('เกิดข้อผิดพลาด', 'ไม่พบรายการอาหาร', 'error');
            this.setState({
              codeInput: ''
            });
          } else {
            swal('เกิดข้อผิดพลาด', 'จำนวนอาหารไม่ถูกต้อง', 'error');
            this.setState({
              codeInput: ''
            });
          }
        }
      }


    }
  };
  sendNewItemsHandler = () => {
    if (this.state.newOrderItems.length !== 0) {
      const userId = this.props.user.id;
      const tableId = this.props.customerTable.id;
      const items = this.state.newOrderItems;
      if (!tableId || !userId) {
        swal(
          'เกิดข้อผิดพลาด',
          'ไม่สามารถระบุไอดีของโต๊ะหรือผู้ใช้งานได้',
          'warning'
        );
      } else {
        sendNewOrderToServer({
          userId,
          tableId,
          items
        });
        swal('เสร็จสิ้น', 'รายการถูกบันทึก', 'success').then(() => {
          this.existButtonHandler();
        });
      }
    } else {
      swal('เกิดข้อผิดพลาด', 'ไม่พบรายการอาหารใหม่', 'warning');
    }
  };
  seachBoxChangeHandler = e => {
    if (e.target.value.length === 1) {
      this.setState({
        searchInput: e.target.value.trim()
      });
    } else {
      this.setState({
        searchInput: e.target.value
      });
    }

    var filterItems = [];
    this.props.foodItems.allFoodItems.forEach(category => {
      category.sub_category.forEach(sub_category => {
        sub_category.items.forEach(item => {
          if (
            item.name.toLowerCase().includes(e.target.value) ||
            item.code.toString().includes(e.target.value)
          ) {
            var setItem = item;
            setItem.price = this.props.customerTable.outlet === 'staff' ? item.staff_price : item.price
            filterItems.push(setItem);
          }
        });
      });
    });
    this.setState({
      filterItems: filterItems
    });
  };
  deleteOrderItem = payload => {
    this.setState({
      deleteOrderItem: {
        show: true,
        payload
      }
    });
  };
  deleteOrderItemClose = () => {
    this.setState({
      deleteOrderItem: {
        show: false,
        payload: {}
      }
    });
  };
  deleteOrderItemSubmit = payload => {
    this.setState({
      deleteOrderItem: {
        show: false,
        payload: {}
      }
    });
    cancelOrder(
      {
        order_id: payload.id,
        quantity: payload.quantity,
        remark: payload.remark,
        create_by: this.props.user.id
      },
      () => {
        getCurrentOrder(this.props.customerTable.id, response => {
          this.props.dispatch(setCurrentOrders(response));
          swal('สำเร็จ', 'รายการถูกยกเลิกแล้ว', 'success').then(() => {
            this.refreshTableInfo();
          });
        });
      }
    );
  };
  checkBill = () => {
    checkBill(
      {
        customer_table_id: this.props.customerTable.id,
        user_id: this.props.user.id
      },
      () => {
        swal('เสร็จสิ้น', 'รายการถูกบันทึก', 'success').then(() => {
          this.existButtonHandler();
        });
      }
    );
  };
  toggleShowLogs = () => {
    this.setState({
      showLogs: !this.state.showLogs
    });
  };
  discountHandler = () => {
    getTableDiscount(this.props.customerTable.id, payload => {
      this.setState({
        discount: {
          show: true,
          payload
        }
      });
    });
  };
  onDiscountSubmit = payload => {
    if(payload.type === 'percentage'){
      delete payload.amount;
    }else if (payload.type === 'amount'){
      delete payload.percentage;
    }
    submitTableDiscount(
      this.props.customerTable.id,
      this.props.user.id,
      payload,
      () => {
        swal('เสร็จสิ้น', 'รายการถูกบันทึก', 'success').then(() => {
          this.refreshTableInfo();
          this.setState({
            discount: {
              show: false
            }
          });
        });
      }
    );
  };

  updateRoomDelivery = status => {
    console.log(this.props.customerTable.id);
    console.log(status);
    console.log('hi');

      updateRoomDelivery({customerTableId: this.props.customerTable.id, roomDelivery: status}, () => {
        this.refreshTableInfo();
        swal('เสร็จสิ้น', 'รายการส่งขึ้นห้องถูกบันทึก', 'success').then(() => {
        });
      })
  }
  onDiscountClose = () => {
    this.setState({
      discount: {
        show: false
      }
    });
  };
  paymentHandler = () => {
    getCustomerTablePayment(this.props.customerTable.id, (payment) => {
      this.setState({
        payment: {
          show: true,
          payload: payment
        }
      })
    });
  }
  paymentCloseHandler = () => {
    this.setState({
      payment: {
        show:false
      }
    })
  }
  paymentSubmit = (payload) => {
  const {  payable,
    totalAmount,
    paymentType,
    roomNumber,
    creditCardType,
    creditCardNumber,
    paymentList,
    service_charge_amount
  } = payload;

    completePayment({
      total_amount : payable,
      receive_amount: totalAmount,
      method: paymentType,
      table_id: this.props.customerTable.id,
      user_id: this.props.user.id,
      room_number: roomNumber,
      creditCardType,
      creditCardNumber,
      paymentList,
      service_charge_amount
    }, () => {
      if(paymentType === 'cash'){
        setTimeout(() => {
          this.existButtonHandler()
        }, 3000);
      }else{
        this.existButtonHandler()
      }
    })
  }
  onChangeTableClick = () => {
    this.setState({
      changeTable: {
        show: true
      }
    })
  }
  onTableChangeClose = () => {
    this.setState({
      changeTable: {
        show: false
      }
    })
  }
  submitTransfer = (tableNumber, orders, transferType, newTable) => {
    transferOrders({
      tableNumber,
      orders,
      transferType,
      create_by: this.props.user.id,
      oldTableId: this.props.customerTable.id,
      newTable
    }, (response) => {
      this.setState({
        changeTable: {
          show: false
        }
      });
      if(response.status){
        this.existButtonHandler();
        swal('เสร็จสิ้น', 'รายการถูกบันทึก', 'success')
      } else {
        swal('เกิดข้อผิดพลาด', 'ไม่สามารถทำการย้ายโต๊ะได้', 'error')
      }
    })
  }
  render() {
    return (
      <div className="container-fluid">
        {this.state.discount.show && (
          <DiscountOption
            onClose={this.onDiscountClose}
            onSubmit={this.onDiscountSubmit}
            info={this.state.discount.payload}
          />
        )}
        {this.state.changeTable.show && (
          <ChangeTable
            tables={this.state.tables}
            orders={this.props.customerTable.currentOrders}
            tableNumber={this.props.customerTable.table_number}
            onClose={this.onTableChangeClose}
            submitTransfer={this.submitTransfer}
          />
        )}
        {this.state.payment.show && (
          <Payment
            payload={this.state.payment.payload}
            onClose={this.paymentCloseHandler}
            paymentSubmit={this.paymentSubmit}
          />
        )}
        {this.state.editNewItem.show && (
          <EditNewMenuItem
            onClickClose={this.onEditClickClose}
            onClickDelete={this.onEditClickDelete}
            onClickSave={this.onEditClickSave}
            payload={this.state.editNewItem.payload}
          />
        )}

        {this.state.deleteOrderItem.show && (
          <DeleteOrderItemOption
            onClickClose={this.deleteOrderItemClose}
            onClickDelete={this.deleteOrderItemSubmit}
            payload={this.state.deleteOrderItem.payload}
          />
        )}
        {this.props.customerTable.currentOrders &&
        this.props.customerTable.currentOrders.length === 0 ? (
          <HeaderBar
            name={this.props.user.name}
            info={this.props.customerTable}
            buttonFunction={() => {
              this.closeCustomerTableHandler();
            }}
            buttonLabel="ปิดโต๊ะ"
          />
        ) : (
          <HeaderBar
            name={this.props.user.name}
            info={this.props.customerTable}
            buttonFunction={() => {
              this.existButtonHandler();
            }}
            buttonLabel="กลับ"
          />
        )}

        <div className="row mt-3 fixed-content">
          <div className="col-sm-2" style={menuSectionStyle}>
            { this.props.foodItems.allFoodItems.map(cat => (
              <div className="row my-3">
                <div className="col-sm-12">
                  {this.props.foodItems.selectedFoodItems.category ===
                    cat.category && this.state.searchInput === '' ? (
                    <button
                      className="btn btn-info btn-lg btn-block"
                      onClick={() => this.categoryButtonHandler(cat.category)}
                    >
                      {cat.category}
                    </button>
                  ) : (
                    <button
                      className="btn btn-success btn-lg btn-block"
                      onClick={() => this.categoryButtonHandler(cat.category)}
                    >
                      {cat.category}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="col-sm-5">
            <div className="row">
              <div className="col-sm-12" style={menuItemStyle}>
                {this.state.searchInput === '' &&
                  this.props.foodItems.selectedFoodItems.sub_category &&
                  this.props.foodItems.selectedFoodItems.sub_category.map(
                    sub_cat => {
                      if (sub_cat.items.length !== 0) {
                        return (
                          <div>
                            <div className="row mx-auto">
                              {sub_cat.sub_category}
                            </div>
                            <div className="row mx-auto">
                              {sub_cat.items.map(item => (
                                <MenuItemBox
                                  label={item.name}
                                  price={ this.props.customerTable.outlet === 'staff' ? item.staff_price : item.price}
                                  code={item.code}
                                  onClick={this.addNewItem}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      }
                    }
                  )}
                {this.state.searchInput !== '' && (
                  <div className="row mx-auto">
                    {this.state.filterItems.map(item => (
                      <MenuItemBox
                        label={item.name}
                        price={item.price}
                        code={item.code}
                        onClick={this.addNewItem}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12" style={seachBoxStyle}>
                <div className="input-group mb-3 mt-3">
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon1">
                      ค้นหา
                    </span>
                  </div>
                  <input
                    onChange={this.seachBoxChangeHandler}
                    type="text"
                    className="form-control"
                    placeholder="ชื่อรายการ หรือ รหัส"
                    value={this.state.searchInput}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-5" style={orderListDivStyle}>
            <div className="col-sm-12" style={orderListPageStyle}>
              <div className="row" style={orderListTitleStyle}>
                <div className="col-sm-5" />
                <div className="col-sm-2">
                  <h4 style={{margin: 'auto'}}>
                    {!this.state.showLogs ? 'รายการ' : 'Logs'}
                  </h4>
                </div>
                <div className="col-sm-1" />
                <div className="col-sm-4">
                  <button
                    onClick={() => this.toggleShowLogs()}
                    className="btn btn-link pull-right"
                  >
                    ดู {this.state.showLogs ? 'รายการ' : 'Logs'}
                  </button>
                </div>
              </div>
              {!this.state.showLogs ? (
                <div>
                  <table width="100%">
                    <thead>
                      <tr>
                        <th style={{textAlign: 'center'}} width="10%">
                          จำนวน
                        </th>
                        <th width="10%">สถานะ</th>
                        <th width="60%">รายการ</th>
                        <th width="20%">ราคา</th>
                      </tr>
                    </thead>
                  </table>
                  <div
                    className="row"
                    style={{
                      margin: '5px 0',
                      width: '100%',
                      height: '440px',
                      overflow: 'scroll'
                    }}

                  >
                    <table width="100%">
                      {console.log(this.props.customerTable)}
                      {this.props.customerTable.currentOrders &&
                        this.props.customerTable.currentOrders.map(
                          (order, index) => (
                            <tbody>
                              <tr>
                                <td width="10%" style={{textAlign: 'center'}}>
                                  {order.quantity}
                                </td>
                                <td width="10%" style={{textAlign: 'center'}}>
                                  {order.status === 'sent' ? (
                                    <FontAwesomeIcon
                                      title={`ออเดอร์สถานะ: กำลังทำ | ส่งข้อมูลโดย: ${
                                        order.status_updateBy
                                      } | เวลา: ${moment(
                                        order.status_updateAt
                                      ).format('hh:mm A')}`}
                                      icon={faFireAlt}
                                      color="orange"
                                    />
                                  ) : order.status === 'complete' ? (
                                    <FontAwesomeIcon
                                      title={`ออเดอร์สถานะ: เสร็จ | อับเดตโดย: ${
                                        order.status_updateBy
                                      } | เวลา: ${moment(
                                        order.status_updateAt
                                      ).format('hh:mm A')}`}
                                      icon={faCheckCircle}
                                      color="green"
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      title={`ออเดอร์สถานะ: ยกเลิก | อับเดตโดย: ${
                                        order.status_updateBy
                                      } | เวลา: ${moment(
                                        order.status_updateAt
                                      ).format('hh:mm A')}`}
                                      icon={faTimesCircle}
                                      color="red"
                                    />
                                  )}
                                </td>
                                <td
                                  className="orderItem"
                                  width="60%"
                                  title={`รับโดย: ${
                                    order.createBy
                                  } | เวลา: ${moment(order.createAt).format(
                                    'hh:mm A'
                                  )}`}
                                >
                                  {order.name}&nbsp;&nbsp;{order.status !==
                                    'cancel' && (
                                    <span
                                      onClick={() =>
                                        this.deleteOrderItem({
                                          name: order.name,
                                          id: order.id,
                                          quantity: order.quantity
                                        })
                                      }
                                      title="ยกเลิก"
                                      className="newOrderItemsEdit deleteOrderIcon"
                                    >
                                      <FontAwesomeIcon
                                        icon={faTrashAlt}
                                        color="red"
                                      />
                                    </span>
                                  )}
                                </td>
                                <td width="20%">
                                  {formatNumber(order.price * order.quantity)}.-
                                </td>
                              </tr>
                            </tbody>
                          )
                        )}
                      {this.state.newOrderItems.map((order, index) => (
                        <tbody>
                          <tr className="newOrderItems">
                            <td
                              style={{textAlign: 'center'}}
                              width="10%"
                              className="quantity"
                            >
                              {order.quantity}
                            </td>
                            <td width="10%" style={{textAlign: 'center'}} />
                            <td width="60%">
                              {order.name}&nbsp;&nbsp;
                              <span
                                onClick={() => this.newOrderItemsEdit(order)}
                                className="newOrderItemsEdit"
                              >
                                <FontAwesomeIcon icon={faEdit} color="blue" />
                              </span>
                            </td>
                            <td width="20%">
                              {
                                formatNumber(order.price * order.quantity)

                              }.-
                            </td>
                          </tr>
                          {order.remark && (
                            <tr>
                              <td width="10%" />
                              <td width="10%" />
                              <td style={{color: 'grey'}}>** {order.remark}</td>
                            </tr>
                          )}
                        </tbody>
                      ))}
                    </table>
                  </div>
                </div>
              ) : (
                <div  >
                  <table width="100%">
                    <thead>
                      <tr>
                        <th width="75%">รายละเอียด</th>
                        <th width="15%">ส่งโดย</th>
                        <th width="10%">เวลา</th>
                      </tr>
                    </thead>
                  </table>
                  <div
                    className="row"
                    style={{
                      margin: '5px 0',
                      width: '100%',
                      height: '440px',
                      overflow: 'scroll'
                    }}
                  >
                    <table width="100%">
                      {this.props.customerTable.logs.map(log => (
                        <tbody>
                          <tr>
                            {(() => {
                              switch (log.status) {
                                case 'sent':
                                  return (
                                    <div>
                                      <td valign="top" width="15%">
                                        สั่ง :
                                      </td>
                                      <td valid="top" width="60%">
                                        <b>{log.name} x {log.quantity}
                                        </b>{' '}
                                        {log.detail !== null
                                          ? `หมายเหตุ:${log.detail}`
                                          : ``}
                                          {log.from_table !== null
                                            ? `ย้ายมาจากโต๊ะ:${log.from_table}`
                                            : ``}
                                      </td>
                                    </div>
                                  );
                                  break;
                                case 'cancel':
                                  return (
                                    <div>
                                      <td valign="top" width="15%">
                                        ยกเลิก :
                                      </td>
                                      <td valid="top" width="60%">
                                        <b>{log.name} x {log.quantity}
                                        </b>{' '}
                                        {log.detail !== null
                                          ? `หมายเหตุ:${log.detail}`
                                          : ``}
                                      </td>
                                    </div>

                                  );
                                  break;
                                case 'complete':
                                  return (
                                    <div>
                                      <td valign="top" width="15%">
                                        ปรุงเสร็จ :
                                      </td>
                                      <td valid="top" width="60%">
                                        <b>{log.name} x {log.quantity}
                                        </b>
                                      </td>
                                    </div>
                                  );
                                  break;
                                case 'opened':
                                  return (
                                    <td valid="top" width="75%">
                                      เปิดโต๊ะ
                                    </td>
                                  );
                                  break;
                                case 'checked':
                                  return (
                                    <td valid="top" width="75%">
                                      เรียกเช็คบิล
                                    </td>
                                  );
                                  break;
                                  case 'transfer':
                                    return (
                                      <div>
                                        <td valid="top" width="15%">
                                          ย้าย :
                                        </td>
                                        <td valid="top" width="60%">
                                          {log.detail}
                                        </td>
                                      </div>

                                    );
                                    break;
                                case 'discount':
                                  return (
                                    <td valid="top" width="75%">
                                      ใส่ส่วนลดเป็น: {log.detail}
                                    </td>
                                  );
                                default:
                                  return ;
                              }
                            })()}
                            <td valign="top" width="15%">
                              {log.short_name}
                            </td>
                            <td valign="top" width="10%">
                              {moment(log.timestamp).format('hh:mm')}
                            </td>
                          </tr>
                        </tbody>
                      ))}
                    </table>
                  </div>
                </div>
              )}
              <h4 style={{textAlign: 'right'}}>
                รวม{' '}
                {this.props.customerTable.currentOrders &&
                  formatNumber(this.props.customerTable.currentOrders.reduce(
                    (sum, order) => sum + order.price * order.quantity,
                    0
                  ))}.-
              </h4>
            </div>

            {/* Function Buttons  */}

            <div className="row mx-auto">
            {
              this.props.customerTable.currentOrders &&
              this.props.customerTable.currentOrders.length !== 0 ?
                <div className="col-sm-2">
                  <button onClick={() => this.onChangeTableClick()}
                    title="ย้ายโต๊ะ" className="btn btn-info">
                    <span style={{fontSize: '25px'}}>
                      <i className="fa fa-exchange" />
                    </span>
                  </button>
                </div>
                :
                  <div className="col-sm-2">
                    <button className="btn btn-secondary"
                      title="ย้ายโต๊ะ" disabled>
                      <span style={{fontSize: '25px'}}>
                        <i className="fa fa-exchange" />
                      </span>
                    </button>
                  </div>
            }

            {
              this.props.customerTable.outlet === 'customer'  ?
              <div className="col-sm-2">
                {
                  this.props.customerTable.currentOrders &&
                  this.props.customerTable.currentOrders.length !== 0 ?
                  <button
                    onClick={() => this.discountHandler()}
                    title="ลดราคา"
                    className="btn btn-info"
                  >
                    <span style={{fontSize: '25px'}}>
                      <FontAwesomeIcon icon={faPercentage} color="white" />
                    </span>
                  </button>
                  :
                  <button
                    title="ลดราคา"
                    className="btn btn-secondary"
                    disabled
                  >
                    <span style={{fontSize: '25px'}}>
                      <FontAwesomeIcon icon={faPercentage} color="white" />
                    </span>
                  </button>
                }

              </div>
              :
              <div className="col-sm-2">

              </div>
            }


            {
              this.props.customerTable.roomDelivery ?
              <div className='col-sm-2'>
                <button onClick={() => this.updateRoomDelivery(false)} className="btn btn-success">
                  <span style={{fontSize: '25px'}}>
                    <FontAwesomeIcon icon={faHotel} color="white" />
                </span>
                </button>
              </div>
              :
              <div className='col-sm-2'>
                <button onClick={() => this.updateRoomDelivery(true)} className="btn btn-info">
                  <span style={{fontSize: '25px'}}>
                    <FontAwesomeIcon icon={faHotel} color="white" />
                </span>
                </button>
              </div>
            }


              <div className="col-sm-2">
                {this.props.customerTable.currentOrders &&
                this.props.customerTable.currentOrders.length !== 0 ? (
                  <button
                    onClick={() => this.checkBill()}
                    title="เช็คบิล"
                    className="btn btn-info px-3"
                  >
                    <span style={{fontSize: '25px'}}>
                      <FontAwesomeIcon
                        icon={faFileInvoiceDollar}
                        color="white"
                      />
                    </span>
                  </button>
                ) : (
                  <button
                    title="เช็คบิล"
                    className="btn btn-secondary px-3"
                    disabled
                  >
                    <span style={{fontSize: '25px'}}>
                      <FontAwesomeIcon
                        icon={faFileInvoiceDollar}
                        color="white"
                      />
                    </span>
                  </button>
                )}
              </div>
              {
                this.props.customerTable.outlet !== 'vip'  ?
                <div className="col-sm-2">
                  {console.log('VIP',this.props.customerTable)}
                  {this.props.customerTable.status === 'checked' ? (
                    <button title="รับเงิน" className="btn btn-info" onClick={() => this.paymentHandler()}>
                      <span style={{fontSize: '25px'}}>
                        <i className="fa fa-money" />
                      </span>
                    </button>
                  ) : (
                    <button
                      title="รับเงิน"
                      className="btn btn-secondary"
                      disabled
                    >
                      <span style={{fontSize: '25px'}}>
                        <i className="fa fa-money" />
                      </span>
                    </button>
                  )}
                </div> :
                <div className="col-sm-2">

                </div>
              }


              <div className="col-sm-2">
                {this.state.newOrderItems.length !== 0 ? (
                  <button
                    title="ส่งรายการ"
                    className="btn btn-info"
                    onClick={() => this.sendNewItemsHandler()}
                  >
                    <span style={{fontSize: '25px'}}>
                      <i className="fa fa-send" />
                    </span>
                  </button>
                ) : (
                  <button
                    title="ส่งรายการ"
                    className="btn btn-secondary"
                    disabled
                  >
                    <span style={{fontSize: '25px'}}>
                      <i className="fa fa-send" />
                    </span>
                  </button>
                )}
              </div>
            </div>
            <form onSubmit={this.codeInputSubmit}>
              <div className="row" style={{margin: '10px 0 0 0'}}>
                <div className="input-group" style={{margin: '18px 0 0 0'}}>
                  <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon1">
                      Code:{' '}
                    </span>
                  </div>
                  <input
                    autoFocus
                    type="text"
                    className="form-control"
                    placeholder="รหัส*จำนวน#หมายเหตุ"
                    onChange={this.codeInputHandler}
                    value={this.state.codeInput}
                  />
                  <div className="input-group-append">
                    <button className="btn btn-success" type="submit">
                      เพิ่ม
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToprops = state => {
  return {
    user: state.user,
    customerTable: state.customerTable,
    foodItems: state.foodItems,
    tables: state.tables
  };
};

export default connect(mapStateToprops)(CustomerTable);

class MenuItemBox extends React.Component {
  render() {
    const style = {
      background: 'green',
      height: '100px',
      margin: '5px',
      borderRadius: '10px',
      color: 'white',
      position: 'relative'
    };

    return (
      <div
        className="col-sm-2"
        style={style}
        onClick={() =>
          this.props.onClick({
            quantity: 1,
            name: this.props.label,
            price: this.props.price,
            code: this.props.code
          })
        }
      >
        <p style={{position: 'absolute', left: '3px', fontSize: '12px'}}>
          {this.props.code}
        </p>
        <p
          style={{
            position: 'absolute',
            top: '20px',
            left: '3px',
            textAlign: 'center'
          }}
        >
          {this.props.label}
        </p>
        <p
          style={{
            position: 'absolute',
            bottom: '-15px',
            right: '3px',
            fontSize: '12px'
          }}
        >
          {formatNumber(this.props.price)}.-
        </p>
      </div>
    );
  }
}

const orderListTitleStyle = {
  margin: '10px auto',
  height: '40px',
  width: '80%',
  borderBottom: '1px solid black'
};

const orderListPageStyle = {
  background: '#fff',
  height: '80%',
  borderRadius: '10px'
};

const orderListDivStyle = {
  border: '2px solid black'
};

const menuItemStyle = {
  border: '2px solid black',
  height: '630px',
  overflow: 'scroll'
};

const seachBoxStyle = {
  border: '2px solid black',
  height: '70px'
};

const menuSectionStyle = {
  border: '2px solid black',
  height: '700px'
};

class EditNewMenuItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      quantity: this.props.payload.quantity,
      remark: this.props.payload.remark || ''
    };
  }
  remarkOnChangeHandler = e => {
    this.setState({
      remark: e.target.value
    });
  };
  increaseQuantity = () => {
    const current = this.state.quantity;
    this.setState({
      quantity: current + 1
    });
  };
  decreaseQuantity = () => {
    const current = this.state.quantity;
    if (current > 1) {
      this.setState({
        quantity: current - 1
      });
    }
  };
  render() {
    return (
      <div className="editNewMenuItemFill">
        <div className="editNewMenuItemContent">
          <div className="container">
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-12">
                <h4>รายการ: {this.props.payload.name}</h4>
              </div>
            </div>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-12">
                <h4 style={{margin: '10px'}}>
                  จำนวน:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <span>
                    <button
                      className="btn btn-success"
                      onClick={this.decreaseQuantity}
                    >
                      -
                    </button>
                  </span>
                  &nbsp; {this.state.quantity} &nbsp;
                  <span>
                    <button
                      className="btn btn-success"
                      onClick={this.increaseQuantity}
                    >
                      +
                    </button>
                  </span>
                </h4>
              </div>
            </div>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>หมายเหตุ</label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={this.remarkOnChangeHandler}
                    value={this.state.remark}
                  />
                </div>
              </div>
            </div>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-4">
                <button
                  onClick={() => this.props.onClickClose()}
                  className="btn btn-secondary"
                >
                  ปิด
                </button>
              </div>
              <div className="col-sm-4">
                <button
                  onClick={() =>
                    this.props.onClickDelete(this.props.payload.code)
                  }
                  className="btn btn-danger"
                >
                  ลบ
                </button>
              </div>
              <div className="col-sm-4">
                <button
                  onClick={() =>
                    this.props.onClickSave({
                      code: this.props.payload.code,
                      quantity: this.state.quantity,
                      remark: this.state.remark.trim()
                    })
                  }
                  className="btn btn-info"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class DeleteOrderItemOption extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      quantity: this.props.payload.quantity,
      remark: '',
      remarkError: false
    };
  }
  remarkOnChangeHandler = e => {
    this.setState({
      remark: e.target.value
    });
  };
  increaseQuantity = () => {
    const current = this.state.quantity;
    if (current < this.props.payload.quantity) {
      this.setState({
        quantity: current + 1
      });
    }
  };
  decreaseQuantity = () => {
    const current = this.state.quantity;
    if (current > 1) {
      this.setState({
        quantity: current - 1
      });
    }
  };
  deleteBtnHandler = () => {
    if (this.state.remark.trim() !== '') {
      this.props.onClickDelete({
        id: this.props.payload.id,
        quantity: this.state.quantity,
        remark: this.state.remark
      });
    } else {
      this.setState({
        remarkError: true,
        remark: ''
      });
    }
  };
  render() {
    return (
      <div className="editNewMenuItemFill">
        <div className="editNewMenuItemContent">
          <div className="container">
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-12 text-center">
                <h4>คุณต้องการยกเลิก</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12 text-center">
                <p>รายการ: {this.props.payload.name}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12 text-center">
                <h4 style={{margin: '10px'}}>
                  จำนวน:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <span>
                    <button
                      className="btn btn-success"
                      onClick={this.decreaseQuantity}
                    >
                      -
                    </button>
                  </span>
                  &nbsp; {this.state.quantity} &nbsp;
                  <span>
                    <button
                      className="btn btn-success"
                      onClick={this.increaseQuantity}
                    >
                      +
                    </button>
                  </span>
                </h4>
              </div>
            </div>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>
                    หมายเหตุ{' '}
                    {this.state.remarkError && (
                      <span style={{color: 'red'}}>*กรุณาใส่หมายเหตุ</span>
                    )}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={this.remarkOnChangeHandler}
                    value={this.state.remark}
                  />
                </div>
              </div>
            </div>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-6 text-center">
                <button
                  onClick={() => this.props.onClickClose()}
                  className="btn btn-secondary"
                >
                  ปิด
                </button>
              </div>
              <div className="col-sm-6 text-center">
                <button
                  onClick={() => this.deleteBtnHandler()}
                  className="btn btn-danger"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class DiscountOption extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: props.info !== undefined ? props.info.type : 'percentage',
      percentage: props.info !== undefined ? props.info.amount : '',
      section: props.info !== undefined ? props.info.section : 'f&b',
      amount: props.info !== undefined ? props.info.amount : '',
      remark: props.info !== undefined ? props.info.remark : ''
    };
  }
  onTypeChange = value => {
    this.setState({
      type: value,
      percentage: value !== 'percentage' ? '' : this.state.percentage,
      amount: value !== 'amount' ? '' : this.state.amount,
      remark: value !== 'complimentary' ? '' : this.state.remark
    });
  };
  onSectionChnage = value => {
    this.setState({
      section: value
    });
  };
  onChangePercentage = e => {
    const amount = e.target.value;
    if (!amount || amount.match(/^[1-9][0-9]?$|^100$/)) {
      this.setState({
        percentage: amount
      });
    }
  };
  onChangeAmount = e => {
    const amount = e.target.value;
    if (!amount || amount.match(/^\d{1,}?$/)) {
      this.setState({
        amount: amount
      });
    }
  };
  onRemarkChange = e => {
    this.setState({
      remark: e.target.value
    });
  };
  render() {
    return (
      <div className="editNewMenuItemFill">
        <div className="discountContent">
          <div className="container">
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-12 text-center">
                <h5>ส่วนลด</h5>
              </div>
            </div>
            <h6>ส่วนลดโดย:</h6>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-4 text-center">
                <label class="radio-inline">
                  <input
                    type="radio"
                    onClick={() => this.onTypeChange('percentage')}
                    name="optradio"
                    checked={this.state.type === 'percentage'}
                  />{' '}
                  เปอร์เซ็นต์
                </label>
              </div>
              <div className="col-sm-4 text-center">
                <label class="radio-inline">
                  <input
                    type="radio"
                    onClick={() => this.onTypeChange('amount')}
                    name="optradio"
                    checked={this.state.type === 'amount'}
                  />{' '}
                  จำนวนเงิน
                </label>
              </div>
              <div className="col-sm-4 text-center">
                <label class="radio-inline">
                  <input
                    type="radio"
                    onClick={() => this.onTypeChange('complimentary')}
                    name="optradio"
                    checked={this.state.type === 'complimentary'}
                  />{' '}
                  Compl.
                </label>
              </div>
            </div>
            <br />
            <h6>รายการที่ใช้ส่วนลด:</h6>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-4 text-center">
                <label class="radio-inline">
                  <input
                    type="radio"
                    name="section"
                    onClick={() => this.onSectionChnage('f&b')}
                    disabled={this.state.type !== 'percentage'}
                    checked={this.state.section === 'f&b'}
                  />{' '}
                  อาหาร & เครื่องดื่ม
                </label>
              </div>
              <div className="col-sm-4 text-center">
                <label class="radio-inline">
                  <input
                    type="radio"
                    name="section"
                    onClick={() => this.onSectionChnage('f')}
                    disabled={this.state.type !== 'percentage'}
                    checked={this.state.section === 'f'}
                  />{' '}
                  เฉพาะอาหาร
                </label>
              </div>
              <div className="col-sm-4 text-center">
                <label class="radio-inline">
                  <input
                    type="radio"
                    name="section"
                    onClick={() => this.onSectionChnage('b')}
                    disabled={this.state.type !== 'percentage'}
                    checked={this.state.section === 'b'}
                  />{' '}
                  เฉพาะเครื่องดื่ม
                </label>
              </div>
            </div>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-8 mx-auto">
                {this.state.type === 'percentage' ? (
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="จำนวน"
                      value={this.state.percentage}
                      onChange={this.onChangePercentage}
                    />
                    <div className="input-group-append">
                      <span className="input-group-text" id="basic-addon2">
                        %.
                      </span>
                    </div>
                  </div>
                ) : this.state.type === 'amount' ? (
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="จำนวน"
                      value={this.state.amount}
                      onChange={this.onChangeAmount}
                    />
                    <div className="input-group-append">
                      <span className="input-group-text" id="basic-addon2">
                        บาท.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="input-group mb-3">
                    <input
                      onChange={this.onRemarkChange}
                      type="currency"
                      className="form-control"
                      placeholder="หมายเหตุ"
                      value={this.state.remark}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="row" style={{marginTop: '20px'}}>
              <div className="col-sm-6 text-center">
                <button
                  onClick={() => this.props.onClose()}
                  className="btn btn-secondary"
                >
                  ปิด
                </button>
              </div>
              <div className="col-sm-6 text-center">
                <button
                  disabled={
                    !(
                      this.state.amount ||
                      this.state.percentage ||
                      this.state.remark
                    )
                  }
                  onClick={() => this.props.onSubmit(this.state)}
                  className="btn btn-warning"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class Payment extends React.Component{
  constructor(props){
    super(props);
    console.log(this.props.payload);
    this.state = {
      payable: Math.ceil(this.props.payload.sub_total_amount - this.props.payload.discount_amount + this.props.payload.service_charge_amount),
      totalAmount: 0,
      paymentType: 'cash',
      showChange: false,
      changeAmount: 0,
      roomNumber: '',
      creditCardNumber: '',
      creditCardType: '',
      paymentList: [],
      service_charge_amount: Math.ceil(this.props.payload.service_charge_amount),
    }
  }

  setRoomNumber = (event) => {
    this.setState({roomNumber: event.target.value.trim()})
  }
  setCreditCardNumber = (event) => {
    this.setState({creditCardNumber: event.target.value.trim()})
  }

  addAmount = (amount) => {
    if(this.state.paymentType === 'cash'){
      this.setState({
        totalAmount: this.state.totalAmount + amount
      })
    }
  }
  setExactAmount = () => {
    if(this.state.paymentType === 'cash'){
      this.setState({
        totalAmount: this.state.payable
      })
    }
  }
  clearAmount = () => {
    if(this.state.paymentType === 'cash'){
      this.setState({
        totalAmount: 0
      });
    }
  }
  changePaymentType = (type) => {
    const creditCardAmount = Math.ceil((this.props.payload.sub_total_amount - this.props.payload.discount_amount + this.props.payload.service_charge_amount) * 1.03);
    if(type === 'card'){
      this.setState({
        paymentType: type,
        payable: creditCardAmount
      })
    }else{
      this.setState({
        paymentType: type,
        payable: Math.ceil(this.props.payload.sub_total_amount - this.props.payload.discount_amount + this.props.payload.service_charge_amount),
        paymentList: []
      })
    }

  }

  changeCreditCardType = (type) =>{
    this.setState({
      creditCardType: type
    })
  }

  paymentSubmit = () => {
    if(this.state.paymentType === 'cash'){
      this.setState({
        changeAmount: this.state.totalAmount - this.state.payable,
        showChange:true
      })
    }
    this.props.paymentSubmit(this.state);
  }

  getRemainBalance = () => {
    const { paymentList, payable} = this.state
    const sum = paymentList.reduce((totalAmount, payment) => {
      return totalAmount += parseFloat(payment.amount)
    }, 0)
    return payable - sum
  }

  render() {
    return (
      <div className="editNewMenuItemFill">
        <div className="paymentContent">
          <div className="container">

            {this.state.showChange &&
              <div className="editNewMenuItemFill">
                <div className="changeContent">
                  <div className="container">
                    <div className="row mt-3">
                      <div className="col-sm-12 text-center">
                        <h2>เงินทอน:</h2>
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-sm-12 text-center">
                        <h1>{formatNumber(this.state.changeAmount)}.- บาท</h1>
                      </div>
                    </div>
                  </div>
                </div>
              </div>}

            <div className="row mt-3">
              <div className="col-sm-12 text-center">
                <h3>รับเงิน</h3>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6 text-center">
                <h5>ราคารวม</h5>
                <p>{this.props.payload.sub_total_amount}</p>
              </div>
              <div className="col-sm-6 text-center">
                <h5>ส่วนลด</h5>
                <p>{this.props.payload.discount_amount || 0}</p>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12 text-center">
                <h1>ยอดเงินที่ต้องชำระ: <span>{this.state.payable}.-</span></h1>
              </div>
            </div>
            {
              this.state.paymentType === 'cash' &&
              <div className="row">
              <div className="col-12">
                <div className="row">
                  <div className="col-sm-12 text-center">
                    <input type="text" size="20" value={formatNumber(this.state.totalAmount)+'.-'} style={
                      {
                        fontSize: '30px',
                        textAlign: 'right',
                        paddingRight: '30px',
                        color: this.state.paymentType === 'cash' ? 'black' : 'grey'
                      }} />
                  </div>
                </div>
                <div className="row mt-4 mx-4">
                <AmountButton addAmount={() => this.addAmount(1000)} amount="1,000" paymentType={this.state.paymentType}/>
                <AmountButton addAmount={() => this.addAmount(500)} amount="500" paymentType={this.state.paymentType}/>
                <AmountButton addAmount={() => this.addAmount(100)} amount="100" paymentType={this.state.paymentType}/>
                </div>
                <div className="row mx-4">
                  <AmountButton addAmount={() => this.addAmount(50)} amount="50" paymentType={this.state.paymentType}/>
                  <AmountButton addAmount={() => this.addAmount(20)} amount="20" paymentType={this.state.paymentType}/>
                  <AmountButton addAmount={() => this.addAmount(10)} amount="10" paymentType={this.state.paymentType}/>
                </div>
                <div className="row mx-4">
                  <AmountButton addAmount={() => this.addAmount(5)} amount="5" paymentType={this.state.paymentType}/>
                  <AmountButton addAmount={() => this.addAmount(1)} amount="1" paymentType={this.state.paymentType}/>
                  <AmountButton addAmount={() => this.setExactAmount()} amount="พอดี" paymentType={this.state.paymentType}/>
                </div>
                <div className="row mx-4">
                  <div onClick={() => this.clearAmount()} className="col-sm-12" style={{
                    fontSize: '30px',
                    width: '100%',
                    height: '45px',
                    background: 'white',
                    textAlign: 'center',
                    border: `1px solid ${this.state.paymentType === 'cash' ? 'black' : 'grey'}`,
                    color: this.state.paymentType === 'cash' ? 'black' : 'grey'
                  }}>
                    ลบ
                  </div>
                </div>
              </div>
            </div>}



            <div className="row justify-content-around mt-3">
              <div className="col-sm-2 text-center">
                <label style={{width: '100%'}}>
                  <input type="radio" name="paymentType"
                    checked={this.state.paymentType === 'cash'}
                    onClick={() => this.changePaymentType('cash')}
                  />
                   <div style={this.paymentTypeStyle}>
                     เงินสด
                   </div>
                </label>
              </div>
              <div className="col-sm-2 text-center">
                <label style={{width: '100%'}}>
                  <input type="radio" name="paymentType"
                    checked={this.state.paymentType === 'room'}
                    onClick={() => this.changePaymentType('room')}
                  />
                   <div style={this.paymentTypeStyle}>
                     ห้องพัก
                   </div>
                </label>
              </div>
              <div className="col-sm-2 text-center">
                <label style={{width: '100%'}}>
                  <input type="radio" name="paymentType"
                    checked={this.state.paymentType === 'card'}
                    onClick={() => this.changePaymentType('card')}
                  />
                   <div style={this.paymentTypeStyle}>
                     บัตร
                   </div>
                </label>
              </div>
                <div className="col-sm-2 text-center">
                <label style={{width: '100%'}}>
                  <input type="radio" name="paymentType"
                    checked={this.state.paymentType === 'transfer'}
                    onClick={() => this.changePaymentType('transfer')}
                  />
                   <div style={this.paymentTypeStyle}>
                     โอนเงิน
                   </div>
                </label>
              </div>
              <div className="col-sm-2 text-center">
              <label style={{width: '100%'}}>
                <input type="radio" name="paymentType"
                  checked={this.state.paymentType === 'multiple'}
                  onClick={() => this.changePaymentType('multiple')}
                />
                 <div style={this.paymentTypeStyle}>
                   เป๋าตัง
                 </div>
              </label>
            </div>
            </div>


            {/* G-Wallet */}
            {
              this.state.paymentType === 'multiple' &&
              <GWallet
                paymentList={this.state.paymentList}
                updatePaymentList={(paymentList) => this.setState(() => ({paymentList}))}
                total={this.state.payable}
               />
            }

            { this.state.paymentType === 'room'? <div className="row mt-4">
              <div className="col-sm-3">
              </div>
              <div className="col-sm-6">
                <div class="input-group mb-3 center-block">
                    <div class="input-group-prepend">
                      <span class="input-group-text" >ห้องพัก #</span>
                    </div>
                    <input type="text" class="form-control" onChange={this.setRoomNumber} value={this.state.roomNumber} placeholder="Eg. 1023" />
                  </div>
              </div>
              <div className="col-sm-3">
              </div>
            </div> :
              this.state.paymentType === 'transfer'? <div className="row mt-4">
              <div className="col-sm-3">
              </div>
              <div className="col-sm-6">
                <div class="input-group mb-3 center-block">
                    <div class="input-group-prepend">
                      <span class="input-group-text" >Ref. :</span>
                    </div>
                    <input type="text" class="form-control" onChange={this.setRoomNumber} value={this.state.roomNumber} placeholder="Eg. xxx" />
                  </div>
              </div>
              <div className="col-sm-3">
              </div>
            </div>
              : this.state.paymentType === 'card' ? <div className="row mt-4">
              <div className="col-sm-12">
                <div className="row mt-12">
                  <div className="col-sm-3 text-center">
                    <label style={{width: '100%'}}>
                      <input type="radio" name="creditCardType"
                        checked={this.state.creditCardType === 'UNION'}
                        onClick={() => this.changeCreditCardType('UNION')}
                      />
                       <div style={this.paymentTypeStyle}>
                         Union
                       </div>
                    </label>
                  </div>
                  <div className="col-sm-3 text-center">
                    <label style={{width: '100%'}}>
                      <input type="radio" name="creditCardType"
                        checked={this.state.creditCardType === 'VISA'}
                        onClick={() => this.changeCreditCardType('VISA')}
                      />
                       <div style={this.paymentTypeStyle}>
                         Visa
                       </div>
                    </label>
                  </div>
                  <div className="col-sm-3 text-center">
                    <label style={{width: '100%'}}>
                      <input type="radio" name="creditCardType"
                        checked={this.state.creditCardType === 'MASTER'}
                        onClick={() => this.changeCreditCardType('MASTER')}
                      />
                       <div style={this.paymentTypeStyle}>
                         Master
                       </div>
                    </label>
                  </div>
                    <div className="col-sm-3 text-center">
                    <label style={{width: '100%'}}>
                      <input type="radio" name="creditCardType"
                        checked={this.state.creditCardType === 'AMAX'}
                        onClick={() => this.changeCreditCardType('AMAX')}
                      />
                       <div style={this.paymentTypeStyle}>
                         AMAX
                       </div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-sm-12">
                <div class="input-group mb-3 center-block">
                    <div class="input-group-prepend">
                      <span class="input-group-text" >หมายเลขบัตร #</span>
                    </div>
                    <input type="text" class="form-control" onChange={this.setCreditCardNumber} value={this.state.creditCardNumber} placeholder="Eg. xxxx-xxxx-xxxx-1234" />
                  </div>
              </div>
            </div> :''}
            <div className="row mt-4">
              <div className="col-sm-6 text-center">
                <button onClick={() => this.props.onClose()} className="btn btn-secondary">ปิด</button>
              </div>
              <div className="col-sm-6 text-center">
                {
                  this.state.totalAmount >= this.state.payable
                  || (this.state.paymentType === 'card' && this.state.creditCardType !== '' && this.state.creditCardNumber !== '')
                  || (this.state.paymentType === 'room' && this.state.roomNumber !== '')
                  || (this.state.paymentType === 'transfer' && this.state.roomNumber !== '')
                  || (this.state.paymentType === 'multiple' && this.getRemainBalance() === 0)
                  ?
                <button onClick={() => this.paymentSubmit()} className="btn btn-success">ยืนยัน</button>
              : <button className="btn btn-success" disabled>ยืนยัน</button>}
              </div>
            </div>
          </div>
        </div>
      </div>

    )
  }
  paymentTypeStyle = {
    fontSize: '20px',
    height: '45px',
    background: 'white',
    textAlign: 'center',
    border: '1px solid black'
  }

}

const AmountButton = (props) => {
  const amountButtonStyle = {
    fontSize: '30px',
    width: '100%',
    height: '45px',
    background: 'white',
    textAlign: 'center',
    border: `1px solid ${props.paymentType === 'cash' ? 'black' : 'grey'}`,
    color: props.paymentType === 'cash' ? 'black' : 'grey'
  }
  return(
    <div onClick={() => props.addAmount()} className="col-sm-4 amountButtonStyle" style={amountButtonStyle} disabled>
        {props.amount}
    </div>
  )
}


class GWallet extends React.Component {
  constructor(props){
    super(props)
    this.state ={
      amount: 0,
      paymentType: 'cash',
      reference: '',
      showAddPayment: false
    }
  }

  calculateAmounts = () => {

  }

  onAmountChange = (e) => {
    let {name, value} = e.target
      this.setState(() => ({
        [name] : value
      }), () => {
        this.calculateAmounts()
      })
  }

  remainPaymentTypeOnChange = e => {
    let value = e.target.value
    this.setState(() => ({
      paymentType: value
    }))
  }

  openShowAddPayment = () => {
    this.setState(() => ({
      showAddPayment: true
    }))
  }
  closeShowAddPayment = () => {
    this.setState(() => ({
      showAddPayment: false,
      amount: 0,
      paymentType: 'cash',
      reference: ''
    }))
  }

  addablePayment = () => {
    const {paymentType, amount, reference} = this.state
    if(isNaN(amount) || parseFloat(amount) <= 0 || amount.trim() === '' ){
      return true
    }
    if(paymentType !== 'cash' && reference.trim() === ''){
      return true
    }
    let remain = this.getRemainBalance()

    if(remain < parseFloat(amount)){
      return true
    }

    return false
  }

  addPayment = () => {
    let paymentList = this.props.paymentList
    paymentList = [ ...paymentList, {paymentType: this.state.paymentType, amount: this.state.amount, reference: this.state.reference}]
    this.props.updatePaymentList(paymentList)
    this.setState(() => ({
      showAddPayment: false,
      amount: 0,
      paymentType: 'cash',
      reference: ''

    }))
  }

  getRemainBalance = () => {
    const { paymentList, total} = this.props
    const sum = paymentList.reduce((totalAmount, payment) => {
      return totalAmount += parseFloat(payment.amount)
    }, 0)
    return total - sum
  }

  removePayment = (index) => {
    let paymentList = this.props.paymentList
    paymentList.splice(index, 1)
    this.props.updatePaymentList(paymentList)
  }

  render(){
    return(
      <div className="row justify-content-center">
        <div className="col-12">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ประเภท</th>
              <th>Reference</th>
              <th>ยอดชำระ</th>
            <th></th>
              </tr>
            </thead>
            <tbody>
              {this.props.paymentList.map((x, i) =>
                <tr>
                  <td>{x.paymentType}</td>
              <td>{x.reference}</td>
            <td>{x.amount}</td>
          <td><button onClick={() => this.removePayment(i)} className="btn btn-danger">ลบ</button></td>
                </tr>
              )}
              <tr>
                <th colSpan='3' style={{textAlign: 'right'}}>ยอดคงเหลือชำระ</th>
              <td colSpan='1'>{this.getRemainBalance().toFixed(2)}.-</td>
              </tr>
            </tbody>
          </table>
        </div>
        { (!this.state.showAddPayment && this.getRemainBalance() > 0) && <div className="col-12 text-center">
          <button onClick={this.openShowAddPayment} className="btn btn-info">+ เพิ่มการจ่าย</button>
        </div>
      }


        { this.state.showAddPayment &&  <div className="col-12">
          <div className="row">
            <div className="col-4">
              <label className="label-control">ประเภทการจ่าย</label>
              <select onChange={this.remainPaymentTypeOnChange} className="form-control">
                <option value='cash'>เงินสด</option>
                <option value='transfer'>โอนเงิน</option>
              <option value='creditCard'>บัตร</option>
            <option value='halfHalf'>คนละครึ่ง</option>
          <option value='G-Wallet'>G-Wallet</option>
        <option value='ThaiChana'>ไทยชนะ</option>
            </select>
            </div>
            <div className="col-4">
              <label className="label-control">จำนวนเงิน</label>
            <input onChange={this.onAmountChange} value={this.state.amount} name="amount" type="text" className="form-control" />
            </div>
            <div className="col-4">
              <label className="label-control">Reference </label>
            <input onChange={this.onAmountChange} value={this.state.reference} name="reference" type="text" disabled={this.state.paymentType === 'cash'} className="form-control" />
            </div>
          </div>
          <div className="row">
            <div className="col-6 mt-2 text-center">
              <button onClick={this.closeShowAddPayment} className="btn btn-danger">
                ปิด
              </button>
            </div>
              <div className="col-6 mt-2 text-center">
                <button onClick={this.addPayment} disabled={this.addablePayment()} className="btn btn-success">
                  เพิ่ม
                </button>
              </div>
          </div>
        </div>}
      </div>
    )
  }
}

class ChangeTable extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      selectedTable: '',
      selectedTableId: null,
      selectedOrderList: [],
      confirmSection: false,
      remainOrders:[],
      tables: this.props.tables.filter(table => (table.number !== this.props.tableNumber)).filter( table => (table.outlet !== 'staff')),
      newTableShow: false,
      newTable: '',
      check: false
    }
    console.log(props.orders);
  }
  paymentTypeStyle = {
    fontSize: '20px',
    height: '45px',
    background: 'white',
    textAlign: 'center',
    border: '1px solid black',
    borderRadius: '5px'
  }
  tableOnClick = (number, id) => {
    if(id){
      this.setState({
      selectedTable: number,
      selectedTableId: id
    })
  }else{
      this.registerTable(number);
    }
  }
  addToList = (id, name, quantity) => {
    const current = this.state.selectedOrderList;
    current.push({id, name, quantity: parseInt(quantity)});
    this.setState({
      selectedOrderList: current
    })
  }
  updateToList = (id, quantity) => {
    const current = this.state.selectedOrderList.map(order => {
      if(order.id === id){
        order.quantity = parseInt(quantity)
      }
      return order;
    })
    this.setState({
      selectedOrderList: current
    })
  }
  removeFromList = (id) => {
    const current = this.state.selectedOrderList.filter(order => (order.id !== id));
    this.setState({
      selectedOrderList: current
    })
  }
  nextButtonClickAll = () => {
    this.setState({
      selectedOrderList: this.props.orders
    }, () => {
      this.nextButtonClick();
    });
  }
  nextButtonClick = () => {
    var remainOrders = [];
    this.props.orders.forEach(order => {
      var remainOrder = 1;
      this.state.selectedOrderList.forEach((selectedOrder) => {
        if(order.id === selectedOrder.id){
          const remainQuantity = order.quantity - selectedOrder.quantity;
          if(remainQuantity !== 0){
            //Found Remain
            remainOrder = {name: order.name, quantity: remainQuantity}
          }else {
            //Found Not Remain
            remainOrder = 0
          }
        }
      })
      if(remainOrder === 1){
        remainOrders.push(order)
      }else if(remainOrder !== 0){
        remainOrders.push(remainOrder)
      }
    })

    this.setState({
      confirmSection: true,
      remainOrders
    })
  }
  backbutton = () => {
    this.setState({
      check: false,
      confirmSection: false,
      selectedOrderList: []
    })
  }
  confirmTransfer = () => {
    const newTableNumber = this.state.selectedTable;
    const transferOrders = this.state.selectedOrderList;
    const transferType = this.state.remainOrders.length === 0 ? 'full' : 'partial';
    const newTable = this.state.newTable;
    this.props.submitTransfer(newTableNumber, transferOrders, transferType, newTable);
  }
  registerTable = (number) => {
    this.setState({
      newTableShow: !this.state.newTableShow,
      selectedTable: number || ''
    })
  }
  submitRegisterTable = ({zone, number_of_guest, language, tableNumber}) => {
    console.log('Submit Rgsindsre', {zone, number_of_guest, language, tableNumber});
    this.setState({
    newTableShow : false,
    selectedTable: tableNumber,
    newTable : {
      zone,
      tableNumber,
      number_of_guest,
      language
    }
  })
  }
  render(){
    return(
      <div className="editNewMenuItemFill">
        { this.state.confirmSection &&
          <ChangeTableConfirm
            tableNumber={this.props.tableNumber}
            remainOrders={this.state.remainOrders}
            selectedTable={this.state.selectedTable}
            selectedOrderList={this.state.selectedOrderList}
            backButton={this.backbutton}
            confirmTransfer={this.confirmTransfer}
           />
        }
        { this.state.newTableShow &&
          <RegisterTablePopup
          togglePopup={this.registerTable}
          submitCreateTable={this.submitRegisterTable}
          tableNumber={this.state.selectedTable}
        />}
        <div className="paymentContent">
          <div className="container">
            <div className="row mt-3">
              <div className="col-sm-12 text-center">
                <h3>ย้ายโต๊ะ</h3>
              </div>
            </div>
                <div className="row mt-4" >
                  <div className="col-sm-11 mx-auto" style={{border: '1px solid black', padding: '10px'}}>
                    <table width="100%">
                      <thead>
                        <tr>
                          <th style={{textAlign: 'center'}} width="10%">
                            ย้าย
                          </th>
                          <th width="10%">จำนวน</th>
                          <th width="80%">รายการ</th>
                        </tr>
                      </thead>
                    </table>
                    <div style={{
                      margin: '5px 0',
                      width: '100%',
                      height: '330px',
                      overflow: 'scroll'
                    }}>
                      <table width="100%">
                        <tbody>
                          {this.props.orders.map((order, index) => (

                            <OrderLineForTransfer
                              quantity={order.quantity}
                              name={order.name}
                              id={order.id}
                              updateToList={this.updateToList}
                              addToList={this.addToList}
                              removeFromList={this.removeFromList}
                              check={this.state.check}
                              key={index}
                             />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-sm-12 text-center">
                    <h3>เลือกโต๊ะ: {this.state.selectedTable}</h3>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-12 text-center">
                    <div className="container-fluid" style={{
                      margin: '5px 0',
                      width: '100%',
                      height: '70px',
                      overflow: 'scroll'
                    }}>
                      <div className="row flex-row flex-nowrap">
                        {
                          this.state.tables.map((table, index) => (
                            <div className="col-3">

                              <div style={{
                                background:
                                  table.status === 'opened'
                                    ? '#5291ff'
                                    : table.status === 'checked' ? '#C82333' : '#C6E0F2',
                                 height: '40px'
                               }}
                                onClick={() => this.tableOnClick(table.number, table.id)}
                                >
                                <h3>
                                  {table.number}
                                </h3>
                              </div>
                            </div>
                          ))
                        }
                        </div>
                      </div>
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col-sm-4 text-center">
                    <button onClick={() => this.props.onClose()} className="btn btn-secondary">
                      ปิด
                    </button>
                  </div>
                  <div className="col-sm-4 text-center">
                    {
                      this.state.selectedTable !== '' &&
                      this.state.selectedOrderList.length !== 0 ?
                      <button onClick={() => this.nextButtonClick()} className="btn btn-success">
                        ถัดไป
                      </button>
                      :
                      <button className="btn btn-success" disabled>
                        ถัดไป
                      </button>
                    }
                  </div>
                  <div className="col-sm-4 text-center">
                    {
                      this.state.selectedTable !== '' ?
                      <button onClick={() => this.nextButtonClickAll()} className="btn btn-success">
                        ย้ายทุกรายการ
                      </button>
                      :
                      <button className="btn btn-success" disabled>
                        ย้ายทุกรายการ
                      </button>
                    }
                  </div>
                </div>
          </div>
        </div>
      </div>
    )
  }
}

class OrderLineForTransfer extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      quantity: props.quantity,
      checked: props.check
    }
  }
  onQuantityChange = (e) => {
    const input = e.target.value;
    var isMatch = parseInt(input) <= this.props.quantity && parseInt(input) > 0 ? true : false;
    if(!input || isMatch){
      this.setState({
        quantity: input
      })
      if(input){
        this.props.updateToList(e.target.name, input)
      }else{
        this.props.removeFromList(e.target.name)
      }
    }
  }
  onChecked = (id, name, quantity) => {
    if(!this.state.checked){
      this.setState({
        checked: !this.state.checked
      })
      this.props.addToList(id, name, quantity);
    }else{
      this.setState({
        checked: !this.state.checked
      })
      this.props.removeFromList(id)
    }
  }
  onQuantityOutFocus = (e) => {
    const input = e.target.value
    if(!input){
      this.setState({
        quantity: this.props.quantity
      })
      this.onChecked(e.target.name);
    }
  }
  render(){
    return(
      <tr>
        <td style={{textAlign: 'center'}} width="10%">
          <input type="checkbox" onClick={() => this.onChecked(this.props.id, this.props.name , this.state.quantity)} checked={this.state.checked}/>
        </td>
        <td width="10%"><input name={this.props.id} onBlur={this.onQuantityOutFocus} onChange={this.onQuantityChange} value={this.state.quantity}
          style={{width: '80%', background: this.state.checked ? 'white': '#e3e3e3'}} type="text" disabled={!this.state.checked}/></td>
        <td width="80%">{this.props.name}</td>
      </tr>
    )
  }

}

const ChangeTableConfirm = (props) => {
  return(
    <div className="editNewMenuItemFill">
      <div className="paymentContent">
        <div className="container">
          <div className="row mt-3">
            <div className="col-sm-12 text-center">
              <h3>ย้ายโต๊ะ</h3>
            </div>
          </div>
          <div>
            <div className="row mt-1">
              <div className="col-sm-12">
                <h4>
                  จากโต๊ะ: {props.tableNumber}
                </h4>
              </div>
            </div>
            <div className="row" >
              <div className="col-sm-11 mx-auto" style={{border: '1px solid black', padding: '10px'}}>
                <table width="100%">
                  <thead>
                    <tr>
                      <th width="20%">จำนวน</th>
                      <th width="80%">รายการคงเหลือ</th>
                    </tr>
                  </thead>
                </table>
                <div style={{
                  margin: '5px 0',
                  width: '100%',
                  height: '140px',
                  overflow: 'scroll'
                }}>
                  <table width="100%">
                    <tbody>
                      {
                        props.remainOrders.map(order => (
                          <tr>
                            <td width="20%">{order.quantity}</td>
                            <td width="80%">{order.name}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12 text-center">
                <span style={{fontSize: '50px'}}>
                  <FontAwesomeIcon size="20" icon={faArrowDown} />
                </span>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-5">
                <h4 className="">
                  ย้ายไปโต๊ะ: {props.selectedTable}
                </h4>
              </div>
            </div>
            <div className="row" >
              <div className="col-sm-11 mx-auto" style={{border: '1px solid black', padding: '10px'}}>
                <table width="100%">
                  <thead>
                    <tr>
                      <th width="20%">จำนวน</th>
                      <th width="80%">รายการที่ย้าย</th>
                    </tr>
                  </thead>
                </table>
                <div style={{
                  margin: '5px 0',
                  width: '100%',
                  height: '140px',
                  overflow: 'scroll'
                }}>
                  <table width="100%">
                    <tbody>
                      {
                        props.selectedOrderList.map(order => (
                          <tr>
                            <td width="20%">{order.quantity}</td>
                            <td width="80%">{order.name}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-sm-6 text-center">
                <button onClick={() => props.backButton()} className="btn btn-secondary">
                  ย้อนกลับ
                </button>
              </div>
              <div className="col-sm-6 text-center">
                  <button onClick={() => props.confirmTransfer()} className="btn btn-success">
                    ยืนยัน
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
