$ErrorActionPreference = "SilentlyContinue"
Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host "  AUDIT COMPLET SAKANI DZ" -ForegroundColor Cyan
Write-Host "=====================================================`n" -ForegroundColor Cyan

function Check-FileReal {
    param($Path, $Label, $MinBytes = 50)
    if (Test-Path $Path -PathType Leaf) {
        $size = (Get-Item $Path).Length
        if ($size -ge $MinBytes) {
            Write-Host "  [OK]       $Label" -ForegroundColor Green -NoNewline
            Write-Host " ($size o)" -ForegroundColor DarkGray
        } else {
            Write-Host "  [VIDE]     $Label" -ForegroundColor Yellow -NoNewline
            Write-Host " ($size o - probablement un placeholder)" -ForegroundColor DarkGray
        }
    } else {
        Write-Host "  [MANQUANT] $Label" -ForegroundColor Red
    }
}

function Check-DirReal {
    param($Path, $Label)
    if (Test-Path $Path -PathType Container) {
        $files = Get-ChildItem $Path -Recurse -File -ErrorAction SilentlyContinue
        $count = $files.Count
        $totalSize = ($files | Measure-Object -Property Length -Sum).Sum
        if ($count -gt 0 -and $totalSize -gt 100) {
            Write-Host "  [OK]       $Label" -ForegroundColor Green -NoNewline
            Write-Host " ($count fichier(s), $totalSize o)" -ForegroundColor DarkGray
        } else {
            Write-Host "  [VIDE]     $Label" -ForegroundColor Yellow -NoNewline
            Write-Host " (dossier existe mais vide/quasi-vide)" -ForegroundColor DarkGray
        }
    } else {
        Write-Host "  [MANQUANT] $Label" -ForegroundColor Red
    }
}

function Check-Pattern {
    param($Path, $Pattern, $Label)
    if (Test-Path $Path) {
        $found = Select-String -Path $Path -Pattern $Pattern -Quiet -ErrorAction SilentlyContinue
        if ($found) {
            Write-Host "  [OK]       $Label" -ForegroundColor Green
        } else {
            Write-Host "  [MANQUANT] $Label (fichier existe mais pattern absent)" -ForegroundColor Red
        }
    } else {
        Write-Host "  [MANQUANT] $Label (fichier absent)" -ForegroundColor Red
    }
}

# ===== MOBILE: ÉCRANS PRINCIPAUX =====
Write-Host "--- MOBILE : Écrans principaux ---" -ForegroundColor Yellow
Check-FileReal "artifacts\mobile\src\features\properties\PropertiesScreen.tsx" "Biens (liste)"
Check-FileReal "artifacts\mobile\src\features\properties\PropertyDetailScreen.tsx" "Biens (détail)"
Check-FileReal "artifacts\mobile\src\features\properties\components\PropertyCard.tsx" "PropertyCard (avec favori)"
Check-FileReal "artifacts\mobile\src\features\sites\SitesScreen.tsx" "Sites (liste)"
Check-FileReal "artifacts\mobile\src\features\sites\SiteDetailScreen.tsx" "Sites (détail)"
Check-FileReal "artifacts\mobile\src\features\tourism\TourismScreen.tsx" "Tourisme (liste)"
Check-FileReal "artifacts\mobile\src\features\tourism\TouristSpotDetailScreen.tsx" "Tourisme (détail)"
Check-FileReal "artifacts\mobile\src\shared\components\WilayaPicker.tsx" "WilayaPicker partagé"

# ===== MOBILE: HISTORIQUE & FAVORIS =====
Write-Host "`n--- MOBILE : Historique & Favoris ---" -ForegroundColor Yellow
Check-FileReal "artifacts\mobile\src\features\history-favorites\HistoryScreen.tsx" "Écran Historique"
Check-FileReal "artifacts\mobile\src\shared\hooks\useRecordHistory.ts" "Hook enregistrement auto historique"
Check-Pattern "artifacts\mobile\src\core\api\apiSlice.ts" "useAddFavoriteMutation|addFavorite" "Endpoint ajout favori"
Check-Pattern "artifacts\mobile\src\core\api\apiSlice.ts" "useRemoveFavoriteMutation|removeFavorite" "Endpoint suppression favori"
Check-Pattern "artifacts\mobile\src\core\api\apiSlice.ts" "useRemoveHistoryEntryMutation" "Endpoint suppression historique"

# ===== MOBILE: ESPACE VENDEUR =====
Write-Host "`n--- MOBILE : Espace Vendeur ---" -ForegroundColor Yellow
Check-FileReal "artifacts\mobile\src\features\vendor\VendorRegisterScreen.tsx" "Inscription vendeur"
Check-FileReal "artifacts\mobile\src\features\vendor\VendorLoginScreen.tsx" "Connexion vendeur"
Check-FileReal "artifacts\mobile\src\features\vendor\VendorForgotPasswordScreen.tsx" "Mot de passe oublié"
Check-FileReal "artifacts\mobile\src\features\vendor\VendorDashboardScreen.tsx" "Dashboard vendeur"
Check-FileReal "artifacts\mobile\src\features\vendor\VendorPropertyFormScreen.tsx" "Formulaire ajout/modif bien"
Check-Pattern "artifacts\mobile\src\core\navigation\RootNavigator.tsx" "state.auth.role|auth\.role" "Navigation conditionnelle par rôle"

