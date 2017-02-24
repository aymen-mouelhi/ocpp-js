const Promise = require('promise');
const fs = require('fs');
const config = require('config');
let instance = null;

class Storage {
  constructor(method) {
    try{
        this.method = method || config.get('defaultDB') || 'mongodb';
        const Method = require('./' + this.method);
        this.storage = new Method();
    }catch(error){
      console.log('error while setting method ' + error);
      this.storage = null;
    }
  }

  getMethods(){
    return this.methods;
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

  save(collection, data, callback){
    var self = this;
    return new Promise(function(resolve, reject) {
      if(self.storage){
        self.storage.save(collection, data, function(err){
          callback(err);
        });
      }else{
        console.log(self.method + ' is not implemented !');
      }
    });
  }

  findAll(collection, callback){
    var self = this;
    return new Promise(function(resolve, reject) {
      if(self.storage){
        self.storage.findAll(collection, callback);
      }else{
        console.log(self.method + ' is not implemented !');
      }
    });
  }

  findById(collection, id, callback){
    var self = this;
    return new Promise(function(resolve, reject) {
      if(self.storage){
        self.storage.findById(collection, id, callback);
      }else{
        console.log(self.method + ' is not implemented !');
      }
    });
  }
}

module.exports = Storage;
