/* Replace with your SQL CREATE commands */

-- USER TABLE
CREATE TYPE user_permission AS ENUM ('Admin', 'Employee', 'Customer', 'Vendor', 'Unauthorized');

CREATE TABLE user_table (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    permission user_permission DEFAULT 'Unauthorized' NOT NULL,
    password VARCHAR(128) NOT NULL CHECK (Password ~ '^.*(?=.{8,64})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).*$')
);

CREATE TABLE employee_table (
    id SERIAL PRIMARY KEY,
    emp_name VARCHAR(50),
    emp_email VARCHAR(50),
    emp_phone VARCHAR(15),
    emp_sin VARCHAR(15),
    hourly_rate INT,
    commision INT,
    emp_address VARCHAR(200),
    notes VARCHAR(500)
);


 -- CUSTOMER TABLE
CREATE TABLE customer_table (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    company_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    created_by INT,
    net_terms INT,
    FOREIGN KEY (created_by) REFERENCES user_table (id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- VENDOR TABLE
CREATE TABLE vendor_table (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    company_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    created_by INT,
    net_terms INT,
    FOREIGN KEY (created_by) REFERENCES user_table (id) ON UPDATE CASCADE ON DELETE NO ACTION
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
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES user_table (id) ON UPDATE CASCADE ON DELETE NO ACTION,
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
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES user_table (id) ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (vendor_id) REFERENCES vendor_table(id) ON DELETE CASCADE
);

-- CUSTOMER AND VENDOR CONNECTION (for customers that also vendor & vice versa)
CREATE TABLE vendor_and_customer (
    vendor_id INT NOT NULL,
    customer_id INT NOT NULL,
    PRIMARY KEY (vendor_id, customer_id),
    FOREIGN KEY (vendor_id) REFERENCES vendor_table (id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customer_table (id) ON DELETE CASCADE
);

-- INVOICES
CREATE TYPE sales_order_delivery AS ENUM ('Not shipped', 'Shipped', 'Delivered');

CREATE TYPE order_payment AS ENUM ('Not paid', 'Paid');

CREATE TYPE order_status AS ENUM ('Draft', 'Confirmed');

CREATE TABLE invoice_orders (
  id SERIAL PRIMARY KEY,
  reference_number VARCHAR(35),
  customer_id INT REFERENCES customer_table(id) ON UPDATE CASCADE ON DELETE NO ACTION,
  invoice_date DATE NOT NULL,
  product_quantity_rate_list JSONB[],
  delivery_status sales_order_delivery,
  payment_status order_payment,
  order_status order_status,
  payment_due DATE,
  date_paid DATE,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES user_table (id) ON UPDATE CASCADE ON DELETE NO ACTION,
  sales_rep INT,
  FOREIGN KEY (sales_rep) REFERENCES employee_table (id) ON UPDATE CASCADE ON DELETE NO ACTION
);

--PURCHASE ORDERS
CREATE TYPE purchase_order_delivery AS ENUM ('Not Received', 'Received');

CREATE TABLE purchase_orders (
  id SERIAL PRIMARY KEY,
  reference_number VARCHAR(35),
  vendor_id INT REFERENCES vendor_table(id) ON UPDATE CASCADE ON DELETE NO ACTION,
  purchase_date DATE NOT NULL,
  product_quantity_rate_list JSONB[],
  delivery_status purchase_order_delivery,
  payment_status order_payment,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES user_table (id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- PRODUCTS TABLE 
CREATE TABLE products_table (
item_number INT NOT NULL,
vendor_id  INT NOT NULL,
lot INT NOT NULL, 
product_name VARCHAR(35) NOT NULL,
exp_date DATE,
din VARCHAR(35) NOT NULL,
Quantity_on_hand INT NOT NULL,
created_by INT,
FOREIGN KEY (vendor_id) REFERENCES vendor_table (id) ON UPDATE CASCADE ON DELETE NO ACTION,
FOREIGN KEY (created_by) REFERENCES user_table (id) ON UPDATE CASCADE ON DELETE NO ACTION,
PRIMARY KEY (item_number, vendor_id, lot)
);