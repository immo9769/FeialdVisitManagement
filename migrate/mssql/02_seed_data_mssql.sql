-- ============================================================================
-- Enterprise Field Visit & CRM System
-- Microsoft SQL Server Initial Seed Data
-- ============================================================================

USE [field_visit_crm];
GO

SET NOCOUNT ON;
GO

-- 1. Departments
IF NOT EXISTS (SELECT 1 FROM dbo.departments WHERE code = 'DEPT-SALES')
BEGIN
    INSERT INTO dbo.departments (code, name, created_by, updated_by)
    VALUES 
        ('DEPT-SALES', 'Sales', 'SYSTEM', 'SYSTEM'),
        ('DEPT-SERVICE', 'Service', 'SYSTEM', 'SYSTEM'),
        ('DEPT-MGMT', 'Management', 'SYSTEM', 'SYSTEM');
END
GO

-- 2. Designations
IF NOT EXISTS (SELECT 1 FROM dbo.designations WHERE code = 'DESG-SE')
BEGIN
    INSERT INTO dbo.designations (code, title, created_by, updated_by)
    VALUES 
        ('DESG-SE', 'Sales Executive', 'SYSTEM', 'SYSTEM'),
        ('DESG-SENG', 'Service Engineer', 'SYSTEM', 'SYSTEM'),
        ('DESG-BM', 'Branch Manager', 'SYSTEM', 'SYSTEM'),
        ('DESG-ADMIN', 'System Administrator', 'SYSTEM', 'SYSTEM');
END
GO

-- 3. Branches
IF NOT EXISTS (SELECT 1 FROM dbo.branches WHERE code = 'BR-MUMBAI')
BEGIN
    INSERT INTO dbo.branches (code, name, city, is_active, created_by, updated_by)
    VALUES 
        ('BR-MUMBAI', 'Mumbai HQ', 'Mumbai', 1, 'SYSTEM', 'SYSTEM'),
        ('BR-BARODA', 'Baroda Branch', 'Vadodara', 1, 'SYSTEM', 'SYSTEM'),
        ('BR-AHMEDABAD', 'Ahmedabad Branch', 'Ahmedabad', 1, 'SYSTEM', 'SYSTEM'),
        ('BR-PUNE', 'Pune Industrial Area', 'Pune', 1, 'SYSTEM', 'SYSTEM'),
        ('BR-NASHIK', 'Nashik Hub', 'Nashik', 1, 'SYSTEM', 'SYSTEM');
END
GO

-- 4. Products
IF NOT EXISTS (SELECT 1 FROM dbo.products WHERE code = 'PRD-CNC-PRESS')
BEGIN
    INSERT INTO dbo.products (code, name, description, category, is_active, created_by, updated_by)
    VALUES 
        ('PRD-CNC-PRESS', 'Hydraulic Press Brake 100T', 'High precision 100 Ton CNC hydraulic sheet metal press brake', 'Machinery', 1, 'SYSTEM', 'SYSTEM'),
        ('PRD-FIBER-LASER', 'CNC Fiber Laser 3kW', '3000W high-speed metal sheet fiber laser cutting machine', 'Machinery', 1, 'SYSTEM', 'SYSTEM'),
        ('PRD-TURRET-PUNCH', 'CNC Turret Punch Press', 'Servo-electric high-capacity punch press for industrial stamping', 'Machinery', 1, 'SYSTEM', 'SYSTEM'),
        ('PRD-SHEAR-6MM', 'Hydraulic Shearing 6mm', 'Heavy-duty 6mm thickness mechanical and hydraulic guillotine shear', 'Machinery', 1, 'SYSTEM', 'SYSTEM'),
        ('PRD-LASER-TUBE', 'CNC Laser Tube Cutting 2kW', 'Precision chuck automated rotary metal tube & pipe laser cutting', 'Machinery', 1, 'SYSTEM', 'SYSTEM'),
        ('PRD-ROBOT-WELD', 'Robotic Welding Cell 6-Axis', 'Integrated industrial 6-axis robotic GMAW/TIG welding workstation', 'Automation', 1, 'SYSTEM', 'SYSTEM');
END
GO

