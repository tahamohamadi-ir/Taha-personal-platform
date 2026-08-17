# Interactive production CMS update + migrate. Opens SSH with sudo password prompt.
$ErrorActionPreference = "Stop"
$LogFile = Join-Path $PSScriptRoot "..\..\cms-deploy-output.log"
$Key = Join-Path $env:USERPROFILE ".ssh\taha-platform-ops"
$Remote = "deploy@85.192.29.196"
$Port = 2222
$Image = "ghcr.io/tahamohamadi-ir/taha-cms:b369885"

Write-Host "Production CMS update + migrate"
Write-Host "Enter VPS sudo password when prompted."
Write-Host "Log: $LogFile"
Write-Host ""

$cmd = @"
export CMS_IMAGE=$Image CMS_BUILD=0
sudo CMS_IMAGE=$Image CMS_BUILD=0 bash /home/deploy/cms-repo/infra/deploy/prod-cms-update-migrate.sh
echo FINAL_EXIT=`$?
"@

ssh -tt -p $Port -i $Key -o IdentitiesOnly=yes $Remote $cmd 2>&1 | Tee-Object -FilePath $LogFile

Write-Host ""
Write-Host "Done. See $LogFile"
