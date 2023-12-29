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
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    PRIMARY KEY (emp_id)
);

 -- CUSTOMER TABLE
CREATE TABLE customer_table (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
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
    email VARCHAR(100) UNIQUE NOT NULL,
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
    amount_due NUMERIC NOT NULL,
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

  -- Products and Unique Products
  INSERT INTO products_table (product_name, din)
  VALUES
    ('Product One', 'DIN1'),
    ('Product Two', 'DIN2'),
    ('Product Three', 'DIN3'),
    ('Product Four', 'DIN4'),
    ('Product Five', 'DIN5'),
    ('Product Six', 'DIN6'),
    ('Product Seven', 'DIN7'),
    ('Product Eight', 'DIN8'),
    ('Product Nine', 'DIN9'),
    ('Product Ten', 'DIN10'),
    ('Product Eleven', 'DIN11'),
    ('Product Twelve', 'DIN12'),
    ('Product Thirteen', 'DIN13'),
    ('Product Fourteen', 'DIN14'),
    ('Product Fifteen', 'DIN15'),
    ('Product Sixteen', 'DIN16'),
    ('Product Seventeen', 'DIN17'),
    ('Product Eighteen', 'DIN18'),
    ('Product Nineteen', 'DIN19'),
    ('Product Twenty', 'DIN20'),
    ('Product Twenty-One', 'DIN21'),
    ('Product Twenty-Two', 'DIN22'),
    ('Product Twenty-Three', 'DIN23'),
    ('Product Twenty-Four', 'DIN24'),
    ('Product Twenty-Five', 'DIN25'),
    ('Product Twenty-Six', 'DIN26'),
    ('Product Twenty-Seven', 'DIN27'),
    ('Product Twenty-Eight', 'DIN28'),
    ('Product Twenty-Nine', 'DIN29'),
    ('Product Thirty', 'DIN30'),
    ('Product Thirty-One', 'DIN31'),
    ('Product Thirty-Two', 'DIN32'),
    ('Product Thirty-Three', 'DIN33'),
    ('Product Thirty-Four', 'DIN34'),
    ('Product Thirty-Five', 'DIN35'),
    ('Product Thirty-Six', 'DIN36'),
    ('Product Thirty-Seven', 'DIN37'),
    ('Product Thirty-Eight', 'DIN38'),
    ('Product Thirty-Nine', 'DIN39'),
    ('Product Forty', 'DIN40');

  -- Note: For simplicity, assuming each vendor has all products with varying lots
  INSERT INTO unique_products_table (item_number, vendor_id, lot, exp_date, quantity_on_hand)
  SELECT
    p.item_number,
    v.id,
    generate_series(1, 10) AS lot,
    CURRENT_DATE + (random() * 745)::integer AS exp_date,
    100 AS quantity_on_hand
  FROM products_table p
  CROSS JOIN vendor_table v;

  -- Purchase Orders
  INSERT INTO purchase_orders (vendor_id, purchase_date, delivery_date, product_quantity_rate_list, amount_due, delivery_status, payment_status, created_by)
  SELECT
    v.id,
    CURRENT_DATE - (random() * 745)::integer AS purchase_date,
    CURRENT_DATE + (random() * 745)::integer AS delivery_date,
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
CROSS JOIN LATERAL generate_series(1, 50) AS series
GROUP BY v.id, series;

  -- Invoices
INSERT INTO invoice_orders (customer_id, invoice_date, product_quantity_rate_list, amount_due, delivery_status, payment_status, order_status, date_paid, created_by, sales_rep, reference_number)
SELECT
    c.id,
    CURRENT_DATE - (random() * 745)::integer AS invoice_date,
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
    CASE WHEN ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY series) % 2 = 0 THEN 'Shipped'::sales_order_delivery ELSE 'Not shipped'::sales_order_delivery END AS delivery_status,
    CASE WHEN ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY series) % 2 = 0 THEN 'Paid'::order_payment ELSE 'Not paid'::order_payment END AS payment_status,
    CASE WHEN ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY series) % 3 != 0 THEN 'Confirmed'::order_status ELSE 'Draft'::order_status END AS order_status,
    CURRENT_DATE - (random() * 745)::integer AS date_paid,
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
CROSS JOIN LATERAL generate_series(1, 50) AS series -- Adjust the number of invoices as needed
GROUP BY c.id, series;


END $$;