-- 5. Activity Types
IF NOT EXISTS (SELECT 1 FROM dbo.activity_types WHERE code = 'ACT-SALES')
BEGIN
    INSERT INTO dbo.activity_types (code, name, description, created_by, updated_by)
    VALUES 
        ('ACT-SALES', 'Sales Pitch / Discovery', 'Initial client meeting, machine requirements discovery and presentation', 'SYSTEM', 'SYSTEM'),
        ('ACT-INSTALL', 'Machine Commissioning & Installation', 'On-site machinery erection, leveling, wiring, and trial runs', 'SYSTEM', 'SYSTEM'),
        ('ACT-AMC', 'Routine Maintenance / AMC', 'Scheduled quarterly/half-yearly preventive maintenance checkup', 'SYSTEM', 'SYSTEM'),
        ('ACT-BREAKDOWN', 'Emergency Breakdown Service', 'Urgent call-out for machine halt, hydraulic/optical fault diagnosis', 'SYSTEM', 'SYSTEM'),
        ('ACT-DEMO', 'Product Live Demonstration', 'Demonstrating bending or laser cutting live on customer sample plates', 'SYSTEM', 'SYSTEM'),
        ('ACT-FOLLOWUP', 'Payment & Proposal Follow-up', 'Commercial negotiation, quote discussion, payment collection', 'SYSTEM', 'SYSTEM');
END
GO

-- 6. Expense Heads
IF NOT EXISTS (SELECT 1 FROM dbo.expense_heads WHERE code = 'EXP-FUEL')
BEGIN
    INSERT INTO dbo.expense_heads (code, name, requires_attachment, requires_km, default_rate, is_active, created_by, updated_by)
    VALUES 
        ('EXP-FUEL', 'Fuel Allowance (Per KM)', 0, 1, 11.50, 1, 'SYSTEM', 'SYSTEM'),
        ('EXP-HOTEL', 'Hotel / Lodging Expense', 1, 0, 0.00, 1, 'SYSTEM', 'SYSTEM'),
        ('EXP-FOOD', 'Daily Food / Meal Allowance', 1, 0, 0.00, 1, 'SYSTEM', 'SYSTEM'),
        ('EXP-TOLL', 'Highway Toll & Parking', 1, 0, 0.00, 1, 'SYSTEM', 'SYSTEM'),
        ('EXP-CLIENT-ENT', 'Client Entertainment / Refreshments', 1, 0, 0.00, 1, 'SYSTEM', 'SYSTEM'),
        ('EXP-PUBLIC-TRANS', 'Public Transit (Cab/Bus/Train)', 1, 0, 0.00, 1, 'SYSTEM', 'SYSTEM'),
        ('EXP-MISC', 'Miscellaneous Contingency', 0, 0, 0.00, 1, 'SYSTEM', 'SYSTEM');
END
GO

-- 7. Grade Fuel Rates
IF NOT EXISTS (SELECT 1 FROM dbo.grade_fuel_rates WHERE grade_code = 'GRADE_A')
BEGIN
    INSERT INTO dbo.grade_fuel_rates (grade_code, grade_name, fuel_rate, is_active)
    VALUES 
        ('GRADE_A', 'Grade A (Senior Mgmt / SUV)', 14.00, 1),
        ('GRADE_B', 'Grade B (Mid Executive / Sedan)', 11.50, 1),
        ('GRADE_C', 'Grade C (Junior Field / Hatchback)', 9.00, 1),
        ('GRADE_D', 'Grade D (Bike / Two-Wheeler)', 6.50, 1);
END
GO

-- 8. Industry Segments
IF NOT EXISTS (SELECT 1 FROM dbo.industries WHERE code = 'IND-AUTO')
BEGIN
    INSERT INTO dbo.industries (code, name, description, is_active)
    VALUES 
        ('IND-AUTO', 'Automobile & Auto Components', 'OEMs, Tier-1 & Tier-2 automotive component manufacturers', 1),
        ('IND-ENG', 'General Engineering & Machining', 'Precision machining, job shops, and engineering fabricators', 1),
        ('IND-MACH', 'Industrial Machinery & Equipment', 'Capital machinery, heavy equipment, and industrial tools', 1),
        ('IND-AERO', 'Aerospace & Defense', 'Aviation components, defense hardware, and precision aerospace parts', 1),
        ('IND-ELEC', 'Consumer Durables & Electronics', 'Home appliances, electrical machinery, and electronic assemblies', 1),
        ('IND-CHEM', 'Petrochemicals & Process Industry', 'Refineries, chemical processing plants, and fluid handling', 1),
        ('IND-MOLD', 'Die & Mold Manufacturing', 'Plastic injection molds, press tools, and forging dies', 1),
        ('IND-STEEL', 'Steel & Metals Fabrication', 'Metal forming, rolling mills, structural steel, and metallurgy', 1),
        ('IND-FOOD', 'Food Processing & Packaging', 'FMCG machinery, packaging automation, and food equipment', 1);
