const fs = require("node:fs");
const path = require("node:path");
const Sequelize = require("sequelize");
const process = require("node:process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "../config/config.js"));
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

// Dynamically load all models from the current directory
for (const file of fs.readdirSync(__dirname)) {
  // Filter files to include only JavaScript models (excluding this index file and test files)
  const isJsFile = file.slice(-3) === ".js";
  const isNotThisFile = file !== basename;
  const isNotHidden = file.indexOf(".") !== 0;
  const isNotTest = file.indexOf(".test.js") === -1;

  if (isJsFile && isNotThisFile && isNotHidden && isNotTest) {
    // Require the model definition function
    const modelDefinition = require(path.join(__dirname, file));
    // Initialize the model by calling the function
    const model = modelDefinition(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  }
}

// Associate models if an 'associate' method is defined
for (const modelName of Object.keys(db)) {
  if (db[modelName].associate) {
    db[modelName].associate();
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
