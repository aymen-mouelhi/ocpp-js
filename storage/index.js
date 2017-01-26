class Storage {
  constructor(method) {
    try{
        this.method = require('./' + method);
    }catch(error){
      this.method = null;
    }
  }

  save(collection, data){
    if(this.method){
      this.method.store(collection, data);
    }else{
      console.log(this.method + ' is not implemented !');
    }
  }
}

module.exports = Storage;
