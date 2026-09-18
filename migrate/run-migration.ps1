<#
.SYNOPSIS
    Automated MS SQL Server Database Migration Runner for Enterprise Field Visit & CRM
.DESCRIPTION
    Applies DDL schema and initial seed data migrations against MS SQL Server.
    Supports Windows Integrated Security or SQL Server Authentication (sa / custom user).
.PARAMETER ServerInstance
    SQL Server instance (default: 'localhost,1433' or '.\SQLEXPRESS')
.PARAMETER DatabaseName
    Target database name (default: 'field_visit_crm')
.PARAMETER Username
    SQL login username (optional; if omitted, Windows Authentication is used)
.PARAMETER Password
    SQL login password
#>

param(
    [string]$ServerInstance = "127.0.0.1,1433",
    [string]$DatabaseName = "field_visit_crm",
    [string]$Username = "sa",
    [string]$Password = "Password@123",
    [switch]$UseWindowsAuth
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Enterprise Field Visit & CRM - MS SQL Migration Runner  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Server:   $ServerInstance"
Write-Host "Database: $DatabaseName"

# Build Connection String
if ($UseWindowsAuth -or [string]::IsNullOrWhiteSpace($Username)) {
    Write-Host "Auth:     Windows Integrated Authentication"
    $connStr = "Server=$ServerInstance;Database=master;Integrated Security=True;TrustServerCertificate=True;"
} else {
    Write-Host "Auth:     SQL Server Authentication (User: $Username)"
    $connStr = "Server=$ServerInstance;Database=master;User Id=$Username;Password=$Password;TrustServerCertificate=True;"
}

function Execute-SqlScriptFile {
    param(
        [string]$FilePath,
        [System.Data.SqlClient.SqlConnection]$Connection
    )

    if (-not (Test-Path $FilePath)) {
        Write-Error "File not found: $FilePath"
        return $false
    }

    Write-Host "`nExecuting script: $(Split-Path -Leaf $FilePath)..." -ForegroundColor Yellow
    $rawContent = Get-Content -Path $FilePath -Raw

    # Split by 'GO' statements on their own line (case insensitive)
    $batches = [System.Text.RegularExpressions.Regex]::Split($rawContent, '^\s*GO\s*$', [System.Text.RegularExpressions.RegexOptions]::Multiline -bor [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

    foreach ($batch in $batches) {
        $trimmed = $batch.Trim()
        if (-not [string]::IsNullOrWhiteSpace($trimmed)) {
            $cmd = $Connection.CreateCommand()
            $cmd.CommandText = $trimmed
            $cmd.CommandTimeout = 120
            try {
                $null = $cmd.ExecuteNonQuery()
            } catch {
                Write-Host "Warning/Error in SQL batch: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    Write-Host "Done: $(Split-Path -Leaf $FilePath)" -ForegroundColor Green
    return $true
}

try {
    Write-Host "`nConnecting to SQL Server..." -ForegroundColor Yellow
    $conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
    $conn.Open()
    Write-Host "Connection successful!" -ForegroundColor Green

    # Ensure Database exists
    $createDbCmd = $conn.CreateCommand()
    $createDbCmd.CommandText = "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'$DatabaseName') CREATE DATABASE [$DatabaseName];"
    $null = $createDbCmd.ExecuteNonQuery()
    $conn.ChangeDatabase($DatabaseName)

    # 1. Run Schema DDL
    $schemaFile = Join-Path $scriptDir "mssql\01_schema_mssql.sql"
    Execute-SqlScriptFile -FilePath $schemaFile -Connection $conn

    # 2. Run Seed Data
    $seedFile = Join-Path $scriptDir "mssql\02_seed_data_mssql.sql"
    Execute-SqlScriptFile -FilePath $seedFile -Connection $conn

    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host "   Migration completed successfully on [$DatabaseName]!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green

    # Display table counts
    $checkCmd = $conn.CreateCommand()
    $checkCmd.CommandText = @"
    SELECT t.name AS TableName, SUM(p.rows) AS [RowCount]
    FROM sys.tables t
    INNER JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0,1)
    GROUP BY t.name
    ORDER BY t.name;
"@
    $reader = $checkCmd.ExecuteReader()
    Write-Host "`nDatabase Table Statistics:" -ForegroundColor Cyan
    while ($reader.Read()) {
        Write-Host ("  {0,-25} : {1} rows" -f $reader["TableName"], $reader["RowCount"])
    }
    $conn.Close()
} catch {
    Write-Host "Migration Failed: $($_.Exception.Message)" -ForegroundColor Red
}
