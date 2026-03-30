CREATE DATABASE test;
CREATE ROLE postgres;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: audit; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA audit;


ALTER SCHEMA audit OWNER TO postgres;

--
-- Name: SCHEMA audit; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA audit IS 'Out-of-table audit/history logging tables and trigger functions';


--
-- Name: integrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA integrations;


ALTER SCHEMA integrations OWNER TO postgres;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: hstore; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS hstore WITH SCHEMA public;


--
-- Name: EXTENSION hstore; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION hstore IS 'data type for storing sets of (key, value) pairs';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: enum_flowrate_time_units; Type: TYPE; Schema: integrations; Owner: postgres
--

CREATE TYPE integrations.enum_flowrate_time_units AS ENUM (
    'DAY',
    'HOUR',
    'MINUTE',
    'SECOND'
);


ALTER TYPE integrations.enum_flowrate_time_units OWNER TO postgres;

--
-- Name: enum_flowrate_volume_units; Type: TYPE; Schema: integrations; Owner: postgres
--

CREATE TYPE integrations.enum_flowrate_volume_units AS ENUM (
    'ACRE_FEET',
    'ACRE_INCHES',
    'CUBIC_FEET',
    'CUBIC_METERS',
    'CUBIC_YARDS',
    'GALLONS',
    'LITERS',
    'MILLION_GALLONS'
);


ALTER TYPE integrations.enum_flowrate_volume_units OWNER TO postgres;

--
-- Name: enum_irrigation_errors; Type: TYPE; Schema: integrations; Owner: postgres
--

CREATE TYPE integrations.enum_irrigation_errors AS ENUM (
    'DEVICE_ERROR',
    'DEVICE_OFFLINE',
    'VALVE_OR_PUMP_EXECUTION_ERROR',
    'PLAN_CREATED_BY_NELSON_APP',
    'SCHEDULED_EVENT_NOT_OCCUR'
);


ALTER TYPE integrations.enum_irrigation_errors OWNER TO postgres;

--
-- Name: enum_irrigation_status; Type: TYPE; Schema: integrations; Owner: postgres
--

CREATE TYPE integrations.enum_irrigation_status AS ENUM (
    'pending',
    'scheduled',
    'running',
    'completed',
    'completed_with_error',
    'paused',
    'user_terminated',
    'execution_error'
);


ALTER TYPE integrations.enum_irrigation_status OWNER TO postgres;

--
-- Name: enum_nelson_sync_status; Type: TYPE; Schema: integrations; Owner: postgres
--

CREATE TYPE integrations.enum_nelson_sync_status AS ENUM (
    'addToDevice',
    'addSent',
    'completed',
    'onDevice',
    'removeFromDevice',
    'removeSent',
    'removed',
    'running',
    'unexpected',
    'userTerminated',
    'error'
);


ALTER TYPE integrations.enum_nelson_sync_status OWNER TO postgres;

--
-- Name: severity; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.severity AS ENUM (
    'INFO',
    'NORMAL',
    'IMPORTANT',
    'CRITICAL'
);


ALTER TYPE public.severity OWNER TO postgres;

--
-- Name: TYPE severity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TYPE public.severity IS 'Indicates highlight and sort order for notes';


--
-- Name: audit_table(regclass); Type: FUNCTION; Schema: audit; Owner: postgres
--

CREATE FUNCTION audit.audit_table(target_table regclass) RETURNS void
    LANGUAGE sql
    AS $_$
SELECT audit.audit_table($1, BOOLEAN 't', BOOLEAN 't');
$_$;


ALTER FUNCTION audit.audit_table(target_table regclass) OWNER TO postgres;

--
-- Name: FUNCTION audit_table(target_table regclass); Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON FUNCTION audit.audit_table(target_table regclass) IS '
Add auditing support to the given table. Row-level changes will be logged with full client query text. No cols are ignored.
';


--
-- Name: audit_table(regclass, boolean, boolean); Type: FUNCTION; Schema: audit; Owner: postgres
--

CREATE FUNCTION audit.audit_table(target_table regclass, audit_rows boolean, audit_query_text boolean) RETURNS void
    LANGUAGE sql
    AS $_$
SELECT audit.audit_table($1, $2, $3, ARRAY[]::text[]);
$_$;


ALTER FUNCTION audit.audit_table(target_table regclass, audit_rows boolean, audit_query_text boolean) OWNER TO postgres;

--
-- Name: audit_table(regclass, boolean, boolean, text[]); Type: FUNCTION; Schema: audit; Owner: postgres
--

CREATE FUNCTION audit.audit_table(target_table regclass, audit_rows boolean, audit_query_text boolean, ignored_cols text[]) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  stm_targets text = 'INSERT OR UPDATE OR DELETE OR TRUNCATE';
  _q_txt text;
  _ignored_cols_snip text = '';
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS audit_trigger_row ON ' || quote_ident(target_table::TEXT);
    EXECUTE 'DROP TRIGGER IF EXISTS audit_trigger_stm ON ' || quote_ident(target_table::TEXT);

    IF audit_rows THEN
        IF array_length(ignored_cols,1) > 0 THEN
            _ignored_cols_snip = ', ' || quote_literal(ignored_cols);
        END IF;
        _q_txt = 'CREATE TRIGGER audit_trigger_row AFTER INSERT OR UPDATE OR DELETE ON ' || 
                 quote_ident(target_table::TEXT) || 
                 ' FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func(' ||
                 quote_literal(audit_query_text) || _ignored_cols_snip || ');';
        RAISE NOTICE '%',_q_txt;
        EXECUTE _q_txt;
        stm_targets = 'TRUNCATE';
    ELSE
    END IF;

    _q_txt = 'CREATE TRIGGER audit_trigger_stm AFTER ' || stm_targets || ' ON ' ||
             target_table ||
             ' FOR EACH STATEMENT EXECUTE PROCEDURE audit.if_modified_func('||
             quote_literal(audit_query_text) || ');';
    RAISE NOTICE '%',_q_txt;
    EXECUTE _q_txt;

END;
$$;


ALTER FUNCTION audit.audit_table(target_table regclass, audit_rows boolean, audit_query_text boolean, ignored_cols text[]) OWNER TO postgres;

--
-- Name: FUNCTION audit_table(target_table regclass, audit_rows boolean, audit_query_text boolean, ignored_cols text[]); Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON FUNCTION audit.audit_table(target_table regclass, audit_rows boolean, audit_query_text boolean, ignored_cols text[]) IS '
Add auditing support to a table.

Arguments:
   target_table:     Table name, schema qualified if not on search_path
   audit_rows:       Record each row change, or only audit at a statement level
   audit_query_text: Record the text of the client query that triggered the audit event?
   ignored_cols:     Columns to exclude from update diffs, ignore updates that change only ignored cols.
';


--
-- Name: if_modified_func(); Type: FUNCTION; Schema: audit; Owner: postgres
--

CREATE FUNCTION audit.if_modified_func() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public'
    AS $$
DECLARE
    audit_row audit.logged_actions;
    include_values boolean;
    log_diffs boolean;
    h_old hstore;
    h_new hstore;
    excluded_cols text[] = ARRAY[]::text[];
