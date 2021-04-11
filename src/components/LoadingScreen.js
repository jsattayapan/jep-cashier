import React from 'react';
import LoadingLogo from '../assets/icons/loading.gif';

const LoadingScreen = (props) => {
  return (
    <div className="editNewMenuItemFill">
      <img className="loadingIcon" alt="Loading" src={LoadingLogo} />
    </div>
  )
}

export default LoadingScreen
