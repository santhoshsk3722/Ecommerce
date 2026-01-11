# PowerShell Script to Install Dev Tools for CI/CD Pipeline
# Run this script as Administrator for best results.

Write-Host "Starting Installation of Prerequisites..." -ForegroundColor Cyan

# Function to check and install a package
function Install-Package {
    param (
        [string]$Id,
        [string]$Name
    )

    Write-Host "Checking for $Name..." -NoNewline
    $check = winget list -e --id $Id
    if ($check -match $Id) {
        Write-Host " [INSTALLED]" -ForegroundColor Green
    } else {
        Write-Host " [NOT FOUND]" -ForegroundColor Yellow
        Write-Host "Installing $Name..." -ForegroundColor Cyan
        winget install --id $Id -e --silent --accept-package-agreements --accept-source-agreements
        if ($?) {
            Write-Host "Successfully installed $Name" -ForegroundColor Green
        } else {
            Write-Host "Failed to install $Name. You may need to install it manually." -ForegroundColor Red
        }
    }
}

# 1. Install Git
Install-Package -Id "Git.Git" -Name "Git"

# 2. Install AWS CLI v2
Install-Package -Id "Amazon.AWSCLI" -Name "AWS CLI"

# 3. Install Terraform
Install-Package -Id "Hashicorp.Terraform" -Name "Terraform"

# 4. Install Docker Desktop
# Note: Docker Desktop might require a restart and manual acceptance of TOS after launch.
Install-Package -Id "Docker.DockerDesktop" -Name "Docker Desktop"

Write-Host "`n--------------------------------------------------"
Write-Host "Installation Check Complete." -ForegroundColor Cyan
Write-Host "IMPORTANT: " -ForegroundColor Yellow
Write-Host "1. You may need to RESTART your terminal (or computer) for paths to update."
Write-Host "2. After installing Docker, search for 'Docker Desktop' in the Start Menu and run it."
Write-Host "3. Run 'aws configure' to set up your AWS credentials."
Write-Host "--------------------------------------------------"