BEGIN
    IF TG_WHEN <> 'AFTER' THEN
        RAISE EXCEPTION 'audit.if_modified_func() may only run as an AFTER trigger';
    END IF;

    audit_row = ROW(
        nextval('audit.logged_actions_event_id_seq'), -- event_id
        TG_TABLE_SCHEMA::text,                        -- schema_name
        TG_TABLE_NAME::text,                          -- table_name
        TG_RELID,                                     -- relation OID for much quicker searches
        session_user::text,                           -- session_user_name
        current_timestamp,                            -- action_tstamp_tx
        statement_timestamp(),                        -- action_tstamp_stm
        clock_timestamp(),                            -- action_tstamp_clk
        txid_current(),                               -- transaction ID
        current_setting('application_name'),          -- client application
        inet_client_addr(),                           -- client_addr
        inet_client_port(),                           -- client_port
        current_query(),                              -- top-level query or queries (if multistatement) from client
        substring(TG_OP,1,1),                         -- action
        NULL, NULL,                                   -- row_data, changed_fields
        'f'                                           -- statement_only
        );

    IF NOT TG_ARGV[0]::boolean IS DISTINCT FROM 'f'::boolean THEN
        audit_row.client_query = NULL;
    END IF;

    IF TG_ARGV[1] IS NOT NULL THEN
        excluded_cols = TG_ARGV[1]::text[];
    END IF;
    
    IF (TG_OP = 'UPDATE' AND TG_LEVEL = 'ROW') THEN
        audit_row.row_data = hstore(OLD.*) - excluded_cols;
        audit_row.changed_fields =  (hstore(NEW.*) - audit_row.row_data) - excluded_cols;
        IF audit_row.changed_fields = hstore('') THEN
            -- All changed fields are ignored. Skip this update.
            RETURN NULL;
        END IF;
    ELSIF (TG_OP = 'DELETE' AND TG_LEVEL = 'ROW') THEN
        audit_row.row_data = hstore(OLD.*) - excluded_cols;
    ELSIF (TG_OP = 'INSERT' AND TG_LEVEL = 'ROW') THEN
        audit_row.row_data = hstore(NEW.*) - excluded_cols;
    ELSIF (TG_LEVEL = 'STATEMENT' AND TG_OP IN ('INSERT','UPDATE','DELETE','TRUNCATE')) THEN
        audit_row.statement_only = 't';
    ELSE
        RAISE EXCEPTION '[audit.if_modified_func] - Trigger func added as trigger for unhandled case: %, %',TG_OP, TG_LEVEL;
        RETURN NULL;
    END IF;
    INSERT INTO audit.logged_actions VALUES (audit_row.*);
    RETURN NULL;
END;
$$;


ALTER FUNCTION audit.if_modified_func() OWNER TO postgres;

--
-- Name: FUNCTION if_modified_func(); Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON FUNCTION audit.if_modified_func() IS '
Track changes to a table at the statement and/or row level.

Optional parameters to trigger in CREATE TRIGGER call:

param 0: boolean, whether to log the query text. Default ''t''.

param 1: text[], columns to ignore in updates. Default [].

         Updates to ignored cols are omitted from changed_fields.

         Updates with only ignored cols changed are not inserted
         into the audit log.

         Almost all the processing work is still done for updates
         that ignored. If you need to save the load, you need to use
         WHEN clause on the trigger instead.

         No warning or error is issued if ignored_cols contains columns
         that do not exist in the target table. This lets you specify
         a standard set of ignored columns.

There is no parameter to disable logging of values. Add this trigger as
a ''FOR EACH STATEMENT'' rather than ''FOR EACH ROW'' trigger if you do not
want to log row values.

Note that the user name logged is the login role for the session. The audit trigger
cannot obtain the active role because it is reset by the SECURITY DEFINER invocation
of the audit trigger its self.
';


