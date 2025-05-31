ALTER TABLE public.products
ADD COLUMN created_by UUID REFERENCES public.users(id);

-- Optional: Add an index for faster queries
CREATE INDEX idx_products_created_by ON public.products(created_by);

-- Optional: Add a comment to the column
COMMENT ON COLUMN public.products.created_by IS 'ID of the user who created the product';
