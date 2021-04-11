import React from 'react';

export class TextInput extends React.Component{
  render(){
    return(
      <div className="row justify-content-center">
        <div className="input-group mb-3">
          <div className="input-group-prepend">
            <span className="input-group-text" id="inputGroup-sizing-default">{this.props.label}: </span>
          </div>
          <input
          value={this.props.value}
          onChange={this.props.onChange}
          type={this.props.type}
          className="form-control"
           />
        </div>
      </div>
    )
  }
}
