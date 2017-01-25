const Promise = require('promise');

let instance = null;

//TODO: try catch for saves

class Storage {
  constructor(method) {
    try{
        this.method = method || 'firebase';
        const Method = require('./' + this.method);
        this.storage = new Method();
    }catch(error){
      console.log('error while setting method ' + error);
      this.storage = null;
    }
  }

  saveWithId(collection, id, data){
    var self = this;
    return new Promise(function(resolve, reject) {
      if(self.storage){
        self.storage.saveWithId(collection, id, data);
      }else{
        console.log(self.method + ' is not implemented !');
      }
    });
  }

  save(collection, data){
    var self = this;
    return new Promise(function(resolve, reject) {
      if(self.storage){
        self.storage.save(collection, data);
      }else{
        console.log(self.method + ' is not implemented !');
      }
    });
  }

  findAll(collection){
    var self = this;
    return new Promise(function(resolve, reject) {
      if(self.storage){
        self.storage.findAll(collection);
      }else{
        console.log(self.method + ' is not implemented !');
      }
    });
  }

  findById(collection, id){
    var self = this;
    return new Promise(function(resolve, reject) {
      if(self.storage){
        self.storage.findById(collection, id);
      }else{
        console.log(self.method + ' is not implemented !');
      }
    });
  }
}

module.exports = Storage;
