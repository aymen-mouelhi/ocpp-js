const Promise = require('promise');
const Storage = require('./index.js');
const fs = require('fs');
const path = require('path');
var TMP_DIR = '../tmp';

let instance =  null;
class File {
  constructor() {
  }

  findAll(collection){
    var self = this;
    return new Promise(function(resolve, reject) {
      return self.firebase.database().ref('/' + collection).once('value').then(function(snapshot){
        var data = snapshot.val();
        resolve(data);
      }).catch(function(error){
        reject(error);
      });
    });
  }

  findById(collection, id){
    var self = this;
    return new Promise(function(resolve, reject) {
      self.firebase.database().ref('/' + collection + '/' + id).once('value').then(function(snapshot){
        var data = snapshot.val();
        resolve(data);
      }).catch(function(error){
        reject(error);
      });
    });
  }

  save(collection, data){
    var self = this;

    var file = path.join(__dirname, TMP_DIR, '/' + collection +'.json');
    return new Promise(function(resolve, reject) {
      fs.writeFileSync(file, JSON.stringify(data, null, 4));
      resolve();
    });
  }

  saveWithId(collection, id, data){
    var self = this;
    return new Promise(function(resolve, reject) {
      self.firebase.database().ref('/' + collection + '/' + id).set(data).then(function(){
        resolve({});
      });
    });
  }

}

module.exports = File;
