# Promote an existing user to admin, or create a new superuser.
# Usage:
#   Promote:  .\promote-admin.ps1 -Email "you@example.com"
#   Create:   .\promote-admin.ps1 -Email "you@example.com" -Password "YourPassword" -Name "Your Name"
# Set $WorkerUrl and $AdminSecret below, or pass -WorkerUrl and -AdminSecret.

param(
    [Parameter(Mandatory = $true)]
    [string]$Email,
    [string]$Password,
    [string]$Name,
    [string]$WorkerUrl = $env:VITE_CF_API_URL,
    [string]$AdminSecret = $env:ADMIN_SEED_SECRET
)

if (-not $WorkerUrl) { Write-Error "Set WorkerUrl (e.g. https://alnitar-api.xxx.workers.dev) or env VITE_CF_API_URL"; exit 1 }
if (-not $AdminSecret) { Write-Error "Set AdminSecret or env ADMIN_SEED_SECRET (run: npx wrangler secret put ADMIN_SEED_SECRET)"; exit 1 }

$base = $WorkerUrl.TrimEnd("/")
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $AdminSecret"
}

try {
    if ($Password) {
        $body = @{ email = $Email; password = $Password; name = if ($Name) { $Name } else { $Email.Split("@")[0] } } | ConvertTo-Json
        Invoke-RestMethod -Uri "$base/api/admin/create-superuser" -Method POST -Headers $headers -Body $body | Out-Null
        Write-Host "Created superuser: $Email (sign in with this email and password)"
    } else {
        $body = @{ email = $Email } | ConvertTo-Json
        Invoke-RestMethod -Uri "$base/api/admin/promote" -Method POST -Headers $headers -Body $body | Out-Null
        Write-Host "Promoted to admin: $Email (sign in with your existing password)"
    }
} catch {
    $err = $_.ErrorDetails.Message
    if (-not $err) { $err = $_.Exception.Message }
    Write-Error $err
    exit 1
}
