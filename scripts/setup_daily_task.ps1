# ==============================================================================
# Script de Planification de la Tâche Quotidienne Cardmarket (OPTCG Master)
# Exécute la synchronisation automatique des cotes chaque matin à 06:00
# ==============================================================================

$TaskName = "OPTCG_Master_Daily_Sync_Prices"
$ScriptDir = "C:\Users\LuffyVlg\.gemini\antigravity\scratch\optcg-master"
$NodeExe = (Get-Command node -ErrorAction SilentlyContinue).Source

if (-not $NodeExe) {
    $NodeExe = "node.exe"
}

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  PLANIFICATEUR DE TÂCHE QUOTIDIENNE OPTCG MASTER" -ForegroundColor Yellow
Write-Host "===========================================================" -ForegroundColor Cyan

# 1. Vérification des chemins
$SyncScript = Join-Path $ScriptDir "scripts\sync_prices.cjs"
if (-not (Test-Path $SyncScript)) {
    Write-Error "Le script $SyncScript est introuvable."
    exit 1
}

# 2. Supprimer la tâche existante si déjà présente
$ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($ExistingTask) {
    Write-Host "[!] Une tâche existante a été détectée. Remplacement en cours..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# 3. Création de l'action et du déclencheur (Tous les matins à 06:00)
$Action = New-ScheduledTaskAction -Execute $NodeExe -Argument "scripts/sync_prices.cjs" -WorkingDirectory $ScriptDir
$Trigger = New-ScheduledTaskTrigger -Daily -At "06:00"
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# 4. Enregistrement de la tâche
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Mise a jour automatique quotidienne des cotes Cardmarket pour OPTCG Master"

Write-Host "`n[OK] Tâche planifiée avec succès !" -ForegroundColor Green
Write-Host "  Nom de la tâche : $TaskName" -ForegroundColor White
Write-Host "  Heure d'exécution : Chaque matin à 06:00" -ForegroundColor White
Write-Host "  Répertoire de travail : $ScriptDir" -ForegroundColor White
Write-Host "`nPour tester la tâche immédiatement, vous pouvez lancer :" -ForegroundColor Cyan
Write-Host "  Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Yellow
Write-Host "===========================================================" -ForegroundColor Cyan
