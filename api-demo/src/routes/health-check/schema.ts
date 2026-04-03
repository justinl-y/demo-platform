import getHealthDBSchema from './get-health-db/schema.ts';
import getHealthEBSchema from './get-health-eb/schema.ts';

const schema = {
  getHealthEB: getHealthEBSchema,
  getHealthDB: getHealthDBSchema,
};

export default schema;
