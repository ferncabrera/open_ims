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
    emp_commission NUMERIC,
    emp_address VARCHAR(200),
    emp_notes VARCHAR(500),
    created_on DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    PRIMARY KEY (emp_id)
);

 -- CUSTOMER TABLE
CREATE TABLE customer_table (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    company_name VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    net_terms INT,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES employee_table (emp_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- VENDOR TABLE
CREATE TABLE vendor_table (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    company_name VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    net_terms INT,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES employee_table (emp_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- CUSTOMER AND VENDOR ADDRESSES
CREATE TYPE address_type AS ENUM ('Shipping', 'Billing');

CREATE TABLE customer_addresses (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    address address_type NOT NULL,
    customer_address_name VARCHAR(50) NOT NULL,
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
    vendor_address_name VARCHAR(50) NOT NULL,
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
    amount_due NUMERIC NOT NULL,
    delivery_status sales_order_delivery,
    payment_status order_payment,
    order_status order_status,
    date_paid DATE,
    date_due DATE,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES employee_table (emp_id) ON UPDATE CASCADE ON DELETE NO ACTION,
    sales_rep INT,
    FOREIGN KEY (sales_rep) REFERENCES employee_table (emp_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

--PURCHASE ORDERS
CREATE TYPE purchase_order_delivery AS ENUM ('Not received', 'Received');

-- We should be able to add attachments (PDFs) to invoices
CREATE TABLE purchase_orders (
    purchase_id SERIAL PRIMARY KEY,
    vendor_id INT REFERENCES vendor_table(id) ON UPDATE CASCADE ON DELETE NO ACTION,
    purchase_date DATE NOT NULL,
    delivery_date DATE,
    product_quantity_rate_list JSONB[],
    amount_due NUMERIC NOT NULL,
    delivery_status purchase_order_delivery,
    payment_status order_payment,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES employee_table (emp_id) ON UPDATE CASCADE ON DELETE NO ACTION
);

-- PRODUCTS TABLE 
CREATE TABLE products_table (
    item_number SERIAL PRIMARY KEY,
    product_name VARCHAR(35) NOT NULL,
    taxable BOOLEAN DEFAULT FALSE NOT NULL,
    rate NUMERIC NOT NULL DEFAULT 0,
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
    CONSTRAINT unique_product_id PRIMARY KEY (item_number, vendor_id, lot)
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
            RAISE INFO '% % (email: %) is now an active employee!',
            NEW.first_name,
            NEW.last_name,
            NEW.email;
        ELSE
            -- Create a new entry in employee_table if it doesn't exist
            RAISE INFO '% % (email: %) is now an active employee!',
            NEW.first_name,
            NEW.last_name,
            NEW.email;
            INSERT INTO employee_table(emp_id, created_on) VALUES (NEW.id, CURRENT_DATE);
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
        RAISE INFO '% % (email: %) is no longer an active employee!',
            NEW.first_name,
            NEW.last_name,
            NEW.email;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deactivate_employee_trigger
BEFORE UPDATE ON user_table
FOR EACH ROW
EXECUTE FUNCTION deactivate_employee_trigger_function();

INSERT INTO user_table (email, first_name, last_name, phone, password)
VALUES
  ('admin@openims.com', 'Admin', 'User', '+1234567890', '$2a$12$e0w2laqgrHXW8IB1rREpIeRWl2chvvny/0ihow1jo47CzxJcxHZhu');

-- Updating the permission to 'Admin' for the user with a specific email (will cause trigger to create corresponding emp_id entry)
UPDATE user_table
SET permission = 'Admin'
WHERE email = 'admin@openims.com';

DO $$ 
BEGIN
  -- Additional Users with 'Employee' permission
  INSERT INTO user_table (email, first_name, last_name, phone, password, permission)
  VALUES
    ('employee1@openims.com', 'Employee', 'One', '+1234567891', '$2a$12$e0w2laqgrHXW8IB1rREpIeRWl2chvvny/0ihow1jo47CzxJcxHZhu', 'Unauthorized'),
    ('employee2@openims.com', 'Employee', 'Two', '+1234567892', '$2a$12$e0w2laqgrHXW8IB1rREpIeRWl2chvvny/0ihow1jo47CzxJcxHZhu', 'Unauthorized'),
    ('employee3@openims.com', 'Employee', 'Three', '+1234567893', '$2a$12$e0w2laqgrHXW8IB1rREpIeRWl2chvvny/0ihow1jo47CzxJcxHZhu', 'Unauthorized'),
    ('employee4@openims.com', 'Employee', 'Four', '+1234567894', '$2a$12$e0w2laqgrHXW8IB1rREpIeRWl2chvvny/0ihow1jo47CzxJcxHZhu', 'Unauthorized'),
    ('employee5@openims.com', 'Employee', 'Five', '+1234567895', '$2a$12$e0w2laqgrHXW8IB1rREpIeRWl2chvvny/0ihow1jo47CzxJcxHZhu', 'Unauthorized');

    UPDATE user_table
    SET permission = 'Employee'
    WHERE first_name = 'Employee';

  -- Additional Customers and Vendors
  -- Note: Some customers are also vendors (vendor_and_customer table)
  INSERT INTO customer_table (email, first_name, last_name, company_name, phone, net_terms, created_by)
  VALUES
    ('customer1@openims.com', 'Customer', 'One', 'Customer One', '+1234567901', 30, 5),
    ('customer2@openims.com', 'Customer', 'Two', 'Customer Two', '+1234567902', 45, 2),
    ('customer3@openims.com', 'Customer', 'Three', 'Customer Three', '+1234567903', 45, 4),
    ('customer4@openims.com', 'Customer', 'Four', 'Customer Four', '+1234567904', 45, 4),
    ('customer5@openims.com', 'Customer', 'Five', 'Customer Five', '+1234567905', 45, 2),
    ('customer6@openims.com', 'Customer', 'Six', 'Customer Six', '+1234567906', 45, 6),
    ('customer7@openims.com', 'Customer', 'Seven', 'Customer Seven', '+1234567907', 45, 5),
    ('customer8@openims.com', 'Customer', 'Eight', 'Customer Eight', '+1234567908', 30, 2),
    ('customer9@openims.com', 'Customer', 'Nine', 'Customer Nine', '+1234567909', 30, 4),
    ('customer10@openims.com', 'Customer', 'Ten', 'Customer Ten', '+1234567910', 30, 4),
    ('customer11@openims.com', 'Customer', 'Eleven', 'Customer Eleven', '+1234567911', 30, 2),
    ('customer12@openims.com', 'Customer', 'Twelve', 'Customer Twelve', '+1234567912', 30, 6),
    ('customer13@openims.com', 'Customer', 'Thirteen', 'Customer Thirteen', '+1234567913', 30, 5),
    ('customer14@openims.com', 'Customer', 'Fourteen', 'Customer Fourteen', '+1234567914', 30, 2),
    ('customer15@openims.com', 'Customer', 'Fifteen', 'Customer Fifteen', '+1234567915', 45, 4),
    ('customer16@openims.com', 'Customer', 'Sixteen', 'Customer Sixteen', '+1234567916', 45, 4),
    ('customer17@openims.com', 'Customer', 'Seventeen', 'Customer Seventeen', '+1234567917', 45, 2),
    ('customer18@openims.com', 'Customer', 'Eighteen', 'Customer Eighteen', '+1234567918', 45, 6),
    ('customer19@openims.com', 'Customer', 'Nineteen', 'Customer Nineteen', '+1234567919', 45, 1),
    ('customer20@openims.com', 'Customer', 'Twenty', 'Customer Twenty', '+1234567920', 45, 2),
    ('customer21@openims.com', 'Customer', 'Twenty-One', 'Customer Twenty-One', '+1234567921', 30, 4),
    ('customer22@openims.com', 'Customer', 'Twenty-Two', 'Customer Twenty-Two', '+1234567922', 30, 4),
    ('customer23@openims.com', 'Customer', 'Twenty-Three', 'Customer Twenty-Three', '+1234567923', 30, 2),
    ('customer24@openims.com', 'Customer', 'Twenty-Four', 'Customer Twenty-Four', '+1234567924', 30, 6),
    ('customer25@openims.com', 'Customer', 'Twenty-Five', 'Customer Twenty-Five', '+1234567925', 30, 1),
    ('customer26@openims.com', 'Customer', 'Twenty-Six', 'Customer Twenty-Six', '+1234567926', 30, 2),
    ('customer27@openims.com', 'Customer', 'Twenty-Seven', 'Customer Twenty-Seven', '+1234567927', 30, 4),
    ('customer28@openims.com', 'Customer', 'Twenty-Eight', 'Customer Twenty-Eight', '+1234567928', 30, 4),
    ('customer29@openims.com', 'Customer', 'Twenty-Nine', 'Customer Twenty-Nine', '+1234567929', 30, 2),
    ('customer30@openims.com', 'Customer', 'Thirty', 'Customer Thirty', '+1234567930', 30, 6),
    ('customer31@openims.com', 'Customer', 'Thirty-One', 'Customer Thirty-One', '+1234567931', 30, 1),
    ('customer32@openims.com', 'Customer', 'Thirty-Two', 'Customer Thirty-Two', '+1234567932', 30, 2),
    ('customer33@openims.com', 'Customer', 'Thirty-Three', 'Customer Thirty-Three', '+1234567933', 30, 4),
    ('customer34@openims.com', 'Customer', 'Thirty-Four', 'Customer Thirty-Four', '+1234567934', 30, 4),
    ('customer35@openims.com', 'Customer', 'Thirty-Five', 'Customer Thirty-Five', '+1234567935', 30, 5),
    ('customer36@openims.com', 'Customer', 'Thirty-Six', 'Customer Thirty-Six', '+1234567936', 30, 6),
    ('customer37@openims.com', 'Customer', 'Thirty-Seven', 'Customer Thirty-Seven', '+1234567937', 30, 1),
    ('customer38@openims.com', 'Customer', 'Thirty-Eight', 'Customer Thirty-Eight', '+1234567938', 30, 2),
    ('customer39@openims.com', 'Customer', 'Thirty-Nine', 'Customer Thirty-Nine', '+1234567939', 30, 4),
    ('customer40@openims.com', 'Customer', 'Forty', 'Customer Forty', '+1234567940', 30, 4);

  INSERT INTO vendor_table (email, first_name, last_name, company_name, phone, net_terms, created_by)
  VALUES
    ('vendor1@openims.com', 'Vendor', 'One', 'Vendor One', '+1234567901', 30, 1),
    ('vendor2@openims.com', 'Vendor', 'Two', 'Vendor Two', '+1234567902', 30, 2),
    ('vendor3@openims.com', 'Vendor', 'Three', 'Vendor Three', '+1234567903', 30, 3),
    ('vendor4@openims.com', 'Vendor', 'Four', 'Vendor Four', '+1234567904', 30, 4),
    ('vendor5@openims.com', 'Vendor', 'Five', 'Vendor Five', '+1234567905', 30, 5),
    ('vendor6@openims.com', 'Vendor', 'Six', 'Vendor Six', '+1234567906', 30, 6),
    ('vendor7@openims.com', 'Vendor', 'Seven', 'Vendor Seven', '+1234567907', 30, 1),
    ('vendor8@openims.com', 'Vendor', 'Eight', 'Vendor Eight', '+1234567908', 30, 2),
    ('vendor9@openims.com', 'Vendor', 'Nine', 'Vendor Nine', '+1234567909', 45, 3),
    ('vendor10@openims.com', 'Vendor', 'Ten', 'Vendor Ten', '+1234567910', 45, 4),
    ('vendor11@openims.com', 'Vendor', 'Eleven', 'Vendor Eleven', '+1234567911', 45, 5),
    ('vendor12@openims.com', 'Vendor', 'Twelve', 'Vendor Twelve', '+1234567912', 45, 6),
    ('vendor13@openims.com', 'Vendor', 'Thirteen', 'Vendor Thirteen', '+1234567913', 45, 1),
    ('vendor14@openims.com', 'Vendor', 'Fourteen', 'Vendor Fourteen', '+1234567914', 30, 2),
    ('vendor15@openims.com', 'Vendor', 'Fifteen', 'Vendor Fifteen', '+1234567915', 30, 3),
    ('vendor16@openims.com', 'Vendor', 'Sixteen', 'Vendor Sixteen', '+1234567916', 30, 4),
    ('vendor17@openims.com', 'Vendor', 'Seventeen', 'Vendor Seventeen', '+1234567917', 30, 5),
    ('vendor18@openims.com', 'Vendor', 'Eighteen', 'Vendor Eighteen', '+1234567918', 30, 6),
    ('vendor19@openims.com', 'Vendor', 'Nineteen', 'Vendor Nineteen', '+1234567919', 30, 1),
    ('vendor20@openims.com', 'Vendor', 'Twenty', 'Vendor Twenty', '+1234567920', 30, 2),
    ('vendor21@openims.com', 'Vendor', 'Twenty-One', 'Vendor Twenty-One', '+1234567921', 45, 3),
    ('vendor22@openims.com', 'Vendor', 'Twenty-Two', 'Vendor Twenty-Two', '+1234567922', 45, 4),
    ('vendor23@openims.com', 'Vendor', 'Twenty-Three', 'Vendor Twenty-Three', '+1234567923', 45, 5),
    ('vendor24@openims.com', 'Vendor', 'Twenty-Four', 'Vendor Twenty-Four', '+1234567924', 45, 6),
    ('vendor25@openims.com', 'Vendor', 'Twenty-Five', 'Vendor Twenty-Five', '+1234567925', 45, 1),
    ('vendor26@openims.com', 'Vendor', 'Twenty-Six', 'Vendor Twenty-Six', '+1234567926', 30, 2),
    ('vendor27@openims.com', 'Vendor', 'Twenty-Seven', 'Vendor Twenty-Seven', '+1234567927', 30, 3),
    ('vendor28@openims.com', 'Vendor', 'Twenty-Eight', 'Vendor Twenty-Eight', '+1234567928', 30, 4),
    ('vendor29@openims.com', 'Vendor', 'Twenty-Nine', 'Vendor Twenty-Nine', '+1234567929', 30, 5),
    ('vendor30@openims.com', 'Vendor', 'Thirty', 'Vendor Thirty', '+1234567930', 30, 6),
    ('vendor31@openims.com', 'Vendor', 'Thirty-One', 'Vendor Thirty-One', '+1234567931', 30, 1),
    ('vendor32@openims.com', 'Vendor', 'Thirty-Two', 'Vendor Thirty-Two', '+1234567932', 30, 2),
    ('vendor33@openims.com', 'Vendor', 'Thirty-Three', 'Vendor Thirty-Three', '+1234567933', 30, 3),
    ('vendor34@openims.com', 'Vendor', 'Thirty-Four', 'Vendor Thirty-Four', '+1234567934', 30, 4),
    ('vendor35@openims.com', 'Vendor', 'Thirty-Five', 'Vendor Thirty-Five', '+1234567935', 30, 5),
    ('vendor36@openims.com', 'Vendor', 'Thirty-Six', 'Vendor Thirty-Six', '+1234567936', 30, 6),
    ('vendor37@openims.com', 'Vendor', 'Thirty-Seven', 'Vendor Thirty-Seven', '+1234567937', 30, 1),
    ('vendor38@openims.com', 'Vendor', 'Thirty-Eight', 'Vendor Thirty-Eight', '+1234567938', 30, 2),
    ('vendor39@openims.com', 'Vendor', 'Thirty-Nine', 'Vendor Thirty-Nine', '+1234567939', 30, 3),
    ('vendor40@openims.com', 'Vendor', 'Forty', 'Vendor Forty', '+1234567940', 30, 4);

  -- Link some customers as vendors and vice versa
  INSERT INTO vendor_and_customer (vendor_id, customer_id)
  VALUES
    (1, 5),
    (2, 4),
    (3, 3),
    (6, 7),
    (12, 15),
    (22, 9),
    (32, 8),
    (17, 35),
    (39, 40);

INSERT INTO products_table (product_name, din, taxable, rate)
VALUES
    ('Product One', 'DIN1', TRUE, 5),
    ('Product Two', 'DIN2', FALSE, 10),
    ('Product Three', 'DIN3', TRUE, 15),
    ('Product Four', 'DIN4', FALSE, 20),
    ('Product Five', 'DIN5', TRUE, 25),
    ('Product Six', 'DIN6', FALSE, 30),
    ('Product Seven', 'DIN7', TRUE, 5),
    ('Product Eight', 'DIN8', FALSE, 10),
    ('Product Nine', 'DIN9', TRUE, 15),
    ('Product Ten', 'DIN10', FALSE, 20),
    ('Product Eleven', 'DIN11', TRUE, 25),
    ('Product Twelve', 'DIN12', FALSE, 30),
    ('Product Thirteen', 'DIN13', TRUE, 5),
    ('Product Fourteen', 'DIN14', FALSE, 10),
    ('Product Fifteen', 'DIN15', TRUE, 15),
    ('Product Sixteen', 'DIN16', FALSE, 20),
    ('Product Seventeen', 'DIN17', TRUE, 25),
    ('Product Eighteen', 'DIN18', FALSE, 30),
    ('Product Nineteen', 'DIN19', TRUE, 5),
    ('Product Twenty', 'DIN20', FALSE, 10),
    ('Product Twenty-One', 'DIN21', TRUE, 15),
    ('Product Twenty-Two', 'DIN22', FALSE, 20),
    ('Product Twenty-Three', 'DIN23', TRUE, 25),
    ('Product Twenty-Four', 'DIN24', FALSE, 30),
    ('Product Twenty-Five', 'DIN25', TRUE, 5),
    ('Product Twenty-Six', 'DIN26', FALSE, 10),
    ('Product Twenty-Seven', 'DIN27', TRUE, 15),
    ('Product Twenty-Eight', 'DIN28', FALSE, 20),
    ('Product Twenty-Nine', 'DIN29', TRUE, 25),
    ('Product Thirty', 'DIN30', FALSE, 30),
    ('Product Thirty-One', 'DIN31', TRUE, 5),
    ('Product Thirty-Two', 'DIN32', FALSE, 10),
    ('Product Thirty-Three', 'DIN33', TRUE, 15),
    ('Product Thirty-Four', 'DIN34', FALSE, 20),
    ('Product Thirty-Five', 'DIN35', TRUE, 25),
    ('Product Thirty-Six', 'DIN36', FALSE, 30),
    ('Product Thirty-Seven', 'DIN37', TRUE, 5),
    ('Product Thirty-Eight', 'DIN38', FALSE, 10),
    ('Product Thirty-Nine', 'DIN39', TRUE, 15),
    ('Product Forty', 'DIN40', FALSE, 20);

  WITH ranked_products AS (
    SELECT
      p.item_number,
      v.id AS vendor_id,
      floor(random() * 90000 + 10000)::integer AS lot,
      CURRENT_DATE + (random() * 1100)::integer AS exp_date,
      floor(random() * 100)::integer AS quantity_on_hand,
      ROW_NUMBER() OVER (PARTITION BY p.item_number ORDER BY random()) AS vendor_rank
    FROM products_table p
    CROSS JOIN vendor_table v
    WHERE random() < 0.5 -- Adjust the probability as needed
  )
  INSERT INTO unique_products_table (item_number, vendor_id, lot, exp_date, quantity_on_hand)
  SELECT
    item_number,
    vendor_id,
    lot,
    exp_date,
    quantity_on_hand
  FROM ranked_products
  WHERE vendor_rank <= 5;

  -- Purchase Orders
  INSERT INTO purchase_orders (vendor_id, purchase_date, delivery_date, product_quantity_rate_list, amount_due, delivery_status, payment_status, created_by)
  SELECT
    v.id,
    CURRENT_DATE - (random() * 1100)::integer AS purchase_date,
    CURRENT_DATE + (random() * 100)::integer AS delivery_date,
      ARRAY(
      SELECT 
          JSONB_BUILD_OBJECT(
              'item_number', item.item_number,
              'quantity', item.quantity,
              'rate', item.rate
          )
      FROM (
          SELECT 
              up.item_number,
              FLOOR(random() * 9) + 1 AS quantity,
              15.75 AS rate
          FROM unique_products_table up
          WHERE up.vendor_id = v.created_by
          LIMIT FLOOR(random() * 9) + 1 -- test
      ) item
    ) AS product_quantity_rate_list,
    SUM((item.quantity * item.rate)::numeric) AS amount_due,
    CASE WHEN ROW_NUMBER() OVER (PARTITION BY v.id ORDER BY series) % 2 = 0 THEN 'Received'::purchase_order_delivery ELSE 'Not received'::purchase_order_delivery END AS delivery_status,
    CASE WHEN ROW_NUMBER() OVER (PARTITION BY v.id ORDER BY series) % 3 != 0 THEN 'Paid'::order_payment ELSE 'Not paid'::order_payment END AS payment_status,
    FLOOR(random() * 6) + 1 AS created_by
  FROM vendor_table v
  CROSS JOIN LATERAL (
      SELECT 
          up.item_number,
          FLOOR(random() * 9) + 1 AS quantity,
          15.75 AS rate
      FROM unique_products_table up
      WHERE up.vendor_id = v.created_by
      LIMIT FLOOR(random() * 9) + 1
  ) item
  CROSS JOIN LATERAL generate_series(1, 100) AS series
  GROUP BY v.id, series;

  -- Invoices
  INSERT INTO invoice_orders (customer_id, invoice_date, product_quantity_rate_list, amount_due, delivery_status, payment_status, order_status, date_paid, date_due, created_by, sales_rep, reference_number)
  SELECT
      c.id,
      CURRENT_DATE - (random() * 1100)::integer AS invoice_date,
      ARRAY(
          SELECT 
              JSONB_BUILD_OBJECT(
                  'item_number', item.item_number,
                  'quantity', item.quantity,
                  'rate', item.rate
              )
          FROM (
              SELECT 
                  up.item_number,
                  FLOOR(random() * 9) + 1 AS quantity,
                  15.75 AS rate
              FROM unique_products_table up
              WHERE up.vendor_id = c.created_by
              LIMIT FLOOR(random() * 9) + 1
          ) item
      ) AS product_quantity_rate_list,
      SUM((item.quantity * item.rate)::numeric) AS amount_due,
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY series) % 3 = 0 THEN 'Shipped'::sales_order_delivery 
        WHEN ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY series) % 3 = 1 THEN 'Not shipped'::sales_order_delivery 
        ELSE 'Delivered'::sales_order_delivery 
    END AS delivery_status,
      CASE WHEN ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY series) % 2 = 0 THEN 'Paid'::order_payment ELSE 'Not paid'::order_payment END AS payment_status,
      CASE WHEN ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY series) % 3 != 0 THEN 'Confirmed'::order_status ELSE 'Draft'::order_status END AS order_status,
      CURRENT_DATE + (random() * 100)::integer AS date_paid,
      CURRENT_DATE + (random() * 100)::integer AS date_due,
      FLOOR(random() * 6) + 1 AS created_by,
      FLOOR(random() * 6) + 1 AS sales_rep,
      to_char(FLOOR(random() * 999999999), 'FM000000000') AS reference_number
  FROM customer_table c
  CROSS JOIN LATERAL (
      SELECT 
          up.item_number,
          FLOOR(random() * 9) + 1 AS quantity,
          15.75 AS rate
      FROM unique_products_table up
      WHERE up.vendor_id = c.created_by
      LIMIT FLOOR(random() * 9) + 1
  ) item
  CROSS JOIN LATERAL generate_series(1, 100) AS series -- Adjust the number of invoices as needed
  GROUP BY c.id, series;


  -- Insert addresses for customers
  INSERT INTO customer_addresses (customer_id, address, customer_address_name, street_address_line1, street_address_line2, city, province, postal, country)
  VALUES
  (1, 'Shipping', 'Howard', '123 Main St', 'Apt 1', 'CustomerCityA', 'CustomerProvinceA', '12345', 'CustomerCountryA'),
  (1, 'Billing', 'Harold', '456 Oak St', 'Suite 101', 'CustomerCityB', 'CustomerProvinceB', '67890', 'CustomerCountryB'),

  (2, 'Shipping', 'Fernando', '789 Elm St', 'Unit 5', 'CustomerCityC', 'CustomerProvinceC', '23456', 'CustomerCountryC'),

  (3, 'Billing', 'Oliver', '101 Pine St', 'Floor 3', 'CustomerCityD', 'CustomerProvinceD', '78901', 'CustomerCountryD'),

  (4, 'Shipping', 'Mufasa', '202 Maple St', 'Apt 7', 'CustomerCityE', 'CustomerProvinceE', '23456', 'CustomerCountryE'),
  (4, 'Billing', 'George', '303 Cedar St', 'Suite 202', 'CustomerCityF', 'CustomerProvinceF', '56789', 'CustomerCountryF'),

  (5, 'Shipping', 'Henry', '404 Birch St', 'Unit 11', 'CustomerCityG', 'CustomerProvinceG', '12345', 'CustomerCountryG'),

  (6, 'Billing', 'Jacob', '505 Pine St', 'Floor 5', 'CustomerCityH', 'CustomerProvinceH', '67890', 'CustomerCountryH'),

  (7, 'Shipping', 'Vlad', '606 Oak St', 'Apt 15', 'CustomerCityI', 'CustomerProvinceI', '23456', 'CustomerCountryI'),

  (8, 'Billing', 'Juan', '707 Maple St', 'Suite 303', 'CustomerCityJ', 'CustomerProvinceJ', '78901', 'CustomerCountryJ'),

  (9, 'Shipping', 'Pablo', '808 Cedar St', 'Unit 21', 'CustomerCityK', 'CustomerProvinceK', '12345', 'CustomerCountryK'),

  (10, 'Billing', 'Roger', '909 Birch St', 'Floor 7', 'CustomerCityL', 'CustomerProvinceL', '67890', 'CustomerCountryL'),

  (11, 'Shipping', 'Yuri', '111 Main St', 'Apt 11', 'CustomerCityM', 'CustomerProvinceM', '12345', 'CustomerCountryM'),
  (11, 'Billing', 'Wilhelm', '222 Oak St', 'Suite 222', 'CustomerCityN', 'CustomerProvinceN', '67890', 'CustomerCountryN'),
  (11, 'Shipping', 'Anastasia', '333 Elm St', 'Unit 33', 'CustomerCityO', 'CustomerProvinceO', '23456', 'CustomerCountryO'),

  (12, 'Billing', 'Lucy', '444 Pine St', 'Floor 44', 'CustomerCityP', 'CustomerProvinceP', '78901', 'CustomerCountryP'),
  (12, 'Shipping', 'Georgia', '555 Maple St', 'Apt 55', 'CustomerCityQ', 'CustomerProvinceQ', '23456', 'CustomerCountryQ'),

  (13, 'Billing', 'Georgina', '666 Cedar St', 'Suite 66', 'CustomerCityR', 'CustomerProvinceR', '56789', 'CustomerCountryR'),
  (13, 'Shipping', 'July', '777 Birch St', 'Unit 77', 'CustomerCityS', 'CustomerProvinceS', '12345', 'CustomerCountryS'),

  (14, 'Shipping', 'Meghan', '888 Oak St', 'Apt 88', 'CustomerCityT', 'CustomerProvinceT', '67890', 'CustomerCountryT'),

  (15, 'Billing', 'Vanessa', '999 Elm St', 'Floor 99', 'CustomerCityU', 'CustomerProvinceU', '23456', 'CustomerCountryU'),
  (15, 'Shipping', 'Ted', '1010 Pine St', 'Suite 1010', 'CustomerCityV', 'CustomerProvinceV', '78901', 'CustomerCountryV'),

  (16, 'Billing', 'Howard', '1111 Maple St', 'Unit 111', 'CustomerCityW', 'CustomerProvinceW', '12345', 'CustomerCountryW'),
  (16, 'Shipping', 'Harold', '1212 Cedar St', 'Floor 12', 'CustomerCityX', 'CustomerProvinceX', '67890', 'CustomerCountryX'),

  (17, 'Billing', 'Fernando', '1313 Birch St', 'Apt 1313', 'CustomerCityY', 'CustomerProvinceY', '23456', 'CustomerCountryY'),

  (18, 'Shipping', 'Oliver', '1414 Oak St', 'Suite 1414', 'CustomerCityZ', 'CustomerProvinceZ', '56789', 'CustomerCountryZ'),
  (19, 'Shipping', 'Mufasa', '1515 Elm St', 'Unit 15', 'CustomerCityAA', 'CustomerProvinceAA', '12345', 'CustomerCountryAA'),
  (19, 'Billing', 'George', '1616 Pine St', 'Floor 16', 'CustomerCityAB', 'CustomerProvinceAB', '67890', 'CustomerCountryAB'),

  (20, 'Shipping', 'Henry', '1717 Maple St', 'Apt 17', 'CustomerCityAC', 'CustomerProvinceAC', '23456', 'CustomerCountryAC'),
  (20, 'Billing', 'Jacob', '1818 Cedar St', 'Suite 1818', 'CustomerCityAD', 'CustomerProvinceAD', '78901', 'CustomerCountryAD'),

  (21, 'Shipping', 'Vlad', '1929 Oak St', 'Apt 21', 'CustomerCityAE', 'CustomerProvinceAE', '12345', 'CustomerCountryAE'),
  (21, 'Billing', 'Juan', '2020 Elm St', 'Unit 20', 'CustomerCityAF', 'CustomerProvinceAF', '67890', 'CustomerCountryAF'),

  (22, 'Shipping', 'Pablo', '2121 Maple St', 'Floor 22', 'CustomerCityAG', 'CustomerProvinceAG', '23456', 'CustomerCountryAG'),
  (22, 'Billing', 'Roger', '2222 Cedar St', 'Apt 22', 'CustomerCityAH', 'CustomerProvinceAH', '78901', 'CustomerCountryAH'),

  (23, 'Shipping', 'Yuri', '2323 Oak St', 'Suite 23', 'CustomerCityAI', 'CustomerProvinceAI', '12345', 'CustomerCountryAI'),
  (23, 'Billing', 'Wilhelm', '2424 Elm St', 'Unit 24', 'CustomerCityAJ', 'CustomerProvinceAJ', '67890', 'CustomerCountryAJ'),

  (24, 'Shipping', 'Anastasia', '2525 Maple St', 'Floor 25', 'CustomerCityAK', 'CustomerProvinceAK', '23456', 'CustomerCountryAK'),
  (24, 'Billing', 'Lucy', '2626 Cedar St', 'Apt 26', 'CustomerCityAL', 'CustomerProvinceAL', '78901', 'CustomerCountryAL'),

  (25, 'Shipping', 'Georgia', '2525 Oak St', 'Apt 25', 'CustomerCityAM', 'CustomerProvinceAM', '12345', 'CustomerCountryAM'),
  (25, 'Billing', 'Georgina', '2626 Elm St', 'Floor 26', 'CustomerCityAN', 'CustomerProvinceAN', '67890', 'CustomerCountryAN'),

  (26, 'Shipping', 'July', '2727 Maple St', 'Unit 27', 'CustomerCityAO', 'CustomerProvinceAO', '23456', 'CustomerCountryAO'),
  (26, 'Billing', 'Meghan', '2828 Cedar St', 'Suite 2828', 'CustomerCityAP', 'CustomerProvinceAP', '78901', 'CustomerCountryAP'),

  (27, 'Shipping', 'Ted', '2929 Oak St', 'Apt 29', 'CustomerCityAQ', 'CustomerProvinceAQ', '12345', 'CustomerCountryAQ'),
  (27, 'Billing', 'Howard', '3030 Elm St', 'Floor 30', 'CustomerCityAR', 'CustomerProvinceAR', '67890', 'CustomerCountryAR'),

  (28, 'Shipping', 'Harold', '3131 Maple St', 'Unit 31', 'CustomerCityAS', 'CustomerProvinceAS', '23456', 'CustomerCountryAS'),

  (29, 'Shipping', 'Fernando', '3333 Oak St', 'Suite 33', 'CustomerCityAU', 'CustomerProvinceAU', '12345', 'CustomerCountryAU'),
  (29, 'Billing', 'Oliver', '3434 Elm St', 'Unit 34', 'CustomerCityAV', 'CustomerProvinceAV', '67890', 'CustomerCountryAV'),

  (30, 'Shipping', 'Mufasa', '3535 Maple St', 'Floor 35', 'CustomerCityAW', 'CustomerProvinceAW', '23456', 'CustomerCountryAW'),
  (30, 'Billing', 'George', '3636 Cedar St', 'Apt 36', 'CustomerCityAX', 'CustomerProvinceAX', '78901', 'CustomerCountryAX'),
  (31, 'Shipping', 'Henry', '3636 Oak St', 'Apt 36', 'CustomerCityAY', 'CustomerProvinceAY', '12345', 'CustomerCountryAY'),
  (31, 'Billing', 'Jacob', '3737 Elm St', 'Floor 37', 'CustomerCityAZ', 'CustomerProvinceAZ', '67890', 'CustomerCountryAZ'),

  (32, 'Shipping', 'Vlad', '3838 Maple St', 'Unit 38', 'CustomerCityBA', 'CustomerProvinceBA', '23456', 'CustomerCountryBA'),
  (32, 'Billing', 'Juan', '3939 Cedar St', 'Suite 3939', 'CustomerCityBB', 'CustomerProvinceBB', '78901', 'CustomerCountryBB'),

  (33, 'Shipping', 'Pablo', '4040 Oak St', 'Apt 40', 'CustomerCityBC', 'CustomerProvinceBC', '12345', 'CustomerCountryBC'),
  (33, 'Billing', 'Roger', '4141 Elm St', 'Floor 41', 'CustomerCityBD', 'CustomerProvinceBD', '67890', 'CustomerCountryBD'),

  (34, 'Shipping', 'Yuri', '4242 Maple St', 'Unit 42', 'CustomerCityBE', 'CustomerProvinceBE', '23456', 'CustomerCountryBE'),
  (34, 'Billing', 'Wilhelm', '4343 Cedar St', 'Apt 43', 'CustomerCityBF', 'CustomerProvinceBF', '78901', 'CustomerCountryBF'),

  (35, 'Shipping', 'Anastasia', '4444 Oak St', 'Suite 44', 'CustomerCityBG', 'CustomerProvinceBG', '12345', 'CustomerCountryBG'),
  (35, 'Billing', 'Lucy', '4545 Elm St', 'Unit 45', 'CustomerCityBH', 'CustomerProvinceBH', '67890', 'CustomerCountryBH'),
  (36, 'Shipping', 'Georgia', '4646 Maple St', 'Apt 46', 'CustomerCityBI', 'CustomerProvinceBI', '23456', 'CustomerCountryBI'),

  (37, 'Shipping', 'Georgina', '4848 Oak St', 'Unit 48', 'CustomerCityBK', 'CustomerProvinceBK', '12345', 'CustomerCountryBK'),
  (37, 'Billing', 'July', '4949 Elm St', 'Suite 49', 'CustomerCityBL', 'CustomerProvinceBL', '67890', 'CustomerCountryBL'),

  (38, 'Shipping', 'Meghan', '5050 Maple St', 'Apt 50', 'CustomerCityBM', 'CustomerProvinceBM', '23456', 'CustomerCountryBM'),
  (39, 'Billing', 'Vanessa', '5151 Cedar St', 'Floor 51', 'CustomerCityBN', 'CustomerProvinceBN', '78901', 'CustomerCountryBN'),

  (39, 'Billing', 'Ted', '5353 Elm St', 'Suite 53', 'CustomerCityBP', 'CustomerProvinceBP', '67890', 'CustomerCountryBP'),

  (40, 'Shipping', 'Howard', '5454 Maple St', 'Apt 54', 'CustomerCityBQ', 'CustomerProvinceBQ', '23456', 'CustomerCountryBQ'),
  (40, 'Shipping', 'Harold', '5555 Cedar St', 'Floor 55', 'CustomerCityBR', 'CustomerProvinceBR', '78901', 'CustomerCountryBR');

  -- Insert addresses for customers
  INSERT INTO vendor_addresses (vendor_id, address, vendor_address_name, street_address_line1, street_address_line2, city, province, postal, country)
  VALUES
  (1, 'Shipping', 'Howard', '123 Main St', 'Apt 1', 'CustomerCityA', 'CustomerProvinceA', '12345', 'CustomerCountryA'),
  (1, 'Billing', 'Harold', '456 Oak St', 'Suite 101', 'CustomerCityB', 'CustomerProvinceB', '67890', 'CustomerCountryB'),

  (2, 'Shipping', 'Fernando', '789 Elm St', 'Unit 5', 'CustomerCityC', 'CustomerProvinceC', '23456', 'CustomerCountryC'),

  (3, 'Billing', 'Oliver', '101 Pine St', 'Floor 3', 'CustomerCityD', 'CustomerProvinceD', '78901', 'CustomerCountryD'),

  (4, 'Shipping', 'Mufasa', '202 Maple St', 'Apt 7', 'CustomerCityE', 'CustomerProvinceE', '23456', 'CustomerCountryE'),
  (4, 'Billing', 'George', '303 Cedar St', 'Suite 202', 'CustomerCityF', 'CustomerProvinceF', '56789', 'CustomerCountryF'),

  (5, 'Shipping', 'Henry', '404 Birch St', 'Unit 11', 'CustomerCityG', 'CustomerProvinceG', '12345', 'CustomerCountryG'),

  (6, 'Billing', 'Jacob', '505 Pine St', 'Floor 5', 'CustomerCityH', 'CustomerProvinceH', '67890', 'CustomerCountryH'),

  (7, 'Shipping', 'Vlad', '606 Oak St', 'Apt 15', 'CustomerCityI', 'CustomerProvinceI', '23456', 'CustomerCountryI'),

  (8, 'Billing', 'Juan', '707 Maple St', 'Suite 303', 'CustomerCityJ', 'CustomerProvinceJ', '78901', 'CustomerCountryJ'),

  (9, 'Shipping', 'Pablo', '808 Cedar St', 'Unit 21', 'CustomerCityK', 'CustomerProvinceK', '12345', 'CustomerCountryK'),

  (10, 'Billing', 'Roger', '909 Birch St', 'Floor 7', 'CustomerCityL', 'CustomerProvinceL', '67890', 'CustomerCountryL'),

  (11, 'Shipping', 'Yuri', '111 Main St', 'Apt 11', 'CustomerCityM', 'CustomerProvinceM', '12345', 'CustomerCountryM'),
  (11, 'Billing', 'Wilhelm', '222 Oak St', 'Suite 222', 'CustomerCityN', 'CustomerProvinceN', '67890', 'CustomerCountryN'),
  (11, 'Shipping', 'Anastasia', '333 Elm St', 'Unit 33', 'CustomerCityO', 'CustomerProvinceO', '23456', 'CustomerCountryO'),

  (12, 'Billing', 'Lucy', '444 Pine St', 'Floor 44', 'CustomerCityP', 'CustomerProvinceP', '78901', 'CustomerCountryP'),
  (12, 'Shipping', 'Georgia', '555 Maple St', 'Apt 55', 'CustomerCityQ', 'CustomerProvinceQ', '23456', 'CustomerCountryQ'),

  (13, 'Billing', 'Georgina', '666 Cedar St', 'Suite 66', 'CustomerCityR', 'CustomerProvinceR', '56789', 'CustomerCountryR'),
  (13, 'Shipping', 'July', '777 Birch St', 'Unit 77', 'CustomerCityS', 'CustomerProvinceS', '12345', 'CustomerCountryS'),

  (14, 'Shipping', 'Meghan', '888 Oak St', 'Apt 88', 'CustomerCityT', 'CustomerProvinceT', '67890', 'CustomerCountryT'),

  (15, 'Billing', 'Vanessa', '999 Elm St', 'Floor 99', 'CustomerCityU', 'CustomerProvinceU', '23456', 'CustomerCountryU'),
  (15, 'Shipping', 'Ted', '1010 Pine St', 'Suite 1010', 'CustomerCityV', 'CustomerProvinceV', '78901', 'CustomerCountryV'),

  (16, 'Billing', 'Howard', '1111 Maple St', 'Unit 111', 'CustomerCityW', 'CustomerProvinceW', '12345', 'CustomerCountryW'),
  (16, 'Shipping', 'Harold', '1212 Cedar St', 'Floor 12', 'CustomerCityX', 'CustomerProvinceX', '67890', 'CustomerCountryX'),

  (17, 'Billing', 'Fernando', '1313 Birch St', 'Apt 1313', 'CustomerCityY', 'CustomerProvinceY', '23456', 'CustomerCountryY'),

  (18, 'Shipping', 'Oliver', '1414 Oak St', 'Suite 1414', 'CustomerCityZ', 'CustomerProvinceZ', '56789', 'CustomerCountryZ'),
  (19, 'Shipping', 'Mufasa', '1515 Elm St', 'Unit 15', 'CustomerCityAA', 'CustomerProvinceAA', '12345', 'CustomerCountryAA'),
  (19, 'Billing', 'George', '1616 Pine St', 'Floor 16', 'CustomerCityAB', 'CustomerProvinceAB', '67890', 'CustomerCountryAB'),

  (20, 'Shipping', 'Henry', '1717 Maple St', 'Apt 17', 'CustomerCityAC', 'CustomerProvinceAC', '23456', 'CustomerCountryAC'),
  (20, 'Billing', 'Jacob', '1818 Cedar St', 'Suite 1818', 'CustomerCityAD', 'CustomerProvinceAD', '78901', 'CustomerCountryAD'),

  (21, 'Shipping', 'Vlad', '1929 Oak St', 'Apt 21', 'CustomerCityAE', 'CustomerProvinceAE', '12345', 'CustomerCountryAE'),
  (21, 'Billing', 'Juan', '2020 Elm St', 'Unit 20', 'CustomerCityAF', 'CustomerProvinceAF', '67890', 'CustomerCountryAF'),

  (22, 'Shipping', 'Pablo', '2121 Maple St', 'Floor 22', 'CustomerCityAG', 'CustomerProvinceAG', '23456', 'CustomerCountryAG'),
  (22, 'Billing', 'Roger', '2222 Cedar St', 'Apt 22', 'CustomerCityAH', 'CustomerProvinceAH', '78901', 'CustomerCountryAH'),

  (23, 'Shipping', 'Yuri', '2323 Oak St', 'Suite 23', 'CustomerCityAI', 'CustomerProvinceAI', '12345', 'CustomerCountryAI'),
  (23, 'Billing', 'Wilhelm', '2424 Elm St', 'Unit 24', 'CustomerCityAJ', 'CustomerProvinceAJ', '67890', 'CustomerCountryAJ'),

  (24, 'Shipping', 'Anastasia', '2525 Maple St', 'Floor 25', 'CustomerCityAK', 'CustomerProvinceAK', '23456', 'CustomerCountryAK'),
  (24, 'Billing', 'Lucy', '2626 Cedar St', 'Apt 26', 'CustomerCityAL', 'CustomerProvinceAL', '78901', 'CustomerCountryAL'),

  (25, 'Shipping', 'Georgia', '2525 Oak St', 'Apt 25', 'CustomerCityAM', 'CustomerProvinceAM', '12345', 'CustomerCountryAM'),
  (25, 'Billing', 'Georgina', '2626 Elm St', 'Floor 26', 'CustomerCityAN', 'CustomerProvinceAN', '67890', 'CustomerCountryAN'),

  (26, 'Shipping', 'July', '2727 Maple St', 'Unit 27', 'CustomerCityAO', 'CustomerProvinceAO', '23456', 'CustomerCountryAO'),
  (26, 'Billing', 'Meghan', '2828 Cedar St', 'Suite 2828', 'CustomerCityAP', 'CustomerProvinceAP', '78901', 'CustomerCountryAP'),

  (27, 'Shipping', 'Ted', '2929 Oak St', 'Apt 29', 'CustomerCityAQ', 'CustomerProvinceAQ', '12345', 'CustomerCountryAQ'),
  (27, 'Billing', 'Howard', '3030 Elm St', 'Floor 30', 'CustomerCityAR', 'CustomerProvinceAR', '67890', 'CustomerCountryAR'),

  (28, 'Shipping', 'Harold', '3131 Maple St', 'Unit 31', 'CustomerCityAS', 'CustomerProvinceAS', '23456', 'CustomerCountryAS'),

  (29, 'Shipping', 'Fernando', '3333 Oak St', 'Suite 33', 'CustomerCityAU', 'CustomerProvinceAU', '12345', 'CustomerCountryAU'),
  (29, 'Billing', 'Oliver', '3434 Elm St', 'Unit 34', 'CustomerCityAV', 'CustomerProvinceAV', '67890', 'CustomerCountryAV'),

  (30, 'Shipping', 'Mufasa', '3535 Maple St', 'Floor 35', 'CustomerCityAW', 'CustomerProvinceAW', '23456', 'CustomerCountryAW'),
  (30, 'Billing', 'George', '3636 Cedar St', 'Apt 36', 'CustomerCityAX', 'CustomerProvinceAX', '78901', 'CustomerCountryAX'),
  (31, 'Shipping', 'Henry', '3636 Oak St', 'Apt 36', 'CustomerCityAY', 'CustomerProvinceAY', '12345', 'CustomerCountryAY'),
  (31, 'Billing', 'Jacob', '3737 Elm St', 'Floor 37', 'CustomerCityAZ', 'CustomerProvinceAZ', '67890', 'CustomerCountryAZ'),

  (32, 'Shipping', 'Vlad', '3838 Maple St', 'Unit 38', 'CustomerCityBA', 'CustomerProvinceBA', '23456', 'CustomerCountryBA'),
  (32, 'Billing', 'Juan', '3939 Cedar St', 'Suite 3939', 'CustomerCityBB', 'CustomerProvinceBB', '78901', 'CustomerCountryBB'),

  (33, 'Shipping', 'Pablo', '4040 Oak St', 'Apt 40', 'CustomerCityBC', 'CustomerProvinceBC', '12345', 'CustomerCountryBC'),
  (33, 'Billing', 'Roger', '4141 Elm St', 'Floor 41', 'CustomerCityBD', 'CustomerProvinceBD', '67890', 'CustomerCountryBD'),

  (34, 'Shipping', 'Yuri', '4242 Maple St', 'Unit 42', 'CustomerCityBE', 'CustomerProvinceBE', '23456', 'CustomerCountryBE'),
  (34, 'Billing', 'Wilhelm', '4343 Cedar St', 'Apt 43', 'CustomerCityBF', 'CustomerProvinceBF', '78901', 'CustomerCountryBF'),

  (35, 'Shipping', 'Anastasia', '4444 Oak St', 'Suite 44', 'CustomerCityBG', 'CustomerProvinceBG', '12345', 'CustomerCountryBG'),
  (35, 'Billing', 'Lucy', '4545 Elm St', 'Unit 45', 'CustomerCityBH', 'CustomerProvinceBH', '67890', 'CustomerCountryBH'),
  (36, 'Shipping', 'Georgia', '4646 Maple St', 'Apt 46', 'CustomerCityBI', 'CustomerProvinceBI', '23456', 'CustomerCountryBI'),

  (37, 'Shipping', 'Georgina', '4848 Oak St', 'Unit 48', 'CustomerCityBK', 'CustomerProvinceBK', '12345', 'CustomerCountryBK'),
  (37, 'Billing', 'July', '4949 Elm St', 'Suite 49', 'CustomerCityBL', 'CustomerProvinceBL', '67890', 'CustomerCountryBL'),

  (38, 'Shipping', 'Meghan', '5050 Maple St', 'Apt 50', 'CustomerCityBM', 'CustomerProvinceBM', '23456', 'CustomerCountryBM'),
  (39, 'Billing', 'Vanessa', '5151 Cedar St', 'Floor 51', 'CustomerCityBN', 'CustomerProvinceBN', '78901', 'CustomerCountryBN'),

  (39, 'Billing', 'Ted', '5353 Elm St', 'Suite 53', 'CustomerCityBP', 'CustomerProvinceBP', '67890', 'CustomerCountryBP'),

  (40, 'Shipping', 'Howard', '5454 Maple St', 'Apt 54', 'CustomerCityBQ', 'CustomerProvinceBQ', '23456', 'CustomerCountryBQ'),
  (40, 'Shipping', 'Harold', '5555 Cedar St', 'Floor 55', 'CustomerCityBR', 'CustomerProvinceBR', '78901', 'CustomerCountryBR');

END $$;