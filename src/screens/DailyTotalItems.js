import React from 'react';
import {HeaderBar} from './../components/HeaderBar';
import moment from 'moment';
import { getDailyTotalItem } from '../brains/foodItems';
import {connect} from 'react-redux';

class DailyTotalItems extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      date: moment().format('DD/MM/YYYY'),
      items: {
        food: [],
        beverage: []
      },
        sortBy: 'code'
    }
  }

  submitSearch(){
    console.log('click submit');
    getDailyTotalItem({date: this.state.date}, (status, data) => {
      if(status){
        this.setState({
          items: {
            food: data.filter(item => item.category_name !== 'เครื่องดื่ม').sort((a,b) => a.quantity < b.quantity),
            beverage: data.filter(item => item.category_name === 'เครื่องดื่ม').sort((a,b) => a.quantity < b.quantity)
          }
        })
        console.log(this.state.items);
      }else{

      }
    })
  }

  dateOnChange = (e) => {
    this.setState({
      date: e.target.value
    })
  }
  
  sortBy = (e) => {
      if(e.target.value === 'code'){
         this.setState({
          items: {
            food: this.state.items.food.sort((a,b) => a.quantity < b.quantity),
            beverage: this.state.items.beverage.sort((a,b) => a.quantity < b.quantity),
          }
        }) 
      }else{
          this.setState({
          items: {
            food: this.state.items.food.sort((a,b) => a.item_code > b.item_code),
            beverage: this.state.items.beverage.sort((a,b) => a.item_code > b.item_code),
          }
        }) 
      }
      
    this.setState({
      sortBy: e.target.value
    })
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
          <div className="col-sm-4">
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon1">วันที่</span>
              </div>
              <input type="text" className="form-control" onChange={this.dateOnChange} value={this.state.date} placeholder={moment().format('DD/MM/YYYY')} />
            </div>
          </div>
          <div className="col-sm-4">
            <button className="btn btn-info" onClick={() => this.submitSearch()}>ค้นหา</button>
          </div>
          <div className="col-sm-4">
            <select onChange={this.sortBy}>
              <option value="code">เรียงจากจำนวน</option>
              <option value="qty">เรียงจากรหัส</option>
            </select>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-sm-6 text-center">
            <h4>เครื่องดื่ม</h4>
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>รหัส</th>
                  <th>รายการ</th>
                  <th>จำนวน</th>
                </tr>
              </thead>
        {this.state.items.beverage.length !== 0 || this.state.items.beverage.length !== undefined ?
          <tbody>
            {this.state.items.beverage.map(item => (
              <tr>
                <td>{item.item_code}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
          :
          <tbody>
              <tr>
                <td colSpan='2'>ไม่มีข้อมูล</td>
              </tr>
          </tbody>
        }
        </table>
        </div>
        <div className="col-sm-6 text-center">
          <h4>อาหาร</h4>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>รายการ</th>
                <th>จำนวน</th>
              </tr>
            </thead>
      {this.state.items.food.length !== 0 || this.state.items.food.length !== undefined ?
        <tbody>
          {this.state.items.food.map(item => (
            <tr>
              <td>{item.item_code}</td>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
        :
        <tbody>
            <tr>
              <td>ไม่มีข้อมูล</td>
            </tr>
        </tbody>
      }
      </table>
      </div>
      </div>
      </div>
    )
  }
}

const mapStateToprops = state => {
  return {
    user: state.user
  };
};

export default connect(mapStateToprops)(DailyTotalItems);
