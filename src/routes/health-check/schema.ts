// import getHealthDBSchema from './getHealthDB/schema.js';
import getHealthEBSchema from './getHealthEB/schema.js';

const reqSchema = {
  getHealthEB: getHealthEBSchema,
  // getHealthDB: getHealthDBSchema,
};

export default reqSchema;
