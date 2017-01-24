const Promise = require('promise');

let instance = null;

class Storage {
  constructor(method) {
    try{
        method = method || 'firebase';
        const Method = require('./' + method);
        this.storage = new Method();
    }catch(error){
      console.log('error while setting method ' + error);
      this.storage = null;
    }
  }

  saveOne(collection, id, data){
    return new Promise(function(resolve, reject) {
      if(this.storage){
        this.storage.saveOne(collection, id, data);
      }else{
        console.log(this.storage + ' is not implemented !');
      }
    });
  }

  saveBatch(collection, data){
    return new Promise(function(resolve, reject) {
      if(this.storage){
        this.storage.saveBatch(collection, data);
      }else{
        console.log(this.storage + ' is not implemented !');
      }
    });
  }

  findAll(collection){
    return new Promise(function(resolve, reject) {
      if(this.storage){
        this.storage.findAll(collection);
      }else{
        console.log(this.storage + ' is not implemented !');
      }
    });
  }

  findById(collection, id){
    return new Promise(function(resolve, reject) {
      if(this.storage){
        this.storage.findById(collection, id);
      }else{
        console.log(this.storage + ' is not implemented !');
      }
    });
  }
}

module.exports = Storage;
