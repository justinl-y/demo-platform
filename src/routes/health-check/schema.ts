// import getHealthDBSchema from './getHealthDB/schema.ts';
import getHealthEBSchema from './getHealthEB/schema.ts';

const reqSchema = {
  getHealthEB: getHealthEBSchema,
  // getHealthDB: getHealthDBSchema,
};

export default reqSchema;