END
GO

-- 9. Employees (Default Password is: Password@123)
-- BCrypt hash for 'Password@123'
DECLARE @DefaultHash NVARCHAR(255) = '$2a$10$WqfVq4Hk79w684Wz5m1oK.5m3sO6QJdGfS1B2fP9k9Xk.4h1t7Jem';

DECLARE @deptSales INT = (SELECT TOP 1 id FROM dbo.departments WHERE code = 'DEPT-SALES');
DECLARE @deptService INT = (SELECT TOP 1 id FROM dbo.departments WHERE code = 'DEPT-SERVICE');
DECLARE @deptMgmt INT = (SELECT TOP 1 id FROM dbo.departments WHERE code = 'DEPT-MGMT');

DECLARE @desgSE INT = (SELECT TOP 1 id FROM dbo.designations WHERE code = 'DESG-SE');
DECLARE @desgSENG INT = (SELECT TOP 1 id FROM dbo.designations WHERE code = 'DESG-SENG');
DECLARE @desgBM INT = (SELECT TOP 1 id FROM dbo.designations WHERE code = 'DESG-BM');
DECLARE @desgAdmin INT = (SELECT TOP 1 id FROM dbo.designations WHERE code = 'DESG-ADMIN');

DECLARE @brMumbai INT = (SELECT TOP 1 id FROM dbo.branches WHERE code = 'BR-MUMBAI');
DECLARE @brBaroda INT = (SELECT TOP 1 id FROM dbo.branches WHERE code = 'BR-BARODA');
DECLARE @brAhmedabad INT = (SELECT TOP 1 id FROM dbo.branches WHERE code = 'BR-AHMEDABAD');
DECLARE @brPune INT = (SELECT TOP 1 id FROM dbo.branches WHERE code = 'BR-PUNE');

IF NOT EXISTS (SELECT 1 FROM dbo.employees WHERE email = 'admin@crm.com')
BEGIN
    INSERT INTO dbo.employees 
        (employee_no, name, gender, dob, department_id, designation_id, branch_id, joining_date, status, mobile_no, email, password_hash, role, grade, created_by, updated_by)
    VALUES 
        ('1000', 'System Administrator', 'Male', '1985-01-01', @deptMgmt, @desgAdmin, @brMumbai, '2020-01-01', 'Active', '9999999999', 'admin@crm.com', @DefaultHash, 'ADMIN', 'GRADE_A', 'SYSTEM', 'SYSTEM'),
        ('1001', 'Suresh Choudhary', 'Male', '1989-04-15', @deptService, @desgSENG, @brMumbai, '2022-01-10', 'Active', '9317654322', 'suresh@crm.com', @DefaultHash, 'SERVICE_ENG', 'GRADE_B', 'SYSTEM', 'SYSTEM'),
        ('1002', 'Amit Sharma', 'Male', '1992-08-22', @deptSales, @desgSE, @brBaroda, '2021-03-15', 'Active', '9823456711', 'amit@crm.com', @DefaultHash, 'SALES_EXEC', 'GRADE_B', 'SYSTEM', 'SYSTEM'),
        ('1003', 'Rajesh Patel', 'Male', '1982-11-05', @deptMgmt, @desgBM, @brMumbai, '2018-06-01', 'Active', '9712345678', 'rajesh@crm.com', @DefaultHash, 'MANAGER', 'GRADE_A', 'SYSTEM', 'SYSTEM');
END
GO

-- Update branch manager
DECLARE @mgrId INT = (SELECT TOP 1 id FROM dbo.employees WHERE email = 'rajesh@crm.com');
UPDATE dbo.branches SET manager_id = @mgrId WHERE code = 'BR-MUMBAI';
GO

