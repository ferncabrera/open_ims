/* Replace with your SQL DROP commands */

DROP TABLE IF EXISTS public.customer_addresses CASCADE;

DROP TABLE IF EXISTS public.vendor_addresses CASCADE;

DROP TABLE IF EXISTS public.vendor_and_customer CASCADE;

DROP TABLE IF EXISTS public.invoice_orders CASCADE;

DROP TABLE IF EXISTS public.purchase_orders CASCADE;

DROP TABLE IF EXISTS public.products_table CASCADE;

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