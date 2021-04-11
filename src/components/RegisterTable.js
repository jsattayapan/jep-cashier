import React from 'react';
import {
  LanguageToggleButton,
  ZoneToggleButton
} from './toggleButton';
import {TopBuffer} from '../helpers/utilities';

class RegisterTablePopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableNumber: props.tableNumber,
      zone: '',
      number_of_guest: 1,
      language: '',
      error: false
    };
  }
  setZone = zone => {
    this.setState({zone});
  };

  setLanguage = language => {
    this.setState({language});
  };
  increaseGuest = () => {
    const current = this.state.number_of_guest;
    this.setState({
      number_of_guest: current + 1
    });
  };
  decreaseGuest = () => {
    const current = this.state.number_of_guest;
    if (current > 1) {
      this.setState({
        number_of_guest: current - 1
      });
    }
  };
  popupScreenHandler = e => {
    if (e.target.className === 'registerTablePopup') {
      this.props.togglePopup();
    }
  };
  handleSubmit = () => {
    if (!this.state.zone || !this.state.language) {
      this.setState({error: true});
    } else {
      this.props.submitCreateTable(this.state);
    }
  };
  render() {
    return (
      <div className="registerTablePopup" onClick={this.popupScreenHandler}>
        <div className="registerTablePopupContent">
          <div className="container">
            <div className="row ">
              <h4 style={{margin: '10px'}}>โต๊ะ: {this.props.tableNumber}</h4>
              {this.state.error && (
                <span style={{margin: '10px', color: 'red', paddingTop: '5px'}}>
                  กรุณาเลือก Zone และ ภาษา
                </span>
              )}
            </div>

            <div className="row ">
              <h4 style={{margin: '10px'}}>Zone:</h4>
            </div>
            <div className="row">
              <ZoneToggleButton
                selected={this.state.zone === 'A1'}
                label="A1"
                setZone={this.setZone}
              />
              <ZoneToggleButton
                selected={this.state.zone === 'B1'}
                label="B1"
                setZone={this.setZone}
              />
              <ZoneToggleButton
                selected={this.state.zone === 'B2'}
                label="B2"
                setZone={this.setZone}
              />
              <ZoneToggleButton
                selected={this.state.zone === 'B3'}
                label="B3"
                setZone={this.setZone}
              />
              <ZoneToggleButton
                selected={this.state.zone === 'B4'}
                label="B4"
                setZone={this.setZone}
              />
              <ZoneToggleButton
                selected={this.state.zone === 'B5'}
                label="B5"
                setZone={this.setZone}
              />
              <ZoneToggleButton
                selected={this.state.zone === 'B6'}
                label="B6"
                setZone={this.setZone}
              />
              <ZoneToggleButton
                selected={this.state.zone === 'B7'}
                label="B7"
                setZone={this.setZone}
              />
            </div>
            <div className="row">
              <h4 style={{margin: '10px'}}>
                จำนวนลูกค้า:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span>
                  <button
                    className="btn btn-success"
                    onClick={() => this.decreaseGuest()}
                  >
                    -
                  </button>
                </span>
                &nbsp; {this.state.number_of_guest} &nbsp;
                <span>
                  <button
                    className="btn btn-success"
                    onClick={() => this.increaseGuest()}
                  >
                    +
                  </button>
                </span>
              </h4>
            </div>
            <div className="row">
              <h4 style={{margin: '10px'}}>ภาษา:</h4>
            </div>
            <div className="row">
              <LanguageToggleButton
                selected={this.state.language === 'ไทย'}
                label="ไทย"
                setLanguage={this.setLanguage}
              />
              <LanguageToggleButton
                selected={this.state.language === 'อังกฤษ'}
                label="อังกฤษ"
                setLanguage={this.setLanguage}
              />
            </div>
            <TopBuffer />
            <div className="row">
              <div className="col-sm-6 text-center">
                <button
                  className="btn btn-danger"
                  onClick={() => this.props.togglePopup()}
                >
                  ยกเลิก
                </button>
              </div>
              <div className="col-sm-6 text-center">
                <button className="btn btn-success" onClick={this.handleSubmit}>
                  เปิดโต๊ะ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default RegisterTablePopup;
