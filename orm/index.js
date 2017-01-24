class Storage {
  constructor(method) {
    try{
        this.method = require('./' + method);
    }catch(error){
      console.log('error while setting method ' + error);
      this.method = null;
    }
  }

  saveOne(collection, id, data){
    if(this.method){
      this.method.saveOne(collection, id, data);
    }else{
      console.log(this.method + ' is not implemented !');
    }
  }

  saveBatch(collection, data){
    if(this.method){
      this.method.saveBatch(collection, data);
    }else{
      console.log(this.method + ' is not implemented !');
    }
  }

  findAll(collection){
    if(this.method){
      this.method.findAll(collection, data);
    }else{
      console.log(this.method + ' is not implemented !');
    }
  }

  findById(collection, id){
    if(this.method){
      this.method.findById(collection, data);
    }else{
      console.log(this.method + ' is not implemented !');
    }
  }
}

module.exports = Storage;