-- 10. Sample Customers
IF NOT EXISTS (SELECT 1 FROM dbo.customers WHERE customer_code = 'CUST-TATA-001')
BEGIN
    INSERT INTO dbo.customers 
        (customer_code, name, customer_type, industry, contact_person_primary, source, website, status, remarks, address, city, state, created_by, updated_by)
    VALUES 
        ('CUST-TATA-001', 'Tata Motors Ltd (Plant 1)', 'Existing Customer', 'Automobile & Auto Components', 'Rajendra Deshmukh', 'Direct Referral', 'https://tatamotors.com', 'Active', 'Key automotive manufacturing facility with 4 active hydraulic press brakes.', 'Pimpri Industrial Corridor, MIDC', 'Pune', 'Maharashtra', 'SYSTEM', 'SYSTEM'),
        ('CUST-LNT-002', 'Larsen & Toubro Heavy Engineering', 'Existing Customer', 'Industrial Machinery & Equipment', 'Vikram Trivedi', 'Trade Expo 2024', 'https://larsentoubro.com', 'Active', 'Precision machining and naval defense manufacturing section.', 'Ranoli Industrial Area', 'Vadodara', 'Gujarat', 'SYSTEM', 'SYSTEM'),
        ('CUST-BHARAT-003', 'Bharat Forge Ltd', 'Prospect', 'Automobile & Auto Components', 'Anil Kulkarni', 'Website Lead', 'https://bharatforge.com', 'Active', 'In discussions for 3kW fiber laser cutting and robotic welding cell integration.', 'Mundhwa Industrial Area', 'Pune', 'Maharashtra', 'SYSTEM', 'SYSTEM'),
        ('CUST-GODREJ-004', 'Godrej & Boyce Mfg Co', 'Prospect', 'Consumer Durables & Electronics', 'Pooja Nair', 'Sales Campaign', 'https://godrej.com', 'Active', 'Exploring automated punch press line upgrade.', 'Vikhroli East', 'Mumbai', 'Maharashtra', 'SYSTEM', 'SYSTEM');
END
GO

-- 11. Sample Contacts
DECLARE @custTata INT = (SELECT TOP 1 id FROM dbo.customers WHERE customer_code = 'CUST-TATA-001');
DECLARE @custLnt INT = (SELECT TOP 1 id FROM dbo.customers WHERE customer_code = 'CUST-LNT-002');
DECLARE @custBharat INT = (SELECT TOP 1 id FROM dbo.customers WHERE customer_code = 'CUST-BHARAT-003');

IF @custTata IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.contacts WHERE customer_id = @custTata)
BEGIN
    INSERT INTO dbo.contacts (customer_id, contact_name, designation, mobile_no, email, is_primary, created_by, updated_by)
    VALUES 
        (@custTata, 'Rajendra Deshmukh', 'General Manager - Plant Maintenance', '9822011223', 'rajendra.d@tatamotors.example.com', 1, 'SYSTEM', 'SYSTEM'),
        (@custTata, 'Prakash Jadhav', 'Maintenance Lead', '9822011224', 'prakash.j@tatamotors.example.com', 0, 'SYSTEM', 'SYSTEM');
END

IF @custLnt IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.contacts WHERE customer_id = @custLnt)
BEGIN
    INSERT INTO dbo.contacts (customer_id, contact_name, designation, mobile_no, email, is_primary, created_by, updated_by)
    VALUES 
        (@custLnt, 'Vikram Trivedi', 'Head of Tooling & Sheet Metal', '9824055667', 'vikram.trivedi@lnt.example.com', 1, 'SYSTEM', 'SYSTEM');
END

IF @custBharat IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.contacts WHERE customer_id = @custBharat)
BEGIN
    INSERT INTO dbo.contacts (customer_id, contact_name, designation, mobile_no, email, is_primary, created_by, updated_by)
    VALUES 
        (@custBharat, 'Anil Kulkarni', 'Procurement Director', '9823099887', 'anil.k@bharatforge.example.com', 1, 'SYSTEM', 'SYSTEM');
END
GO

PRINT 'Enterprise Field Visit CRM Initial Seed Data loaded successfully.';
GO
