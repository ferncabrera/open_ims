/* Replace with your SQL CREATE commands */

CREATE TYPE user_permission AS ENUM ('Admin', 'Employee', 'Unauthorized');

-- USER TABLE
CREATE TABLE user_table (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    permission user_permission DEFAULT 'Unauthorized' NOT NULL,
    password VARCHAR(128) NOT NULL CHECK (Password ~ '^.*(?=.{8,64})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).*$')
);

-- EMPLOYEE TABLE
CREATE TABLE employee_table (
    emp_id INT REFERENCES user_table(id) UNIQUE,
    emp_sin VARCHAR(15),
    emp_hourly_rate INT,
    emp_commission INT,
    emp_address VARCHAR(200),
    emp_notes VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    PRIMARY KEY (emp_id)
);

 -- CUSTOMER TABLE
CREATE TABLE customer_table (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    company_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    net_terms INT DEFAULT 30 NOT NULL,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES employee_table (emp_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- VENDOR TABLE
CREATE TABLE vendor_table (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    company_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    net_terms INT DEFAULT 30 NOT NULL,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES employee_table (emp_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- CUSTOMER AND VENDOR ADDRESSES
CREATE TYPE address_type AS ENUM ('Shipping', 'Billing');

CREATE TABLE customer_addresses (
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

CREATE TABLE vendor_addresses (
    id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    address address_type NOT NULL,
    street_address_line1 VARCHAR(100) NOT NULL,
    street_address_line2 VARCHAR(100),
    city VARCHAR(35) NOT NULL,
    province VARCHAR(35),
    postal VARCHAR(12) NOT NULL,
    country VARCHAR(35) NOT NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendor_table(id) ON DELETE CASCADE
);

-- CUSTOMER AND VENDOR CONNECTION (for customers that also vendor & vice versa), unique as we can only have 1 customer being 1 vendor...
CREATE TABLE vendor_and_customer (
    vendor_id INT NOT NULL UNIQUE,
    customer_id INT NOT NULL UNIQUE,
    PRIMARY KEY (vendor_id, customer_id),
    FOREIGN KEY (vendor_id) REFERENCES vendor_table (id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customer_table (id) ON DELETE CASCADE
);

-- INVOICES
CREATE TYPE sales_order_delivery AS ENUM ('Not shipped', 'Shipped', 'Delivered');

CREATE TYPE order_payment AS ENUM ('Not paid', 'Paid');

CREATE TYPE order_status AS ENUM ('Draft', 'Confirmed');

CREATE TABLE invoice_orders (
    invoice_id SERIAL PRIMARY KEY,
    reference_number VARCHAR(35),
    customer_id INT REFERENCES customer_table(id) ON UPDATE CASCADE ON DELETE NO ACTION,
    invoice_date DATE NOT NULL,
    product_quantity_rate_list JSONB[],
    amount_due INT NOT NULL,
    delivery_status sales_order_delivery,
    payment_status order_payment,
    order_status order_status,
    date_paid DATE,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES employee_table (emp_id) ON UPDATE CASCADE ON DELETE NO ACTION,
    sales_rep INT,
    FOREIGN KEY (sales_rep) REFERENCES employee_table (emp_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

--PURCHASE ORDERS
CREATE TYPE purchase_order_delivery AS ENUM ('Not Received', 'Received');

-- We should be able to add attachments (PDFs) to invoices
CREATE TABLE purchase_orders (
    purchase_id SERIAL PRIMARY KEY,
    vendor_id INT REFERENCES vendor_table(id) ON UPDATE CASCADE ON DELETE NO ACTION,
    purchase_date DATE NOT NULL,
    delivery_date DATE,
    product_quantity_rate_list JSONB[],
    amount_due INT NOT NULL,
    delivery_status purchase_order_delivery,
    payment_status order_payment,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES employee_table (emp_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- PRODUCTS TABLE 
CREATE TABLE products_table (
    item_number SERIAL PRIMARY KEY,
    product_name VARCHAR(35) NOT NULL,
    din VARCHAR(35) UNIQUE NOT NULL
);

-- UNIQUE PRODUCTS TABLE
CREATE TABLE unique_products_table (
    item_number INT NOT NULL,
    vendor_id INT NOT NULL,
    lot INT NOT NULL, 
    exp_date DATE,
    quantity_on_hand INT NOT NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendor_table (id) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (item_number) REFERENCES products_table (item_number) ON UPDATE CASCADE ON DELETE NO ACTION,
    PRIMARY KEY (item_number, vendor_id, lot)
);
-- created_by INT,
-- FOREIGN KEY (created_by) REFERENCES employee_table (emp_id) ON UPDATE CASCADE ON DELETE NO ACTION,

-- Trigger to create a new row in employee_table when user_permission is changed to 'Employee' or 'Admin'
CREATE FUNCTION create_employee_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.permission IN ('Employee', 'Admin') AND OLD.permission = 'Unauthorized' THEN
        -- Check if an entry for the user already exists in employee_table
        IF EXISTS (SELECT 1 FROM employee_table WHERE emp_id = NEW.id) THEN
            -- Set is_active to TRUE for the existing employee
            UPDATE employee_table SET is_active = TRUE WHERE emp_id = NEW.id;
            RAISE NOTICE 'Employee w/ id % has had active status set to true!',
            NEW.id;
        ELSE
            -- Create a new entry in employee_table if it doesn't exist
            RAISE NOTICE 'Employee entity has been created for User w/ id %',
            NEW.id;
            INSERT INTO employee_table(emp_id) VALUES (NEW.id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the existing trigger to use the modified function
CREATE TRIGGER create_employee_trigger
BEFORE UPDATE ON user_table
FOR EACH ROW
EXECUTE FUNCTION create_employee_trigger_function();

-- Trigger to set is_active to FALSE when user_permission is changed to 'Unauthorized'
CREATE FUNCTION deactivate_employee_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.permission = 'Unauthorized' AND OLD.permission != 'Unauthorized' THEN
        UPDATE employee_table SET is_active = FALSE WHERE emp_id = NEW.id;
        RAISE NOTICE 'Employee w/ id % has had active status set to false!',
            NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deactivate_employee_trigger
BEFORE UPDATE ON user_table
FOR EACH ROW
EXECUTE FUNCTION deactivate_employee_trigger_function();

-- Creating default user:-- Inserting a realistic entry into user_table (PASSWORD is Admin123! but hashed!)
-- ! Since the password is "salted" and hashed (not encrypted) we cannot just store the plain text and expect our Auth to work, or even a previously hashed version of the same password....
-- TODO: Find a way to pre-enter the admin users password. (entering Test123! on the UI while correct will not work right now, for instance).
INSERT INTO user_table (email, first_name, last_name, phone, password)
VALUES
  ('admin@openims.com', 'Admin', 'User', '+1234567890', 'Test123!');

-- Updating the permission to 'Admin' for the user with a specific email (will cause trigger to create corresponding emp_id entry)
UPDATE user_table
SET permission = 'Admin'
WHERE email = 'admin@openims.com';
