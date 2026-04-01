CREATE ROLE srv_api_demo WITH LOGIN ENCRYPTED PASSWORD 'test';

GRANT pg_read_all_data TO srv_api_demo;
GRANT pg_write_all_data TO srv_api_demo;
