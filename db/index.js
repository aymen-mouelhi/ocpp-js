const Promise = require('promise');
const fs = require('fs');
let instance = null;


class Storage {
  constructor(method) {
    try{
        this.method = method || 'firebase';
        const Method = require('./' + this.method);
        this.storage = new Method();
        /*
        this.methods = fs.readdir(__dirname).then(function(files) {
          var arr = [];
          files.forEach(file => {
            if(file != 'index.js'){
                var Method = require('./' + file);
                arr.push({
                  title: file.replace('.js', ''),
                  instance: new Method()
                });
            }
          });

          return arr;
        });
        */

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
