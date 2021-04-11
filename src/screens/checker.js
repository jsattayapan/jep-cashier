import React from 'react';
import {HeaderBar} from './../components/HeaderBar';
import moment from 'moment';
import { getDailyTotalItem } from '../brains/foodItems';
import {connect} from 'react-redux';
import {submitCompleteStatus, redoCompleteStatus} from '../brains/foodItems'
import {loadCookingFoodItems, loadCompleteFoodItems} from './../Redux/actions/foodItems';

class Checker extends React.Component {
  constructor(props){
    super(props);
    console.log(this.props.foodItems.cookingFoodItems);
    this.state = {
      date: moment().format('DD/MM/YYYY'),
      items: {
        food: [],
        beverage: []
      }
    }
  }

  confirm = (id, quantity) => {
    submitCompleteStatus({
      item_order_id: id,
      status: 'complete',
      create_by: this.props.user.id,
      quantity: quantity
    });
    var newCookingList = this.props.foodItems.cookingFoodItems.filter(o => o.id !== id);
    this.props.dispatch(loadCookingFoodItems(newCookingList));
  }

  redo = (id) => {
    redoCompleteStatus({
      item_order_id: id,
    });
    var newCompleteList = this.props.foodItems.completeFoodItems.filter(o => o.id !== id);
    this.props.dispatch(loadCompleteFoodItems(newCompleteList));
  }

  render(){
    return(
      <div className="container">
      <HeaderBar
        buttonFunction={() => {
          this.props.history.push('/tables');
        }}
        buttonLabel="กลับหน้าโต๊ะ"
        name={this.props.user.name}
      />
      <div className="row mt-3">
        <div className="col-sm-6" >
          <h4>รายการกำลังปรุง</h4>
          <br />
          {this.props.foodItems.cookingFoodItems.map(item => (
            <ItemBox
              id={item.id}
              table_number={item.table_number}
              item_name={item.name}
              quantity={item.quantity}
              user_name={item.short_name}
              timestamp={moment(item.timestamp).format('HH:mm')}
              confirm={this.confirm}
              type="confirm"
            />
          ))}
        </div>

        <div className="col-sm-6" >
          <h4>รายการปรุงเสร็จแล้ว</h4>
          <br />
          {this.props.foodItems.completeFoodItems.map(item => (
            <ItemBox
              id={item.id}
              table_number={item.table_number}
              item_name={item.name}
              quantity={item.quantity}
              user_name={item.short_name}
              timestamp={moment(item.timestamp).format('HH:mm')}
              redo={this.redo}
              type="redo"
            />
          ))}
        </div>
      </div>

      </div>
    )
  }
}

const mapStateToprops = state => {
  return {
    user: state.user,
    foodItems: state.foodItems
  };
};

const ItemBox = (props) => {
  return(
    <div className="row pt-3 my-3 mx-1" style={{border: '2px solid black'}}>
      <div className="col-sm-2 text-center">
        <h5>โต๊ะ: {props.table_number}</h5>
      </div>
      <div className="col-sm-4">
        <h5>{props.item_name}</h5>
      </div>
      <div className="col-sm-2 text-center ">
        <h5>จำนวน: {props.quantity}</h5>
      </div>
      <div className="col-sm-2">
        <p>โดย: {props.user_name}</p>
        <p>{props.timestamp}</p>
      </div>
      <div className="col-sm-2 text-right">
        {props.type === 'confirm' ?
        <button className="btn btn-success" onClick={() => props.confirm(props.id, props.quantity)}>ปรุงเสร็จ</button>
        :
        <button className="btn btn-danger" onClick={() => props.redo(props.id)}>กำลังปรุง</button>
    }
      </div>
    </div>
  )
}

export default connect(mapStateToprops)(Checker);
