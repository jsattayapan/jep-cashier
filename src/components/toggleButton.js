import React from 'react';

export const ToggleButton = (props) => {
  const classStyle = props.selected ? 'btn btn-primary' : 'btn btn-outline-primary';
  return (
    <button onClick={() => props.setInput(props.label)} type="button" className={classStyle} style={{width: '100px', marginBottom: '10px'}}>{props.label}</button>
  );
}

export const ZoneToggleButton = (props) => {
  return(
    <div className="col-sm-3 text-center">
      <ToggleButton selected={props.selected} label={props.label} setInput={props.setZone}/>
    </div>
  )
}

export const LanguageToggleButton = (props) => {
  return(
    <div className="col-sm-6 text-center">
      <ToggleButton selected={props.selected} label={props.label} setInput={props.setLanguage}/>
    </div>
  )
}
