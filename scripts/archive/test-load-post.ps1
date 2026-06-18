$login = Invoke-RestMethod `
  -Method POST `
  -Uri 'http://localhost:8080/api/v1/auth/login' `
  -ContentType 'application/json' `
  -Body '{"email":"shipper@test.com","password":"N1kk101!"}'

$token = $login.accessToken
Write-Host "Token: $($token.Substring(0,20))..."

$body = @{
  originCity        = "Dallas"
  originState       = "TX"
  originZip         = "75201"
  originAddress1    = "123 Main St"
  destinationCity   = "Houston"
  destinationState  = "TX"
  destinationZip    = "77001"
  destinationAddress1 = "456 Oak Ave"
  pickupFrom        = "2026-05-08T09:00:00"
  pickupTo          = "2026-05-08T09:00:00"
  deliveryFrom      = "2026-05-09T09:00:00"
  deliveryTo        = "2026-05-09T09:00:00"
  commodity         = "General Freight"
  weightLbs         = 10000
  equipmentType     = "DRY_VAN"
  payRate           = 1500
  payRateType       = "FLAT_RATE"
} | ConvertTo-Json

try {
  $r = Invoke-RestMethod `
    -Method POST `
    -Uri 'http://localhost:8080/api/v1/loads' `
    -ContentType 'application/json' `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body $body
  Write-Host "SUCCESS: $($r | ConvertTo-Json)"
} catch {
  $statusCode = $_.Exception.Response.StatusCode.Value__
  Write-Host "STATUS: $statusCode"
  $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
  $responseBody = $reader.ReadToEnd()
  Write-Host "BODY: $responseBody"
  Write-Host "EXCEPTION: $($_.Exception.Message)"
}