--
-- Name: id_generator(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.id_generator(OUT result bigint) RETURNS bigint
    LANGUAGE plpgsql
    AS $$

DECLARE
    our_epoch bigint := 1314220021721;
    seq_id bigint;
    now_millis bigint;
    -- the id of this DB shard, must be set for each
    -- schema shard you have - you could pass this as a parameter too
    shard_id int := 1;
BEGIN
    SELECT nextval('public.global_id_sequence') % 1024 INTO seq_id;

    SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_millis;
    result := (now_millis - our_epoch) << 23;
    result := result | (shard_id << 10);
    result := result | (seq_id);
END;

$$;


ALTER FUNCTION public.id_generator(OUT result bigint) OWNER TO postgres;

--
-- Name: irrigation_activities_history(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.irrigation_activities_history() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO integrations.irrigation_activities_history
    (irrigation_activity_id, schedule_id, status, start_time, end_time, pump_ids, is_deleted, updated_at)
  VALUES(NEW.id, NEW.schedule_id, NEW.status, NEW.start_time, NEW.end_time, NEW.pump_ids, NEW.is_deleted, now());
	RETURN NEW;
END;
$$;


ALTER FUNCTION public.irrigation_activities_history() OWNER TO postgres;

--
-- Name: irrigation_device_status_history(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.irrigation_device_status_history() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO integrations.irrigation_device_status_history
    (irrigation_device_status_id, irrigation_activity_id, device_id, status, start_time, end_time, last_update_time, is_deleted)
  VALUES(NEW.id, NEW.irrigation_activity_id, NEW.device_id, NEW.status, NEW.start_time, NEW.end_time, NEW.last_update_time, NEW.is_deleted);
	RETURN NEW;
END;
$$;


ALTER FUNCTION public.irrigation_device_status_history() OWNER TO postgres;

--
-- Name: link_altrac_users(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.link_altrac_users() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
	INSERT INTO user_customers (user_id, customer_id, permissions)
SELECT
	users.id,
	NEW.id,
	'{"level":30}'::JSONB
FROM
	users
WHERE
	users.is_active
	AND users.email ILIKE '%@altrac.io'
	AND users.email NOT LIKE '%+%'
	AND users.email NOT ILIKE 'delete%'
	AND users.email != 'alerts@altrac.io';
	RETURN NEW;
END;
$$;


ALTER FUNCTION public.link_altrac_users() OWNER TO postgres;

--
-- Name: link_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.link_user() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   INSERT INTO user_customers (user_id, customer_id, permissions)
   	VALUES (NEW.id, NEW.customer_id, NEW.permissions);
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.link_user() OWNER TO postgres;

--
-- Name: update_user_customers_permissions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_customers_permissions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  user_permissions JSONB;
BEGIN
  IF OLD.permissions->>'groups' IS DISTINCT FROM NEW.permissions->>'groups'
  OR OLD.permissions->>'level'  IS DISTINCT FROM NEW.permissions->>'level'
  THEN
    user_permissions = '{}'::JSONB;

    IF NEW.permissions->>'groups' != '<NULL>' THEN
      user_permissions = user_permissions || JSONB_BUILD_OBJECT('groups', NEW.permissions->'groups');
    END IF;

    IF NEW.permissions->>'level' != '<NULL>' THEN
      user_permissions = user_permissions || JSONB_BUILD_OBJECT('level', (NEW.permissions->>'level')::INT);
    END IF;

    UPDATE user_customers
    SET permissions = user_permissions
    WHERE user_id = NEW.id
      AND customer_id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_user_customers_permissions() OWNER TO postgres;

--
-- Name: update_users_permissions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_users_permissions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  user_permissions JSONB;
  original_user_permissions JSONB;
BEGIN
  IF OLD.permissions->>'groups' IS DISTINCT FROM NEW.permissions->>'groups'
  OR OLD.permissions->>'level'  IS DISTINCT FROM NEW.permissions->>'level'
  THEN
    user_permissions = '{}'::JSONB;

    IF NEW.permissions->>'groups' != '<NULL>' THEN
      user_permissions = user_permissions || JSONB_BUILD_OBJECT('groups', NEW.permissions->'groups');
    END IF;

    IF NEW.permissions->>'level' != '<NULL>' THEN
      user_permissions = user_permissions || JSONB_BUILD_OBJECT('level', (NEW.permissions->>'level')::INT);
    END IF;

    original_user_permissions := (SELECT permissions FROM users WHERE id=OLD.user_id);

    IF original_user_permissions->>'pin' != '<NULL>' THEN
      user_permissions = user_permissions || JSONB_BUILD_OBJECT('pin', original_user_permissions->'pin');
    END IF;

    UPDATE users
    SET permissions = user_permissions
    WHERE id          = NEW.user_id
      AND customer_id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_users_permissions() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: logged_actions; Type: TABLE; Schema: audit; Owner: postgres
--

CREATE TABLE audit.logged_actions (
    event_id bigint NOT NULL,
    schema_name text NOT NULL,
    table_name text NOT NULL,
    relid oid NOT NULL,
    session_user_name text,
    action_tstamp_tx timestamp with time zone NOT NULL,
    action_tstamp_stm timestamp with time zone NOT NULL,
    action_tstamp_clk timestamp with time zone NOT NULL,
    transaction_id bigint,
    application_name text,
    client_addr inet,
    client_port integer,
    client_query text,
    action text NOT NULL,
    row_data public.hstore,
    changed_fields public.hstore,
    statement_only boolean NOT NULL,
    CONSTRAINT logged_actions_action_check CHECK ((action = ANY (ARRAY['I'::text, 'D'::text, 'U'::text, 'T'::text])))
);


ALTER TABLE audit.logged_actions OWNER TO postgres;

--
-- Name: TABLE logged_actions; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON TABLE audit.logged_actions IS 'History of auditable actions on audited tables, from audit.if_modified_func()';


--
-- Name: COLUMN logged_actions.event_id; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.event_id IS 'Unique identifier for each auditable event';


--
-- Name: COLUMN logged_actions.schema_name; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.schema_name IS 'Database schema audited table for this event is in';


--
-- Name: COLUMN logged_actions.table_name; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.table_name IS 'Non-schema-qualified table name of table event occured in';


--
-- Name: COLUMN logged_actions.relid; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.relid IS 'Table OID. Changes with drop/create. Get with ''tablename''::regclass';


--
-- Name: COLUMN logged_actions.session_user_name; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.session_user_name IS 'Login / session user whose statement caused the audited event';


--
-- Name: COLUMN logged_actions.action_tstamp_tx; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.action_tstamp_tx IS 'Transaction start timestamp for tx in which audited event occurred';


--
-- Name: COLUMN logged_actions.action_tstamp_stm; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.action_tstamp_stm IS 'Statement start timestamp for tx in which audited event occurred';


--
-- Name: COLUMN logged_actions.action_tstamp_clk; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.action_tstamp_clk IS 'Wall clock time at which audited event''s trigger call occurred';


--
-- Name: COLUMN logged_actions.transaction_id; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.transaction_id IS 'Identifier of transaction that made the change. May wrap, but unique paired with action_tstamp_tx.';


--
-- Name: COLUMN logged_actions.application_name; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.application_name IS 'Application name set when this audit event occurred. Can be changed in-session by client.';


--
-- Name: COLUMN logged_actions.client_addr; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.client_addr IS 'IP address of client that issued query. Null for unix domain socket.';


--
-- Name: COLUMN logged_actions.client_port; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.client_port IS 'Remote peer IP port address of client that issued query. Undefined for unix socket.';


--
-- Name: COLUMN logged_actions.client_query; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.client_query IS 'Top-level query that caused this auditable event. May be more than one statement.';


--
-- Name: COLUMN logged_actions.action; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.action IS 'Action type; I = insert, D = delete, U = update, T = truncate';


--
-- Name: COLUMN logged_actions.row_data; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.row_data IS 'Record value. Null for statement-level trigger. For INSERT this is the new tuple. For DELETE and UPDATE it is the old tuple.';


--
-- Name: COLUMN logged_actions.changed_fields; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.changed_fields IS 'New values of fields changed by UPDATE. Null except for row-level UPDATE events.';


--
-- Name: COLUMN logged_actions.statement_only; Type: COMMENT; Schema: audit; Owner: postgres
--

COMMENT ON COLUMN audit.logged_actions.statement_only IS '''t'' if audit event is from an FOR EACH STATEMENT trigger, ''f'' for FOR EACH ROW';


--
-- Name: logged_actions_event_id_seq; Type: SEQUENCE; Schema: audit; Owner: postgres
--

CREATE SEQUENCE audit.logged_actions_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE audit.logged_actions_event_id_seq OWNER TO postgres;

--
-- Name: logged_actions_event_id_seq; Type: SEQUENCE OWNED BY; Schema: audit; Owner: postgres
--

ALTER SEQUENCE audit.logged_actions_event_id_seq OWNED BY audit.logged_actions.event_id;


--
-- Name: fertigations; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.fertigations (
    id integer NOT NULL,
    name character varying NOT NULL,
    post_start_mins integer NOT NULL,
    pre_stop_mins integer NOT NULL
);


ALTER TABLE integrations.fertigations OWNER TO postgres;

--
-- Name: fertigations_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

CREATE SEQUENCE integrations.fertigations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE integrations.fertigations_id_seq OWNER TO postgres;

--
-- Name: fertigations_id_seq; Type: SEQUENCE OWNED BY; Schema: integrations; Owner: postgres
--

ALTER SEQUENCE integrations.fertigations_id_seq OWNED BY integrations.fertigations.id;


--
-- Name: irrigation_activities; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.irrigation_activities (
    id integer NOT NULL,
    schedule_id integer,
    status integrations.enum_irrigation_status,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    pump_ids bigint[],
    is_deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE integrations.irrigation_activities OWNER TO postgres;

--
-- Name: irrigation_activities_history; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.irrigation_activities_history (
    id integer NOT NULL,
    irrigation_activity_id integer NOT NULL,
    schedule_id integer,
    status integrations.enum_irrigation_status,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    pump_ids bigint[],
    is_deleted boolean NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE integrations.irrigation_activities_history OWNER TO postgres;

--
-- Name: irrigation_activities_history_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

CREATE SEQUENCE integrations.irrigation_activities_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE integrations.irrigation_activities_history_id_seq OWNER TO postgres;

--
-- Name: irrigation_activities_history_id_seq; Type: SEQUENCE OWNED BY; Schema: integrations; Owner: postgres
--

ALTER SEQUENCE integrations.irrigation_activities_history_id_seq OWNED BY integrations.irrigation_activities_history.id;


--
-- Name: irrigation_activities_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

CREATE SEQUENCE integrations.irrigation_activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE integrations.irrigation_activities_id_seq OWNER TO postgres;

--
-- Name: irrigation_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: integrations; Owner: postgres
--

ALTER SEQUENCE integrations.irrigation_activities_id_seq OWNED BY integrations.irrigation_activities.id;


--
-- Name: irrigation_activity_error_logs; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.irrigation_activity_error_logs (
    id integer NOT NULL,
    schedule_id integer,
    activity_id integer,
    zone_id integer NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now(),
    error integrations.enum_irrigation_errors,
    description text,
    error_source jsonb
);


ALTER TABLE integrations.irrigation_activity_error_logs OWNER TO postgres;

--
-- Name: irrigation_activity_error_logs_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

CREATE SEQUENCE integrations.irrigation_activity_error_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE integrations.irrigation_activity_error_logs_id_seq OWNER TO postgres;

--
-- Name: irrigation_activity_error_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: integrations; Owner: postgres
--

ALTER SEQUENCE integrations.irrigation_activity_error_logs_id_seq OWNED BY integrations.irrigation_activity_error_logs.id;


--
-- Name: irrigation_device_status; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.irrigation_device_status (
    id integer NOT NULL,
    irrigation_activity_id integer,
    device_id bigint NOT NULL,
    status integrations.enum_irrigation_status,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    last_update_time timestamp with time zone DEFAULT now(),
    is_deleted boolean DEFAULT false NOT NULL,
    CONSTRAINT irrigation_device_status_start_less_than_end_time_key CHECK ((start_time < end_time))
);


ALTER TABLE integrations.irrigation_device_status OWNER TO postgres;

--
-- Name: irrigation_device_status_history; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.irrigation_device_status_history (
    id integer NOT NULL,
    irrigation_device_status_id integer NOT NULL,
    irrigation_activity_id integer,
    device_id bigint NOT NULL,
    status integrations.enum_irrigation_status,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    last_update_time timestamp with time zone,
    is_deleted boolean NOT NULL,
    CONSTRAINT irrigation_device_status_history_start_less_than_end_time_key CHECK ((start_time < end_time))
);


ALTER TABLE integrations.irrigation_device_status_history OWNER TO postgres;

--
-- Name: irrigation_device_status_history_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

CREATE SEQUENCE integrations.irrigation_device_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE integrations.irrigation_device_status_history_id_seq OWNER TO postgres;

--
-- Name: irrigation_device_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: integrations; Owner: postgres
--

ALTER SEQUENCE integrations.irrigation_device_status_history_id_seq OWNED BY integrations.irrigation_device_status_history.id;


--
-- Name: irrigation_device_status_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

CREATE SEQUENCE integrations.irrigation_device_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE integrations.irrigation_device_status_id_seq OWNER TO postgres;

--
-- Name: irrigation_device_status_id_seq; Type: SEQUENCE OWNED BY; Schema: integrations; Owner: postgres
--

ALTER SEQUENCE integrations.irrigation_device_status_id_seq OWNED BY integrations.irrigation_device_status.id;


--
-- Name: irrigation_schedules; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.irrigation_schedules (
    id integer NOT NULL,
    zone_id integer NOT NULL,
    pulse_irrigation_id integer,
    fertigation_id integer,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    pump_ids bigint[],
    created_by character varying,
    tag character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT irrigation_schedules_start_less_than_end_time_key CHECK ((start_time < end_time))
);


ALTER TABLE integrations.irrigation_schedules OWNER TO postgres;

--
-- Name: irrigation_schedules_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

CREATE SEQUENCE integrations.irrigation_schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE integrations.irrigation_schedules_id_seq OWNER TO postgres;

--
-- Name: irrigation_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: integrations; Owner: postgres
--

ALTER SEQUENCE integrations.irrigation_schedules_id_seq OWNED BY integrations.irrigation_schedules.id;


--
-- Name: nelson_cues; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.nelson_cues (
    id integer NOT NULL,
    cue_id bigint,
    irrigation_schedule_id integer,
    mc text NOT NULL,
    nelson_plan_id bigint NOT NULL,
    recurs bigint NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    error jsonb,
    response jsonb,
    plan_id bigint,
    status integrations.enum_nelson_sync_status,
    processed boolean DEFAULT false NOT NULL,
    edit_synced boolean DEFAULT false NOT NULL
);


ALTER TABLE integrations.nelson_cues OWNER TO postgres;

--
-- Name: nelson_cues_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

CREATE SEQUENCE integrations.nelson_cues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE integrations.nelson_cues_id_seq OWNER TO postgres;

--
-- Name: nelson_cues_id_seq; Type: SEQUENCE OWNED BY; Schema: integrations; Owner: postgres
--

ALTER SEQUENCE integrations.nelson_cues_id_seq OWNED BY integrations.nelson_cues.id;


--
-- Name: nelson_mc_config; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.nelson_mc_config (
    id integer NOT NULL,
    mc text NOT NULL,
    events_all jsonb,
    plan_names jsonb,
    valve_names jsonb
);


ALTER TABLE integrations.nelson_mc_config OWNER TO postgres;

--
-- Name: nelson_mc_config_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

CREATE SEQUENCE integrations.nelson_mc_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE integrations.nelson_mc_config_id_seq OWNER TO postgres;

--
-- Name: nelson_mc_config_id_seq; Type: SEQUENCE OWNED BY; Schema: integrations; Owner: postgres
--

ALTER SEQUENCE integrations.nelson_mc_config_id_seq OWNED BY integrations.nelson_mc_config.id;


--
-- Name: nelson_mc_exclusion; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.nelson_mc_exclusion (
    id integer NOT NULL,
    mc text NOT NULL,
    events_to_skip jsonb
);


ALTER TABLE integrations.nelson_mc_exclusion OWNER TO postgres;

--
-- Name: nelson_mc_exclusion_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

CREATE SEQUENCE integrations.nelson_mc_exclusion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE integrations.nelson_mc_exclusion_id_seq OWNER TO postgres;

--
-- Name: nelson_mc_exclusion_id_seq; Type: SEQUENCE OWNED BY; Schema: integrations; Owner: postgres
--

ALTER SEQUENCE integrations.nelson_mc_exclusion_id_seq OWNED BY integrations.nelson_mc_exclusion.id;


--
-- Name: nelson_plan_histories; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.nelson_plan_histories (
    id integer NOT NULL,
    plan_id bigint,
    mc text NOT NULL,
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    duration integer,
    device_address jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE integrations.nelson_plan_histories OWNER TO postgres;

--
-- Name: nelson_plan_histories_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

CREATE SEQUENCE integrations.nelson_plan_histories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE integrations.nelson_plan_histories_id_seq OWNER TO postgres;

--
-- Name: nelson_plan_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: integrations; Owner: postgres
--

ALTER SEQUENCE integrations.nelson_plan_histories_id_seq OWNED BY integrations.nelson_plan_histories.id;


--
-- Name: nelson_plans; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.nelson_plans (
    id integer NOT NULL,
    plan_id bigint,
    irrigation_schedule_id integer,
    mc text NOT NULL,
    spans jsonb,
    cycle timestamp with time zone,
    color real,
    name text,
    device_address jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    error jsonb,
    response jsonb,
    status integrations.enum_nelson_sync_status,
    processed boolean DEFAULT false NOT NULL,
    edit_synced boolean DEFAULT false NOT NULL
);


ALTER TABLE integrations.nelson_plans OWNER TO postgres;

--
-- Name: nelson_plans_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

CREATE SEQUENCE integrations.nelson_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE integrations.nelson_plans_id_seq OWNER TO postgres;

--
-- Name: nelson_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: integrations; Owner: postgres
--

ALTER SEQUENCE integrations.nelson_plans_id_seq OWNED BY integrations.nelson_plans.id;


--
-- Name: pulse_irrigations; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.pulse_irrigations (
    id integer NOT NULL,
    name character varying NOT NULL,
    on_mins integer NOT NULL,
    off_mins integer NOT NULL
);


ALTER TABLE integrations.pulse_irrigations OWNER TO postgres;

--
-- Name: pulse_irrigations_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

CREATE SEQUENCE integrations.pulse_irrigations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE integrations.pulse_irrigations_id_seq OWNER TO postgres;

--
-- Name: pulse_irrigations_id_seq; Type: SEQUENCE OWNED BY; Schema: integrations; Owner: postgres
--

ALTER SEQUENCE integrations.pulse_irrigations_id_seq OWNED BY integrations.pulse_irrigations.id;


--
-- Name: zone_devices; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.zone_devices (
    id integer NOT NULL,
    zone_id integer NOT NULL,
    device_id bigint NOT NULL,
    actuator_id integer,
    start_offset integer DEFAULT 0 NOT NULL,
    stop_offset integer DEFAULT 0 NOT NULL,
    not_in_semios_db boolean DEFAULT false NOT NULL
);


ALTER TABLE integrations.zone_devices OWNER TO postgres;

--
-- Name: zone_devices_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

CREATE SEQUENCE integrations.zone_devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE integrations.zone_devices_id_seq OWNER TO postgres;

--
-- Name: zone_devices_id_seq; Type: SEQUENCE OWNED BY; Schema: integrations; Owner: postgres
--

ALTER SEQUENCE integrations.zone_devices_id_seq OWNED BY integrations.zone_devices.id;


--
-- Name: zones; Type: TABLE; Schema: integrations; Owner: postgres
--

CREATE TABLE integrations.zones (
    id integer NOT NULL,
    customer_id bigint NOT NULL,
    zone_name character varying NOT NULL,
    description character varying,
    read_only boolean DEFAULT false NOT NULL,
    geom public.geometry(Geometry,4326),
    emitter_type character varying,
    assumed_flow_rate real,
    flow_rate_volume_units integrations.enum_flowrate_volume_units,
    flow_rate_time_units integrations.enum_flowrate_time_units,
    metadata jsonb
);


ALTER TABLE integrations.zones OWNER TO postgres;

--
-- Name: zones_id_seq; Type: SEQUENCE; Schema: integrations; Owner: postgres
--

CREATE SEQUENCE integrations.zones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE integrations.zones_id_seq OWNER TO postgres;

--
-- Name: zones_id_seq; Type: SEQUENCE OWNED BY; Schema: integrations; Owner: postgres
--

ALTER SEQUENCE integrations.zones_id_seq OWNED BY integrations.zones.id;


--
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id bigint DEFAULT public.id_generator() NOT NULL,
    name text NOT NULL,
    customer_id bigint NOT NULL,
    client_id text NOT NULL,
    secret text NOT NULL,
    permissions jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    user_id bigint,
    user_name character varying,
    user_email character varying
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- Name: brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brands (
    name text NOT NULL,
    display_name text,
    css text DEFAULT '{body {color:#284047;background-color:#d9d9d9;}'::text,
    sales_email text,
    sales_phone text,
    support_email text,
    support_phone text,
    locale jsonb DEFAULT '{"language": "en", "tempConv": "f", "timeZone": "US/Los Angeles"}'::jsonb,
    icon_png text DEFAULT 'https://app.altrac.io/images/app/logo_trueblack.png'::text,
    splash_img text DEFAULT 'https://app.altrac.io/images/app/login-background_bhv.png'::text,
    icon_svg text DEFAULT '<svg viewbox="0 0 128 128" width="auto" height="100%" preserveAspectRatio="xMinYMid meet"><g><rect x=0 y=0 height=128 width=128 fill=cyan stroke=red stroke-width=10></g></svg>'::text,
    banner_svg text DEFAULT '<svg viewbox="0 0 640 128" width="auto" height="100%" preserveAspectRatio="xMinYMid meet"><g><rect x=0 y=0 height=128 width=640 fill=cyan stroke=red stroke-width=10></g></svg>'::text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- Name: TABLE brands; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.brands IS 'Brand themes - trade dress of resellers';


--
-- Name: customer_relations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_relations (
    id bigint DEFAULT public.id_generator() NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    customer_id bigint,
    child_id bigint,
    relation text
);


ALTER TABLE public.customer_relations OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    applications jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    customer_name text,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    old_id character varying(36) DEFAULT public.id_generator(),
    id bigint DEFAULT public.id_generator() NOT NULL,
    security jsonb,
    brand_name text DEFAULT 'altrac'::text,
    is_active boolean DEFAULT true NOT NULL,
    groups_enabled boolean DEFAULT false NOT NULL,
    is_distributor boolean DEFAULT false NOT NULL,
    required_action_3g_lte_transition boolean
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.devices (
    id bigint DEFAULT public.id_generator() NOT NULL,
    address text,
    application_settings jsonb,
    application_settings_new jsonb,
    customer_id bigint,
    address_alias text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    installed_at timestamp with time zone,
    interface jsonb,
    physical jsonb,
    reading0 jsonb,
    reading1 jsonb,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    customer_id_old character varying(36),
    configuration jsonb,
    interface_id bigint,
    monitor_status text DEFAULT 'none'::text NOT NULL,
    is_active boolean,
    activated_at timestamp with time zone,
    deactivated_at timestamp with time zone,
    troubleshooting jsonb,
    group_id bigint,
    distributor_id bigint,
    modem_alias text,
    modems text[],
    transport_address text,
    lng text,
    lat text,
    custom text
);


ALTER TABLE public.devices OWNER TO postgres;

--
-- Name: COLUMN devices.is_active; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.devices.is_active IS 'has been activated - null if in un-shipped inventory';


--
-- Name: COLUMN devices.deactivated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.devices.deactivated_at IS 'timestamp of deactivation';


--
-- Name: doc_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doc_sections (
    id integer NOT NULL,
    doc_id integer NOT NULL,
    sub_category text,
    html_id text,
    title text,
    next_html_id text,
    locale text DEFAULT 'en'::text,
    source text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.doc_sections OWNER TO postgres;

--
-- Name: TABLE doc_sections; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.doc_sections IS 'part of a document to be displayed in the app';


--
-- Name: doc_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doc_sections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doc_sections_id_seq OWNER TO postgres;

--
-- Name: doc_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doc_sections_id_seq OWNED BY public.doc_sections.id;


--
-- Name: docs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.docs (
    id integer NOT NULL,
    title text,
    category text,
    product_id text,
    product_name text,
    model_numbers text,
    locale text DEFAULT 'en'::text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.docs OWNER TO postgres;

--
-- Name: TABLE docs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.docs IS 'root entity of a document to be displayed in the app';


--
-- Name: docs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.docs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.docs_id_seq OWNER TO postgres;

--
-- Name: docs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.docs_id_seq OWNED BY public.docs.id;


--
-- Name: global_id_sequence; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.global_id_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.global_id_sequence OWNER TO postgres;

--
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    id bigint DEFAULT public.id_generator() NOT NULL,
    device_group text NOT NULL,
    customer_id bigint NOT NULL,
    icon text NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- Name: interfaces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interfaces (
    data jsonb,
    type text,
    subtype text,
    version text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    id bigint DEFAULT public.id_generator() NOT NULL
);


ALTER TABLE public.interfaces OWNER TO postgres;

--
-- Name: notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notes (
    id bigint DEFAULT public.id_generator() NOT NULL,
    body text,
    importance public.severity DEFAULT 'NORMAL'::public.severity,
    table_name text,
    pk_name text DEFAULT 'id'::text,
    pk_value text,
    is_visible boolean DEFAULT true,
    is_confidential boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    created_by bigint,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_by bigint
);


ALTER TABLE public.notes OWNER TO postgres;

--
-- Name: rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rules (
    id bigint DEFAULT public.id_generator() NOT NULL,
    active text,
    address text,
    next_notification bigint,
    rule jsonb,
    transport jsonb,
    type text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    send_once_state boolean DEFAULT false,
    recurrence jsonb
);


ALTER TABLE public.rules OWNER TO postgres;

--
-- Name: rules_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rules_backup (
    id bigint NOT NULL,
    active text,
    address text,
    next_notification bigint,
    rule jsonb,
    transport jsonb,
    type text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    send_once_state boolean,
    recurrence jsonb
);


ALTER TABLE public.rules_backup OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id bigint DEFAULT public.id_generator() NOT NULL,
    address text,
    settings jsonb,
    status text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    user_id bigint,
    out_queue text,
    out_sent text
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: settings_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings_history (
    id bigint DEFAULT public.id_generator() NOT NULL,
    setting_id bigint,
    address text,
    settings jsonb,
    status text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    user_id bigint
);


ALTER TABLE public.settings_history OWNER TO postgres;

--
-- Name: stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stats (
    hash text NOT NULL,
    address text NOT NULL,
    date_begin timestamp with time zone NOT NULL,
    date_end timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    value_key text NOT NULL,
    series jsonb NOT NULL,
    stats jsonb NOT NULL,
    device_id bigint
);


ALTER TABLE public.stats OWNER TO postgres;

--
-- Name: tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tests (
    id bigint DEFAULT public.id_generator() NOT NULL,
    address text,
    key text,
    outcome text,
    results jsonb,
    details jsonb,
    application text,
    os text,
    product text,
    hardware text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);


ALTER TABLE public.tests OWNER TO postgres;

--
-- Name: user_customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_customers (
    customer_id bigint NOT NULL,
    user_id bigint NOT NULL,
    permissions jsonb DEFAULT '{"level": 0}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.user_customers OWNER TO postgres;

--
-- Name: TABLE user_customers; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.user_customers IS 'Users with access to customer data';


--
-- Name: user_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_groups (
    id bigint DEFAULT public.id_generator() NOT NULL,
    group_id bigint NOT NULL,
    user_id bigint NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);


ALTER TABLE public.user_groups OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint DEFAULT public.id_generator() NOT NULL,
    auth_id character varying(255),
    customer_old_id character varying(255) DEFAULT '1815617205937637031'::character varying,
    customer_id bigint DEFAULT '1815617205937637031'::bigint,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    locale jsonb DEFAULT '{"tempConv": "f"}'::jsonb,
    name character varying(255),
    email character varying(255),
    permissions jsonb DEFAULT '{"level": 0}'::jsonb,
    authentication_details jsonb,
    password character varying(255) DEFAULT ''::character varying NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    company character varying(255),
    "position" character varying(255),
    country character varying(255),
    state character varying(255),
    city character varying(255),
    main_phone character varying(255),
    secondary_phone character varying(255),
    address character varying(255),
    zip_code character varying(255),
    password_reset_key character varying(255),
    auth_id_migrated boolean DEFAULT false,
    is_active boolean DEFAULT true NOT NULL,
    swap_required boolean
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: logged_actions event_id; Type: DEFAULT; Schema: audit; Owner: postgres
--

ALTER TABLE ONLY audit.logged_actions ALTER COLUMN event_id SET DEFAULT nextval('audit.logged_actions_event_id_seq'::regclass);


--
-- Name: fertigations id; Type: DEFAULT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.fertigations ALTER COLUMN id SET DEFAULT nextval('integrations.fertigations_id_seq'::regclass);


--
-- Name: irrigation_activities id; Type: DEFAULT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_activities ALTER COLUMN id SET DEFAULT nextval('integrations.irrigation_activities_id_seq'::regclass);


--
-- Name: irrigation_activities_history id; Type: DEFAULT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_activities_history ALTER COLUMN id SET DEFAULT nextval('integrations.irrigation_activities_history_id_seq'::regclass);


--
-- Name: irrigation_activity_error_logs id; Type: DEFAULT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_activity_error_logs ALTER COLUMN id SET DEFAULT nextval('integrations.irrigation_activity_error_logs_id_seq'::regclass);


--
-- Name: irrigation_device_status id; Type: DEFAULT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_device_status ALTER COLUMN id SET DEFAULT nextval('integrations.irrigation_device_status_id_seq'::regclass);


--
-- Name: irrigation_device_status_history id; Type: DEFAULT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_device_status_history ALTER COLUMN id SET DEFAULT nextval('integrations.irrigation_device_status_history_id_seq'::regclass);


--
-- Name: irrigation_schedules id; Type: DEFAULT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_schedules ALTER COLUMN id SET DEFAULT nextval('integrations.irrigation_schedules_id_seq'::regclass);


--
-- Name: nelson_cues id; Type: DEFAULT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.nelson_cues ALTER COLUMN id SET DEFAULT nextval('integrations.nelson_cues_id_seq'::regclass);


--
-- Name: nelson_mc_config id; Type: DEFAULT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.nelson_mc_config ALTER COLUMN id SET DEFAULT nextval('integrations.nelson_mc_config_id_seq'::regclass);


--
-- Name: nelson_mc_exclusion id; Type: DEFAULT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.nelson_mc_exclusion ALTER COLUMN id SET DEFAULT nextval('integrations.nelson_mc_exclusion_id_seq'::regclass);


--
-- Name: nelson_plan_histories id; Type: DEFAULT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.nelson_plan_histories ALTER COLUMN id SET DEFAULT nextval('integrations.nelson_plan_histories_id_seq'::regclass);


--
-- Name: nelson_plans id; Type: DEFAULT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.nelson_plans ALTER COLUMN id SET DEFAULT nextval('integrations.nelson_plans_id_seq'::regclass);


--
-- Name: pulse_irrigations id; Type: DEFAULT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.pulse_irrigations ALTER COLUMN id SET DEFAULT nextval('integrations.pulse_irrigations_id_seq'::regclass);


--
-- Name: zone_devices id; Type: DEFAULT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.zone_devices ALTER COLUMN id SET DEFAULT nextval('integrations.zone_devices_id_seq'::regclass);


--
-- Name: zones id; Type: DEFAULT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.zones ALTER COLUMN id SET DEFAULT nextval('integrations.zones_id_seq'::regclass);


--
-- Name: doc_sections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doc_sections ALTER COLUMN id SET DEFAULT nextval('public.doc_sections_id_seq'::regclass);


--
-- Name: docs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docs ALTER COLUMN id SET DEFAULT nextval('public.docs_id_seq'::regclass);


--
-- Name: logged_actions logged_actions_pkey; Type: CONSTRAINT; Schema: audit; Owner: postgres
--

ALTER TABLE ONLY audit.logged_actions
    ADD CONSTRAINT logged_actions_pkey PRIMARY KEY (event_id);


--
-- Name: zones customer_id_zone_name_emitter_type_key; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.zones
    ADD CONSTRAINT customer_id_zone_name_emitter_type_key UNIQUE (customer_id, zone_name, emitter_type);


--
-- Name: fertigations fertigations_id_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.fertigations
    ADD CONSTRAINT fertigations_id_pkey PRIMARY KEY (id);


--
-- Name: fertigations fertigations_name_key; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.fertigations
    ADD CONSTRAINT fertigations_name_key UNIQUE (name);


--
-- Name: irrigation_activities_history irrigation_activities_history_id_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_activities_history
    ADD CONSTRAINT irrigation_activities_history_id_pkey PRIMARY KEY (id);


--
-- Name: irrigation_activities irrigation_activities_id_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_activities
    ADD CONSTRAINT irrigation_activities_id_pkey PRIMARY KEY (id);


--
-- Name: irrigation_activity_error_logs irrigation_activity_error_logs_id_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_activity_error_logs
    ADD CONSTRAINT irrigation_activity_error_logs_id_pkey PRIMARY KEY (id);


--
-- Name: irrigation_device_status_history irrigation_device_status_history_id_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_device_status_history
    ADD CONSTRAINT irrigation_device_status_history_id_pkey PRIMARY KEY (id);


--
-- Name: irrigation_device_status irrigation_device_status_id_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_device_status
    ADD CONSTRAINT irrigation_device_status_id_pkey PRIMARY KEY (id);


--
-- Name: irrigation_schedules irrigation_schedules_id_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_schedules
    ADD CONSTRAINT irrigation_schedules_id_pkey PRIMARY KEY (id);


--
-- Name: nelson_cues nelson_cues_cue_id_plan_id_mc_key; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.nelson_cues
    ADD CONSTRAINT nelson_cues_cue_id_plan_id_mc_key UNIQUE (cue_id, plan_id, mc);


--
-- Name: nelson_cues nelson_cues_id_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.nelson_cues
    ADD CONSTRAINT nelson_cues_id_pkey PRIMARY KEY (id);


--
-- Name: nelson_mc_config nelson_mc_config_id_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.nelson_mc_config
    ADD CONSTRAINT nelson_mc_config_id_pkey PRIMARY KEY (id);


--
-- Name: nelson_mc_config nelson_mc_config_mc_key; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.nelson_mc_config
    ADD CONSTRAINT nelson_mc_config_mc_key UNIQUE (mc);


--
-- Name: nelson_mc_exclusion nelson_mc_exclusion_id_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.nelson_mc_exclusion
    ADD CONSTRAINT nelson_mc_exclusion_id_pkey PRIMARY KEY (id);


--
-- Name: nelson_plan_histories nelson_plan_histories_id_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.nelson_plan_histories
    ADD CONSTRAINT nelson_plan_histories_id_pkey PRIMARY KEY (id);


--
-- Name: nelson_plans nelson_plans_id_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.nelson_plans
    ADD CONSTRAINT nelson_plans_id_pkey PRIMARY KEY (id);


--
-- Name: nelson_plans nelson_plans_plan_id_mc_key; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.nelson_plans
    ADD CONSTRAINT nelson_plans_plan_id_mc_key UNIQUE (plan_id, mc);


--
-- Name: pulse_irrigations pulse_irrigations_id_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.pulse_irrigations
    ADD CONSTRAINT pulse_irrigations_id_pkey PRIMARY KEY (id);


--
-- Name: pulse_irrigations pulse_irrigations_name_key; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.pulse_irrigations
    ADD CONSTRAINT pulse_irrigations_name_key UNIQUE (name);


--
-- Name: zone_devices zone_devices_id_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.zone_devices
    ADD CONSTRAINT zone_devices_id_pkey PRIMARY KEY (id);


--
-- Name: zones zones_id_pkey; Type: CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.zones
    ADD CONSTRAINT zones_id_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (name);


--
-- Name: customer_relations customer_relations_customer_id_child_id_relation_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_relations
    ADD CONSTRAINT customer_relations_customer_id_child_id_relation_key UNIQUE (customer_id, child_id, relation);


--
-- Name: customer_relations customer_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_relations
    ADD CONSTRAINT customer_relations_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: customers customers_uniq_old_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_uniq_old_id UNIQUE (old_id);


--
-- Name: devices devices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- Name: doc_sections doc_sections_doc_id_sub_category_html_id_locale_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doc_sections
    ADD CONSTRAINT doc_sections_doc_id_sub_category_html_id_locale_key UNIQUE (doc_id, sub_category, html_id, locale);


--
-- Name: doc_sections doc_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doc_sections
    ADD CONSTRAINT doc_sections_pkey PRIMARY KEY (id);


--
-- Name: docs docs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docs
    ADD CONSTRAINT docs_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: interfaces interfaces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interfaces
    ADD CONSTRAINT interfaces_pkey PRIMARY KEY (id);


--
-- Name: interfaces interfaces_type_subtype_version_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interfaces
    ADD CONSTRAINT interfaces_type_subtype_version_key UNIQUE (type, subtype, version);


--
-- Name: rules_backup rules_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rules_backup
    ADD CONSTRAINT rules_backup_pkey PRIMARY KEY (id);


--
-- Name: rules rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rules
    ADD CONSTRAINT rules_pkey PRIMARY KEY (id);


--
-- Name: settings_history settings_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings_history
    ADD CONSTRAINT settings_history_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: stats stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stats
    ADD CONSTRAINT stats_pkey PRIMARY KEY (hash);


--
-- Name: tests tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_pkey PRIMARY KEY (id);


--
-- Name: tests tests_uniq_address_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_uniq_address_key UNIQUE (key, address);


--
-- Name: user_customers user_customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_customers
    ADD CONSTRAINT user_customers_pkey PRIMARY KEY (customer_id, user_id);


--
-- Name: user_groups user_groups_group_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_group_id_user_id_key UNIQUE (group_id, user_id);


--
-- Name: user_groups user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: logged_actions_action_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX logged_actions_action_idx ON audit.logged_actions USING btree (action);


--
-- Name: logged_actions_action_tstamp_tx_stm_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX logged_actions_action_tstamp_tx_stm_idx ON audit.logged_actions USING btree (action_tstamp_stm);


--
-- Name: logged_actions_relid_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX logged_actions_relid_idx ON audit.logged_actions USING btree (relid);


--
-- Name: applications_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX applications_client_id ON public.applications USING btree (client_id);


--
-- Name: applications_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX applications_customer_id ON public.applications USING btree (customer_id);


--
-- Name: devices_address_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX devices_address_idx ON public.devices USING btree (address);


--
-- Name: devices_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX devices_customer_id_idx ON public.devices USING btree (customer_id);


--
-- Name: rules_active_type_next_notification_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX rules_active_type_next_notification_idx ON public.rules USING btree (active, type, next_notification NULLS FIRST);


--
-- Name: rules_address_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX rules_address_active_idx ON public.rules USING btree (address, active);


--
-- Name: settings_address_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX settings_address_status_idx ON public.settings USING btree (address, status);


--
-- Name: settings_history_address_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX settings_history_address_status_idx ON public.settings_history USING btree (address, status);


--
-- Name: stats_date_begin_ix; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stats_date_begin_ix ON public.stats USING btree (date_begin);


--
-- Name: stats_date_end_ix; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stats_date_end_ix ON public.stats USING btree (date_end);


--
-- Name: stats_device_id_ix; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stats_device_id_ix ON public.stats USING btree (device_id);


--
-- Name: stats_value_key_ix; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stats_value_key_ix ON public.stats USING btree (value_key);


--
-- Name: irrigation_activities irrigation_activities_history_upsert; Type: TRIGGER; Schema: integrations; Owner: postgres
--

CREATE TRIGGER irrigation_activities_history_upsert AFTER INSERT OR UPDATE ON integrations.irrigation_activities FOR EACH ROW EXECUTE FUNCTION public.irrigation_activities_history();


--
-- Name: irrigation_device_status irrigation_device_status_history_upsert; Type: TRIGGER; Schema: integrations; Owner: postgres
--

CREATE TRIGGER irrigation_device_status_history_upsert AFTER INSERT OR UPDATE ON integrations.irrigation_device_status FOR EACH ROW EXECUTE FUNCTION public.irrigation_device_status_history();


--
-- Name: customers audit_trigger_row; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true', '{updated_at,created_at}');


--
-- Name: devices audit_trigger_row; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true', '{updated_at,created_at,reading0,reading1}');


--
-- Name: users audit_trigger_row; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true', '{updated_at,created_at}');


--
-- Name: customers audit_trigger_stm; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON public.customers FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: devices audit_trigger_stm; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON public.devices FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: users audit_trigger_stm; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON public.users FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: customers customer_inserts; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER customer_inserts AFTER INSERT ON public.customers FOR EACH ROW EXECUTE FUNCTION public.link_altrac_users();


--
-- Name: user_customers update_user_customers_permissions_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_customers_permissions_trigger AFTER UPDATE ON public.user_customers FOR EACH ROW EXECUTE FUNCTION public.update_users_permissions();


--
-- Name: users update_user_customers_permissions_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_customers_permissions_trigger AFTER UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_user_customers_permissions();


--
-- Name: user_customers update_users_permissions_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_permissions_trigger AFTER UPDATE ON public.user_customers FOR EACH ROW EXECUTE FUNCTION public.update_users_permissions();


--
-- Name: users users_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER users_insert AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.link_user();


--
-- Name: irrigation_activities_history irrigation_activities_history_irrigation_activity_id_fkey; Type: FK CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_activities_history
    ADD CONSTRAINT irrigation_activities_history_irrigation_activity_id_fkey FOREIGN KEY (irrigation_activity_id) REFERENCES integrations.irrigation_activities(id) ON DELETE CASCADE;


--
-- Name: irrigation_activities_history irrigation_activities_history_schedule_id_fkey; Type: FK CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_activities_history
    ADD CONSTRAINT irrigation_activities_history_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES integrations.irrigation_schedules(id) ON DELETE CASCADE;


--
-- Name: irrigation_activities irrigation_activities_schedule_id_fkey; Type: FK CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_activities
    ADD CONSTRAINT irrigation_activities_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES integrations.irrigation_schedules(id) ON DELETE CASCADE;


--
-- Name: irrigation_activity_error_logs irrigation_activity_error_logs_zone_id_fkey; Type: FK CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_activity_error_logs
    ADD CONSTRAINT irrigation_activity_error_logs_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES integrations.zones(id) ON DELETE CASCADE;


--
-- Name: irrigation_device_status irrigation_device_status_device_id_fkey; Type: FK CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_device_status
    ADD CONSTRAINT irrigation_device_status_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: irrigation_device_status_history irrigation_device_status_history_device_id_fkey; Type: FK CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_device_status_history
    ADD CONSTRAINT irrigation_device_status_history_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: irrigation_device_status_history irrigation_device_status_history_irrigation_activity_id_fkey; Type: FK CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_device_status_history
    ADD CONSTRAINT irrigation_device_status_history_irrigation_activity_id_fkey FOREIGN KEY (irrigation_activity_id) REFERENCES integrations.irrigation_activities(id) ON DELETE CASCADE;


--
-- Name: irrigation_device_status irrigation_device_status_irrigation_activity_id_fkey; Type: FK CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_device_status
    ADD CONSTRAINT irrigation_device_status_irrigation_activity_id_fkey FOREIGN KEY (irrigation_activity_id) REFERENCES integrations.irrigation_activities(id) ON DELETE CASCADE;


--
-- Name: irrigation_schedules irrigation_schedules_fertigation_id_fkey; Type: FK CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_schedules
    ADD CONSTRAINT irrigation_schedules_fertigation_id_fkey FOREIGN KEY (fertigation_id) REFERENCES integrations.fertigations(id) ON DELETE CASCADE;


--
-- Name: irrigation_schedules irrigation_schedules_zone_id_fkey; Type: FK CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.irrigation_schedules
    ADD CONSTRAINT irrigation_schedules_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES integrations.zones(id) ON DELETE CASCADE;


--
-- Name: zone_devices zone_devices_device_id_fkey; Type: FK CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.zone_devices
    ADD CONSTRAINT zone_devices_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: zone_devices zone_devices_zone_id_fkey; Type: FK CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.zone_devices
    ADD CONSTRAINT zone_devices_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES integrations.zones(id) ON DELETE CASCADE;


--
-- Name: zones zones_customer_id_fkey; Type: FK CONSTRAINT; Schema: integrations; Owner: postgres
--

ALTER TABLE ONLY integrations.zones
    ADD CONSTRAINT zones_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_relations customer_relations_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_relations
    ADD CONSTRAINT customer_relations_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.customers(id);


--
-- Name: customer_relations customer_relations_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_relations
    ADD CONSTRAINT customer_relations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: devices devices_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: doc_sections doc_sections_doc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doc_sections
    ADD CONSTRAINT doc_sections_doc_id_fkey FOREIGN KEY (doc_id) REFERENCES public.docs(id) ON DELETE CASCADE;


--
-- Name: groups groups_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: notes notes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: notes notes_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: stats stats_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stats
    ADD CONSTRAINT stats_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id);


--
-- Name: user_customers user_customers_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_customers
    ADD CONSTRAINT user_customers_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: user_customers user_customers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_customers
    ADD CONSTRAINT user_customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_groups user_groups_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- Name: user_groups user_groups_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_groups
    ADD CONSTRAINT user_groups_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
