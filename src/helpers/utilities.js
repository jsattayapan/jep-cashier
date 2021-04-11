import React from 'react';

function TopBuffer(props){
  return(
    <div style={{marginTop: '30px'}}>
    </div>
  )
}

export function formatNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export {TopBuffer};
