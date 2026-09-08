-- V6: Drop unused receipt_image_url column from transactions table
ALTER TABLE transactions DROP COLUMN IF EXISTS receipt_image_url;
