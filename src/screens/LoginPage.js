import React from 'react';
import { connect } from 'react-redux';
import LoginForm from './LoginForm';
import { setUser } from './../Redux/actions/user';
import { setCurrentShift } from './../Redux/actions/tables';
import { getCurrentShift } from './../brains/tables';

const LoginPage = (props) => (
  <LoginForm onSubmit={(userInfo) => {
    props.dispatch(setUser(userInfo));
    getCurrentShift((status) => {
      console.log(status);
      props.dispatch(setCurrentShift(status));
      console.log(props.tables.currentShift);
      props.history.push('/tables');
    });
  }} />
);

const mapStateToprops = (state) => {
  return {
    user: state.user,
    tables: state.tables
  }
}

export default connect(mapStateToprops)(LoginPage);
