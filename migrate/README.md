# Database Migration Guide (Microsoft SQL Server)

This directory contains database migration scripts for the **Enterprise Field Visit & CRM Management System**.

## Directory Structure
- `mssql/01_schema_mssql.sql`: Full DDL script creating all 14 tables, constraints, foreign keys, and indexes.
- `mssql/02_seed_data_mssql.sql`: Initial seed data script with default departments, designations, branches, products, activity types, expense heads, fuel rates, industries, and default users.
- `run-migration.ps1`: Automated PowerShell script to execute migrations against any MS SQL instance.

---

## How to Run Migration

### Option 1: Automated PowerShell Runner (Recommended)
Run the script from PowerShell:

```powershell
# Using SQL Server Authentication (sa):
.\migrate\run-migration.ps1 -ServerInstance "127.0.0.1,1433" -DatabaseName "field_visit_crm" -Username "sa" -Password "Password@123"

# OR Using Windows Integrated Authentication:
.\migrate\run-migration.ps1 -ServerInstance ".\SQLEXPRESS" -DatabaseName "field_visit_crm" -UseWindowsAuth
```

### Option 2: SQL Server Management Studio (SSMS)
1. Open **SSMS** and connect to your SQL Server instance (e.g. `.\SQLEXPRESS` or `localhost`).
2. Open `migrate/mssql/01_schema_mssql.sql` and click **Execute** (F5).
3. Open `migrate/mssql/02_seed_data_mssql.sql` and click **Execute** (F5).

### Option 3: Command Line (`sqlcmd`)
```bash
sqlcmd -S localhost -U sa -P Password@123 -i migrate/mssql/01_schema_mssql.sql
sqlcmd -S localhost -U sa -P Password@123 -i migrate/mssql/02_seed_data_mssql.sql
```

---

## Default Credentials Seeded
- **Admin**: `admin@crm.com` / `Password@123` (Role: `ADMIN`)
- **Manager**: `rajesh@crm.com` / `Password@123` (Role: `MANAGER`)
- **Service Engineer**: `suresh@crm.com` / `Password@123` (Role: `SERVICE_ENG`)
- **Sales Executive**: `amit@crm.com` / `Password@123` (Role: `SALES_EXEC`)
