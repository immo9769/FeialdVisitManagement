-- ============================================================================
-- Enterprise Field Visit & CRM System
-- Microsoft SQL Server Database Schema Migration
-- Compatible with MS SQL Server 2016, 2017, 2019, 2022, 2025 / Azure SQL
-- ============================================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'field_visit_crm')
BEGIN
    CREATE DATABASE [field_visit_crm];
END
GO

USE [field_visit_crm];
GO

-- Disable constraint validation during creation
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1. Departments Master
IF OBJECT_ID(N'dbo.departments', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.departments (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_departments PRIMARY KEY,
        code NVARCHAR(20) NOT NULL CONSTRAINT UQ_departments_code UNIQUE,
        name NVARCHAR(100) NOT NULL,
        created_at DATETIME2(3) NOT NULL CONSTRAINT DF_dept_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_dept_updated_at DEFAULT SYSUTCDATETIME(),
        created_by NVARCHAR(100) NOT NULL CONSTRAINT DF_dept_created_by DEFAULT 'SYSTEM',
        updated_by NVARCHAR(100) NOT NULL CONSTRAINT DF_dept_updated_by DEFAULT 'SYSTEM'
    );
END
GO

-- 2. Designations Master
IF OBJECT_ID(N'dbo.designations', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.designations (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_designations PRIMARY KEY,
        code NVARCHAR(20) NOT NULL CONSTRAINT UQ_designations_code UNIQUE,
        title NVARCHAR(100) NOT NULL,
        created_at DATETIME2(3) NOT NULL CONSTRAINT DF_desg_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_desg_updated_at DEFAULT SYSUTCDATETIME(),
        created_by NVARCHAR(100) NOT NULL CONSTRAINT DF_desg_created_by DEFAULT 'SYSTEM',
        updated_by NVARCHAR(100) NOT NULL CONSTRAINT DF_desg_updated_by DEFAULT 'SYSTEM'
    );
END
GO

-- 3. Branches Master
IF OBJECT_ID(N'dbo.branches', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.branches (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_branches PRIMARY KEY,
        code NVARCHAR(20) NOT NULL CONSTRAINT UQ_branches_code UNIQUE,
        name NVARCHAR(100) NOT NULL,
        city NVARCHAR(100) NOT NULL,
        manager_id INT NULL,
        is_active BIT NOT NULL CONSTRAINT DF_branches_is_active DEFAULT 1,
        created_at DATETIME2(3) NOT NULL CONSTRAINT DF_branch_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_branch_updated_at DEFAULT SYSUTCDATETIME(),
        created_by NVARCHAR(100) NOT NULL CONSTRAINT DF_branch_created_by DEFAULT 'SYSTEM',
        updated_by NVARCHAR(100) NOT NULL CONSTRAINT DF_branch_updated_by DEFAULT 'SYSTEM'
    );
END
GO

-- 4. Products Master
IF OBJECT_ID(N'dbo.products', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.products (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_products PRIMARY KEY,
        code NVARCHAR(50) NOT NULL CONSTRAINT UQ_products_code UNIQUE,
        name NVARCHAR(150) NOT NULL,
        description NVARCHAR(MAX) NULL,
        category NVARCHAR(100) NOT NULL CONSTRAINT DF_prod_category DEFAULT 'Machinery',
        is_active BIT NOT NULL CONSTRAINT DF_prod_is_active DEFAULT 1,
        created_at DATETIME2(3) NOT NULL CONSTRAINT DF_prod_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_prod_updated_at DEFAULT SYSUTCDATETIME(),
        created_by NVARCHAR(100) NOT NULL CONSTRAINT DF_prod_created_by DEFAULT 'SYSTEM',
        updated_by NVARCHAR(100) NOT NULL CONSTRAINT DF_prod_updated_by DEFAULT 'SYSTEM'
    );
END
GO

-- 5. Activity Types Master
IF OBJECT_ID(N'dbo.activity_types', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.activity_types (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_activity_types PRIMARY KEY,
        code NVARCHAR(50) NOT NULL CONSTRAINT UQ_activity_types_code UNIQUE,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(MAX) NULL,
        created_at DATETIME2(3) NOT NULL CONSTRAINT DF_act_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_act_updated_at DEFAULT SYSUTCDATETIME(),
        created_by NVARCHAR(100) NOT NULL CONSTRAINT DF_act_created_by DEFAULT 'SYSTEM',
        updated_by NVARCHAR(100) NOT NULL CONSTRAINT DF_act_updated_by DEFAULT 'SYSTEM'
    );
END
GO

-- 6. Expense Heads Master
IF OBJECT_ID(N'dbo.expense_heads', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.expense_heads (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_expense_heads PRIMARY KEY,
        code NVARCHAR(50) NOT NULL CONSTRAINT UQ_expense_heads_code UNIQUE,
        name NVARCHAR(150) NOT NULL,
        requires_attachment BIT NOT NULL CONSTRAINT DF_exp_req_att DEFAULT 0,
        requires_km BIT NOT NULL CONSTRAINT DF_exp_req_km DEFAULT 0,
        default_rate DECIMAL(10,2) NOT NULL CONSTRAINT DF_exp_default_rate DEFAULT 0.00,
        is_active BIT NOT NULL CONSTRAINT DF_exp_is_active DEFAULT 1,
        created_at DATETIME2(3) NOT NULL CONSTRAINT DF_exp_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_exp_updated_at DEFAULT SYSUTCDATETIME(),
        created_by NVARCHAR(100) NOT NULL CONSTRAINT DF_exp_created_by DEFAULT 'SYSTEM',
        updated_by NVARCHAR(100) NOT NULL CONSTRAINT DF_exp_updated_by DEFAULT 'SYSTEM'
    );
END
GO

-- 7. Grade Fuel Rates Master
IF OBJECT_ID(N'dbo.grade_fuel_rates', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.grade_fuel_rates (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_grade_fuel_rates PRIMARY KEY,
        grade_code NVARCHAR(50) NOT NULL CONSTRAINT UQ_grade_fuel_code UNIQUE,
        grade_name NVARCHAR(100) NOT NULL,
        fuel_rate DECIMAL(10,2) NOT NULL CONSTRAINT DF_grade_fuel_rate DEFAULT 10.35,
        is_active BIT NOT NULL CONSTRAINT DF_grade_fuel_is_active DEFAULT 1,
        created_at DATETIME2(3) NOT NULL CONSTRAINT DF_grade_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_grade_updated_at DEFAULT SYSUTCDATETIME()
    );
END
GO

-- 8. Industries Master
IF OBJECT_ID(N'dbo.industries', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.industries (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_industries PRIMARY KEY,
        code NVARCHAR(50) NOT NULL CONSTRAINT UQ_industries_code UNIQUE,
        name NVARCHAR(150) NOT NULL,
        description NVARCHAR(255) NULL,
        is_active BIT NOT NULL CONSTRAINT DF_industries_is_active DEFAULT 1,
        created_at DATETIME2(3) NOT NULL CONSTRAINT DF_ind_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_ind_updated_at DEFAULT SYSUTCDATETIME()
    );
END
GO

-- 9. Employees Table
IF OBJECT_ID(N'dbo.employees', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.employees (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_employees PRIMARY KEY,
        employee_no NVARCHAR(50) NOT NULL CONSTRAINT UQ_employees_employee_no UNIQUE,
        name NVARCHAR(150) NOT NULL,
        gender NVARCHAR(20) NOT NULL CONSTRAINT DF_emp_gender DEFAULT 'Male',
        dob DATE NULL,
        department_id INT NOT NULL CONSTRAINT FK_emp_department FOREIGN KEY REFERENCES dbo.departments(id),
        designation_id INT NOT NULL CONSTRAINT FK_emp_designation FOREIGN KEY REFERENCES dbo.designations(id),
        branch_id INT NOT NULL CONSTRAINT FK_emp_branch FOREIGN KEY REFERENCES dbo.branches(id),
        joining_date DATE NOT NULL,
        status NVARCHAR(20) NOT NULL CONSTRAINT DF_emp_status DEFAULT 'Active',
        mobile_no NVARCHAR(20) NOT NULL,
        email NVARCHAR(150) NOT NULL CONSTRAINT UQ_employees_email UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        role NVARCHAR(30) NOT NULL CONSTRAINT DF_emp_role DEFAULT 'SERVICE_ENG',
        grade NVARCHAR(50) NOT NULL CONSTRAINT DF_emp_grade DEFAULT 'GRADE_B',
        created_at DATETIME2(3) NOT NULL CONSTRAINT DF_emp_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_emp_updated_at DEFAULT SYSUTCDATETIME(),
        created_by NVARCHAR(100) NOT NULL CONSTRAINT DF_emp_created_by DEFAULT 'SYSTEM',
        updated_by NVARCHAR(100) NOT NULL CONSTRAINT DF_emp_updated_by DEFAULT 'SYSTEM'
    );
END
GO

-- Add manager FK on branches if not existing
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_branches_manager')
BEGIN
    ALTER TABLE dbo.branches
    ADD CONSTRAINT FK_branches_manager FOREIGN KEY (manager_id) REFERENCES dbo.employees(id);
END
GO

-- 10. Customers Table
IF OBJECT_ID(N'dbo.customers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.customers (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_customers PRIMARY KEY,
        customer_code NVARCHAR(50) NOT NULL CONSTRAINT UQ_customers_customer_code UNIQUE,
        name NVARCHAR(150) NOT NULL,
        customer_type NVARCHAR(50) NOT NULL CONSTRAINT DF_cust_type DEFAULT 'Prospect',
        industry NVARCHAR(100) NOT NULL,
        contact_person_primary NVARCHAR(150) NULL,
        source NVARCHAR(100) NULL,
        website NVARCHAR(150) NULL,
        status NVARCHAR(20) NOT NULL CONSTRAINT DF_cust_status DEFAULT 'Active',
        remarks NVARCHAR(MAX) NULL,
        address NVARCHAR(MAX) NULL,
        city NVARCHAR(100) NULL,
        state NVARCHAR(100) NULL,
        created_at DATETIME2(3) NOT NULL CONSTRAINT DF_cust_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_cust_updated_at DEFAULT SYSUTCDATETIME(),
        created_by NVARCHAR(100) NOT NULL CONSTRAINT DF_cust_created_by DEFAULT 'SYSTEM',
        updated_by NVARCHAR(100) NOT NULL CONSTRAINT DF_cust_updated_by DEFAULT 'SYSTEM'
    );
END
GO

-- 11. Customer Contacts Table
IF OBJECT_ID(N'dbo.contacts', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.contacts (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_contacts PRIMARY KEY,
        customer_id INT NOT NULL CONSTRAINT FK_contacts_customer FOREIGN KEY REFERENCES dbo.customers(id) ON DELETE CASCADE,
        contact_name NVARCHAR(150) NOT NULL,
        designation NVARCHAR(100) NULL,
        mobile_no NVARCHAR(20) NULL,
        email NVARCHAR(150) NULL,
        is_primary BIT NOT NULL CONSTRAINT DF_contacts_is_primary DEFAULT 0,
        created_at DATETIME2(3) NOT NULL CONSTRAINT DF_contact_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_contact_updated_at DEFAULT SYSUTCDATETIME(),
        created_by NVARCHAR(100) NOT NULL CONSTRAINT DF_contact_created_by DEFAULT 'SYSTEM',
        updated_by NVARCHAR(100) NOT NULL CONSTRAINT DF_contact_updated_by DEFAULT 'SYSTEM'
    );
END
GO

-- 12. Daily Visits Table
IF OBJECT_ID(N'dbo.daily_visits', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.daily_visits (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_daily_visits PRIMARY KEY,
        visit_date DATE NOT NULL,
        employee_id INT NOT NULL CONSTRAINT FK_visits_employee FOREIGN KEY REFERENCES dbo.employees(id),
        department_id INT NOT NULL CONSTRAINT FK_visits_department FOREIGN KEY REFERENCES dbo.departments(id),
        branch_id INT NOT NULL CONSTRAINT FK_visits_branch FOREIGN KEY REFERENCES dbo.branches(id),
        customer_id INT NOT NULL CONSTRAINT FK_visits_customer FOREIGN KEY REFERENCES dbo.customers(id),
        contact_id INT NULL CONSTRAINT FK_visits_contact FOREIGN KEY REFERENCES dbo.contacts(id),
        activity_type_id INT NOT NULL CONSTRAINT FK_visits_activity FOREIGN KEY REFERENCES dbo.activity_types(id),
        product_id INT NULL CONSTRAINT FK_visits_product FOREIGN KEY REFERENCES dbo.products(id),
        place_from NVARCHAR(150) NOT NULL,
        place_to NVARCHAR(150) NOT NULL,
        start_time DATETIME2(3) NOT NULL,
        end_time DATETIME2(3) NOT NULL,
        person_count INT NOT NULL CONSTRAINT DF_visits_person_count DEFAULT 1,
        status NVARCHAR(30) NOT NULL CONSTRAINT DF_visits_status DEFAULT 'DRAFT',
        rejection_reason NVARCHAR(MAX) NULL,
        approved_by INT NULL CONSTRAINT FK_visits_approver FOREIGN KEY REFERENCES dbo.employees(id),
        approved_at DATETIME2(3) NULL,
        created_at DATETIME2(3) NOT NULL CONSTRAINT DF_visit_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_visit_updated_at DEFAULT SYSUTCDATETIME(),
        created_by NVARCHAR(100) NOT NULL CONSTRAINT DF_visit_created_by DEFAULT 'SYSTEM',
        updated_by NVARCHAR(100) NOT NULL CONSTRAINT DF_visit_updated_by DEFAULT 'SYSTEM'
    );
END
GO

-- 13. Visit Expenses Table
IF OBJECT_ID(N'dbo.visit_expenses', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.visit_expenses (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_visit_expenses PRIMARY KEY,
        visit_id INT NOT NULL CONSTRAINT FK_expenses_visit FOREIGN KEY REFERENCES dbo.daily_visits(id) ON DELETE CASCADE,
        expense_head_id INT NOT NULL CONSTRAINT FK_expenses_head FOREIGN KEY REFERENCES dbo.expense_heads(id),
        day_start_km DECIMAL(10,2) NULL,
        day_end_km DECIMAL(10,2) NULL,
        total_km DECIMAL(10,2) NULL,
        fuel_rate DECIMAL(10,2) NULL,
        toll_tax DECIMAL(10,2) NULL,
        amount DECIMAL(10,2) NOT NULL CONSTRAINT DF_expenses_amount DEFAULT 0.00,
        attachment_url NVARCHAR(550) NULL,
        remarks NVARCHAR(MAX) NULL,
        created_at DATETIME2(3) NOT NULL CONSTRAINT DF_expitem_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_expitem_updated_at DEFAULT SYSUTCDATETIME()
    );
END
GO

-- 14. Extensible Visit Customers Table
IF OBJECT_ID(N'dbo.visit_customers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.visit_customers (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_visit_customers PRIMARY KEY,
        visit_id INT NOT NULL CONSTRAINT FK_vc_visit FOREIGN KEY REFERENCES dbo.daily_visits(id) ON DELETE CASCADE,
        customer_id INT NOT NULL CONSTRAINT FK_vc_customer FOREIGN KEY REFERENCES dbo.customers(id),
        contact_id INT NULL CONSTRAINT FK_vc_contact FOREIGN KEY REFERENCES dbo.contacts(id),
        sequence_no INT NOT NULL CONSTRAINT DF_vc_seq DEFAULT 1,
        created_at DATETIME2(3) NOT NULL CONSTRAINT DF_vc_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(3) NOT NULL CONSTRAINT DF_vc_updated_at DEFAULT SYSUTCDATETIME()
    );
END
GO

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_employees_dept_branch' AND object_id = OBJECT_ID('dbo.employees'))
    CREATE NONCLUSTERED INDEX IX_employees_dept_branch ON dbo.employees (department_id, branch_id);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_customers_type_status' AND object_id = OBJECT_ID('dbo.customers'))
    CREATE NONCLUSTERED INDEX IX_customers_type_status ON dbo.customers (customer_type, status);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_visits_date_emp_branch' AND object_id = OBJECT_ID('dbo.daily_visits'))
    CREATE NONCLUSTERED INDEX IX_visits_date_emp_branch ON dbo.daily_visits (visit_date, employee_id, branch_id, status);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_expenses_visit' AND object_id = OBJECT_ID('dbo.visit_expenses'))
    CREATE NONCLUSTERED INDEX IX_expenses_visit ON dbo.visit_expenses (visit_id, expense_head_id);
GO

PRINT 'Enterprise Field Visit CRM MS SQL Database Schema created successfully.';
GO
