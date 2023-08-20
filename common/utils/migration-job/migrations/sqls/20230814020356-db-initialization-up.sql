/* Replace with your SQL commands */

-- USER TABLE 
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_permission') THEN
        CREATE TYPE user_permission AS ENUM ('Admin', 'Employee', 'Customer', 'Vendor', 'Unauthorized');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_table (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    permission user_permission DEFAULT 'Unauthorized' NOT NULL,
    password VARCHAR(128) NOT NULL CHECK (Password ~ '^.*(?=.{8,64})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).*$')
);

 -- CUSTOMER TABLE
CREATE TABLE IF NOT EXISTS customer_table (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    company_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL
);

-- VENDOR TABLE
CREATE TABLE IF NOT EXISTS vendor_table (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    company_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL 
);

-- CUSTOMER AND VENDOR ADDRESSES
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'address_type') THEN
        CREATE TYPE address_type AS ENUM ('Shipping', 'Billing');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS customer_addresses (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    address address_type NOT NULL,
    street_address_line1 VARCHAR(100) NOT NULL,
    street_address_line2 VARCHAR(100),
    city VARCHAR(35) NOT NULL,
    province VARCHAR(35),
    postal VARCHAR(12) NOT NULL,
    country VARCHAR(35) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customer_table(id) ON DELETE CASCADE
);

-- CREATE TABLE IF NOT EXISTS vendor_addresses (
--     id SERIAL PRIMARY KEY,
--     vendor_id NOT NULL,
--     address address_type NOT NULL,
--     street_address_line1 VARCHAR(100) NOT NULL,
--     street_address_line2 VARCHAR(100),
--     city VARCHAR(35) NOT NULL,
--     province VARCHAR(35),
--     postal VARCHAR(12) NOT NULL,
--     country VARCHAR(35) NOT NULL,
--     FOREIGN KEY (vendor_id) REFERENCES vendor_table(id) ON DELETE CASCADE
-- );





