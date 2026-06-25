CREATE DATABASE sales_distribution;
USE sales_distribution;


-- ======================================================================
-- 1) CUSTOMERS
-- ======================================================================
CREATE TABLE customers (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    customer_code   VARCHAR(20)  NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    city            VARCHAR(100),
    country         VARCHAR(100),
    credit_group    VARCHAR(10),
    risk_category   VARCHAR(10),
    is_deleted      TINYINT(1) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ======================================================================
-- 2) MATERIALS
-- ======================================================================
CREATE TABLE materials (
    id                       INT AUTO_INCREMENT PRIMARY KEY,
    material_code            VARCHAR(40) NOT NULL UNIQUE,
    description              VARCHAR(255),
    base_uom                 VARCHAR(10),
    material_group           VARCHAR(20),
    material_freight_group   VARCHAR(20),
    tax_indicator_material   VARCHAR(10),
    plant                    VARCHAR(10),
    plant_special_status     VARCHAR(10),
    is_deleted               TINYINT(1) NOT NULL DEFAULT 0,
    created_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ======================================================================
-- 3) QUOTA (Quota Arrangement)
-- ======================================================================
CREATE TABLE quotas (
    id                          INT AUTO_INCREMENT PRIMARY KEY,
    purchasing_group            VARCHAR(10) NOT NULL,
    plant                       VARCHAR(10) NOT NULL,
    plant_special_material_status VARCHAR(10),
    tax_indicator_for_material  VARCHAR(10),
    material_freight_group      VARCHAR(20),
    material_group              VARCHAR(20),
    valid_from                  DATE,
    valid_to                    DATE,
    quota_usage                 VARCHAR(10),
    is_deleted                  TINYINT(1) NOT NULL DEFAULT 0,
    created_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for queries on purchasing_group/plant/date
CREATE INDEX idx_quotas_group_plant
    ON quotas (purchasing_group, plant);
CREATE INDEX idx_quotas_validity
    ON quotas (valid_from, valid_to);

-- ======================================================================
-- 4) CREDIT (Customer Credit Limit)
-- ======================================================================
CREATE TABLE credits (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    customer_id     INT NOT NULL,
    credit_limit    DECIMAL(15,2) NOT NULL,
    currency        VARCHAR(10) NOT NULL DEFAULT 'INR',
    risk_category   VARCHAR(10),
    credit_group    VARCHAR(10),
    is_deleted      TINYINT(1) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_credits_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE INDEX idx_credits_customer
    ON credits (customer_id);

-- ======================================================================
-- 5) PRICING CONFIG (Pricing Procedures)
-- ======================================================================
CREATE TABLE pricing_configs (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    pricing_procedure   VARCHAR(20) NOT NULL UNIQUE,
    description         VARCHAR(255),
    is_deleted          TINYINT(1) NOT NULL DEFAULT 0,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ======================================================================
-- 6) SCHEDULE LINE CATEGORIES
-- ======================================================================
CREATE TABLE schedule_lines (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    schedule_line_category  VARCHAR(10) NOT NULL UNIQUE,
    description             VARCHAR(255),
    requirement_relevant    VARCHAR(1),      -- 'Y' / 'N'
    availability_check      VARCHAR(5),      -- e.g. '01', '02'
    movement_type           VARCHAR(5),      -- e.g. '601'
    is_deleted              TINYINT(1) NOT NULL DEFAULT 0,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ======================================================================
-- 7) ITEM CATEGORIES
-- ======================================================================
CREATE TABLE item_categories (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    item_category           VARCHAR(10) NOT NULL UNIQUE,
    description             VARCHAR(255),
    schedule_line_allowed   VARCHAR(1),  -- 'Y' / 'N'
    billing_relevant        VARCHAR(1),  -- 'Y' / 'N'
    credit_active           VARCHAR(1),  -- 'Y' / 'N'
    is_deleted              TINYINT(1) NOT NULL DEFAULT 0,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ======================================================================
-- 8) SALES DOCUMENT CONFIG (Sales Document Types)
-- ======================================================================
CREATE TABLE sales_documents (
    id                               INT AUTO_INCREMENT PRIMARY KEY,
    sales_document_type              VARCHAR(10) NOT NULL UNIQUE,
    description                      VARCHAR(255),
    item_category_determination      VARCHAR(50),  -- e.g. 'TAN,TAD'
    schedule_line_category_determination VARCHAR(50), -- e.g. 'CP,CN'
    pricing_procedure                VARCHAR(20),
    credit_check                     VARCHAR(1),  -- 'Y' / 'N'
    is_deleted                       TINYINT(1) NOT NULL DEFAULT 0,
    created_at                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sales_docs_pricing
        FOREIGN KEY (pricing_procedure) REFERENCES pricing_configs(pricing_procedure)
);

-- Optional index for quick search by pricing_procedure
CREATE INDEX idx_sales_docs_pricing_procedure
    ON sales_documents (pricing_procedure);
