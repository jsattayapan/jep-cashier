export const axios = require('axios');


export const setJwtToken = (token) => {
  axios.defaults.headers = {
    AUTHENTICATION: token
  }
}
