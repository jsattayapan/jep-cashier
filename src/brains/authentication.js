

export const isAuth = (id, callback) => {
    if(id === ""){
        callback(false);
      }else{
        callback(true);
      }
};
