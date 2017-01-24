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
      this.method.save(collection, data);
    }else{
      console.log(this.method + ' is not implemented !');
    }
  }

  findAll(collection){
    if(this.method){
      this.method.store(collection, data);
    }else{
      console.log(this.method + ' is not implemented !');
    }
  }

  findById(collection, id){
    if(this.method){
      this.method.store(collection, data);
    }else{
      console.log(this.method + ' is not implemented !');
    }
  }
}

module.exports = Storage;
