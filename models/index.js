'use strict';

//fs is a physical files system that allows us acces to files within a node app
var fs        = require('fs');
//provides utilities when working with file/directory paths 
var path      = require('path');
//is an orm that lets us make database queries to mysql (or other databases if selected)
var Sequelize = require('sequelize');
//.basename returns only the last portion of a path - in this case to get us the name of the file 
var basename  = path.basename(module.filename);
//Node checks what environment the app is in, if it cant identify it will default to development
var env       = process.env.NODE_ENV || 'development';
//calls the config.json file from the config folder
var config    = require(__dirname + '/../config/config.json')[env];
//creates an empty object to populate with all of the existing objects inside individual files within model folder
var db        = {};


//checks to see if there is viable env variable/ connection
if (config.use_env_variable) {
  // if there is then it uses thos connection 
  var sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  //if not then it will manually create this connection 
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
//reads the content of given directory as an array
  .readdirSync(__dirname)
  //will be used to set a condition in which to filter the conents of the directory -> choose what to respond
  .filter(function(file) {
    //makes sure there are files to read, does not include the index file, and they are js files
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  //keys in the the model file into the the db object
  .forEach(function(file) {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });
//this lets us associate each model files function with the db object 
Object.keys(db).forEach(function(modelName) {
  //if there is a function that can associate then proceed
  if (db[modelName].associate) {
    // associate that function with the db object
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
// we will use db to refer to each model file
module.exports = db;
