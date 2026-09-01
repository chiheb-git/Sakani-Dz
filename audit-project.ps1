Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  AUDIT SAKANI DZ - État des fonctionnalités" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

function Check-File {
    param($Path, $Label)
    if (Test-Path $Path) {
        $size = (Get-Item $Path).Length
        Write-Host "  [OK] $Label" -ForegroundColor Green -NoNewline
        Write-Host " ($size bytes)" -ForegroundColor DarkGray
    } else {
        Write-Host "  [MANQUANT] $Label" -ForegroundColor Red
    }
}

Write-Host "--- MOBILE : Écrans principaux ---" -ForegroundColor Yellow
Check-File "artifacts\mobile\src\features\properties\PropertiesScreen.tsx" "Biens (liste)"
Check-File "artifacts\mobile\src\features\properties\PropertyDetailScreen.tsx" "Biens (détail)"
Check-File "artifacts\mobile\src\features\sites\SitesScreen.tsx" "Sites (liste)"
Check-File "artifacts\mobile\src\features\sites\SiteDetailScreen.tsx" "Sites (détail)"
Check-File "artifacts\mobile\src\features\tourism\TourismScreen.tsx" "Tourisme (liste)"
Check-File "artifacts\mobile\src\features\tourism\TouristSpotDetailScreen.tsx" "Tourisme (détail)"
Check-File "artifacts\mobile\src\features\history-favorites\HistoryScreen.tsx" "Historique"
Check-File "artifacts\mobile\src\shared\hooks\useRecordHistory.ts" "Hook historique auto"

Write-Host "`n--- MOBILE : Espace Vendeur ---" -ForegroundColor Yellow
Check-File "artifacts\mobile\src\features\vendor\VendorRegisterScreen.tsx" "Inscription vendeur"
Check-File "artifacts\mobile\src\features\vendor\VendorLoginScreen.tsx" "Connexion vendeur"
Check-File "artifacts\mobile\src\features\vendor\VendorForgotPasswordScreen.tsx" "Mot de passe oublié"
Check-File "artifacts\mobile\src\features\vendor\VendorDashboardScreen.tsx" "Dashboard vendeur"
Check-File "artifacts\mobile\src\features\vendor\VendorPropertyFormScreen.tsx" "Ajout/modif bien vendeur"

Write-Host "`n--- MOBILE : Auth & Core ---" -ForegroundColor Yellow
Check-File "artifacts\mobile\src\core\device\deviceId.ts" "Device ID persistant"
Check-File "artifacts\mobile\src\core\AuthBootstrap.tsx" "Bootstrap session anonyme"
Check-File "artifacts\mobile\src\features\auth\authSlice.ts" "Auth slice Redux"
Check-File "artifacts\mobile\src\core\api\apiSlice.ts" "API slice RTK Query"
Check-File "artifacts\mobile\src\core\api\axiosInstance.ts" "Axios instance (web-safe)"

Write-Host "`n--- MOBILE : Fonctionnalités restantes (passation) ---" -ForegroundColor Yellow
$i18n = Test-Path "artifacts\mobile\src\core\i18n"
if ($i18n) { Write-Host "  [OK] Multilingue (i18n)" -ForegroundColor Green } else { Write-Host "  [MANQUANT] Multilingue (i18n) - étape 5" -ForegroundColor Red }

$db = Test-Path "artifacts\mobile\src\core\database"
if ($db) { Write-Host "  [OK] Mode hors-ligne SQLite" -ForegroundColor Green } else { Write-Host "  [MANQUANT] Mode hors-ligne SQLite - étape 6" -ForegroundColor Red }

$notif = Get-ChildItem artifacts\mobile\src -Recurse -Filter "*notif*" -ErrorAction SilentlyContinue
if ($notif) { Write-Host "  [OK] Notifications push" -ForegroundColor Green } else { Write-Host "  [MANQUANT] Notifications push - étape 7" -ForegroundColor Red }

Write-Host "`n--- BACKEND : Routes ---" -ForegroundColor Yellow
Get-ChildItem artifacts\api-server\src\routes -Filter "*.ts" | ForEach-Object {
    Write-Host "  [OK] $($_.Name)" -ForegroundColor Green
}

Write-Host "`n--- ADMIN : Fonctionnement ---" -ForegroundColor Yellow
Check-File "artifacts\admin\src\main.tsx" "Point d'entrée (setBaseUrl configuré)"
$mainContent = Get-Content "artifacts\admin\src\main.tsx" -Raw -ErrorAction SilentlyContinue
if ($mainContent -match "setBaseUrl") { Write-Host "  [OK] setBaseUrl() appelé" -ForegroundColor Green } else { Write-Host "  [MANQUANT] setBaseUrl() non appelé" -ForegroundColor Red }
Check-File "artifacts\admin\fix-css.mjs" "Fix CSS build (contournement bug Tailwind)"

Write-Host "`n--- Scripts de seed disponibles ---" -ForegroundColor Yellow
Get-Content scripts\package.json | Select-String '"seed-' | ForEach-Object {
    Write-Host "  $($_.Line.Trim())" -ForegroundColor DarkGray
}

Write-Host "`n--- Typecheck global ---" -ForegroundColor Yellow