# ===== MOBILE: AUTH & CORE =====
Write-Host "`n--- MOBILE : Auth & Core ---" -ForegroundColor Yellow
Check-FileReal "artifacts\mobile\src\core\device\deviceId.ts" "Device ID persistant"
Check-FileReal "artifacts\mobile\src\core\AuthBootstrap.tsx" "Bootstrap session anonyme"
Check-FileReal "artifacts\mobile\src\features\auth\authSlice.ts" "Auth slice Redux"
Check-FileReal "artifacts\mobile\src\core\api\apiSlice.ts" "API slice RTK Query"
Check-FileReal "artifacts\mobile\src\core\api\axiosInstance.ts" "Axios instance (web-safe)"

# ===== MOBILE: MULTILINGUE (vérif réelle du contenu) =====
Write-Host "`n--- MOBILE : Multilingue (i18n) ---" -ForegroundColor Yellow
Check-DirReal "artifacts\mobile\src\core\i18n" "Dossier i18n"
Check-FileReal "artifacts\mobile\src\core\i18n\index.ts" "Config i18next"
Check-FileReal "artifacts\mobile\src\core\i18n\locales\fr.json" "Traductions FR"
Check-FileReal "artifacts\mobile\src\core\i18n\locales\ar.json" "Traductions AR"
Check-FileReal "artifacts\mobile\src\core\i18n\locales\en.json" "Traductions EN"
Check-Pattern "artifacts\mobile\App.tsx" "i18n" "i18n importé dans App.tsx"
Check-Pattern "artifacts\mobile\src\features\properties\PropertiesScreen.tsx" "useTranslation|t\(" "Écrans utilisent t() (traduction réelle)"

# ===== MOBILE: MODE HORS-LIGNE =====
Write-Host "`n--- MOBILE : Mode hors-ligne SQLite ---" -ForegroundColor Yellow
Check-DirReal "artifacts\mobile\src\core\database" "Dossier database"
Check-Pattern "artifacts\mobile\src\core\database\*.ts" "drizzle-orm/expo-sqlite|openDatabaseSync" "Connexion SQLite configurée"

# ===== MOBILE: NOTIFICATIONS PUSH =====
Write-Host "`n--- MOBILE : Notifications push ---" -ForegroundColor Yellow
$notifFiles = Get-ChildItem artifacts\mobile\src -Recurse -Filter "*.ts*" -ErrorAction SilentlyContinue | Select-String -Pattern "expo-notifications" -List
if ($notifFiles) {
    $notifFiles | ForEach-Object { Write-Host "  [OK]       Référence trouvée: $($_.Path)" -ForegroundColor Green }
} else {
    Write-Host "  [MANQUANT] Aucune configuration expo-notifications trouvée" -ForegroundColor Red
}

# ===== MOBILE: FINITIONS PUBLICATION =====
Write-Host "`n--- MOBILE : Finitions avant publication ---" -ForegroundColor Yellow
Check-Pattern "artifacts\mobile\app.json" '"icon"' "Icône app configurée"
Check-Pattern "artifacts\mobile\app.json" '"splash"' "Splash screen configuré"
Check-Pattern "artifacts\mobile\app.json" "NSLocationWhenInUseUsageDescription|ACCESS_FINE_LOCATION" "Permissions localisation déclarées"
Check-FileReal "artifacts\mobile\src\features\legal\PrivacyPolicyScreen.tsx" "Politique de confidentialité"

# ===== BACKEND: ROUTES =====
Write-Host "`n--- BACKEND : Routes API ---" -ForegroundColor Yellow
Get-ChildItem artifacts\api-server\src\routes -Filter "*.ts" -ErrorAction SilentlyContinue | ForEach-Object {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    Write-Host "  [OK]       $($_.Name)" -ForegroundColor Green -NoNewline
    Write-Host " ($lines lignes)" -ForegroundColor DarkGray
}
Check-Pattern "artifacts\api-server\src\routes\auth.ts" "anonymous|Anonymous" "Endpoint auth anonyme client"

# ===== ADMIN =====
Write-Host "`n--- ADMIN : Fonctionnement ---" -ForegroundColor Yellow
Check-Pattern "artifacts\admin\src\main.tsx" "setBaseUrl" "setBaseUrl() appelé"
Check-FileReal "artifacts\admin\fix-css.mjs" "Fix CSS build (contournement Tailwind)"
Check-Pattern "artifacts\admin\package.json" "fix-css" "Hook fix-css dans le build"

# ===== SCRIPTS =====
Write-Host "`n--- Scripts utilitaires (seed) ---" -ForegroundColor Yellow
if (Test-Path "scripts\package.json") {
    Get-Content scripts\package.json | Select-String '"seed-|"test-' | ForEach-Object {
        Write-Host "  [OK]       $($_.Line.Trim())" -ForegroundColor Green
    }
}

Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host "  FIN DE L'AUDIT" -ForegroundColor Cyan
Write-Host "=====================================================`n" -ForegroundColor Cyan