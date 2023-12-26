/* Replace with your SQL DROP commands */

DROP TABLE IF EXISTS public.customer_addresses CASCADE;

DROP TABLE IF EXISTS public.vendor_addresses CASCADE;

DROP TABLE IF EXISTS public.vendor_and_customer CASCADE;

DROP TABLE IF EXISTS public.invoice_orders CASCADE;

DROP TABLE IF EXISTS public.purchase_orders CASCADE;

DROP TABLE IF EXISTS public.products_table CASCADE;

DROP TABLE IF EXISTS public.unique_products_table CASCADE;

DROP TABLE IF EXISTS public.vendor_table CASCADE;

DROP TABLE IF EXISTS public.customer_table CASCADE;

DROP TABLE IF EXISTS public.employee_table CASCADE;

DROP TABLE IF EXISTS public.user_table CASCADE;

DROP TYPE IF EXISTS public.address_type CASCADE;

DROP TYPE IF EXISTS public.sales_order_delivery CASCADE;

DROP TYPE IF EXISTS public.purchase_order_delivery CASCADE;

DROP TYPE IF EXISTS public.order_payment CASCADE;

DROP TYPE IF EXISTS public.user_permission CASCADE;

DROP TYPE IF EXISTS public.order_status CASCADE;

-- Drop the triggers
DROP TRIGGER IF EXISTS create_employee_trigger ON user_table;
DROP TRIGGER IF EXISTS deactivate_employee_trigger ON user_table;

-- Drop the trigger functions
DROP FUNCTION IF EXISTS create_employee_trigger_function();
DROP FUNCTION IF EXISTS deactivate_employee_trigger_function();