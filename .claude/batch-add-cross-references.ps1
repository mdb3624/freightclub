# Batch Cross-Reference Adder
# Adds bidirectional cross-references to all markdown files
# Run from project root: .\\.claude\batch-add-cross-references.ps1

param(
    [string]$Path = "docs/business/stories",
    [string]$Pattern = "US-*.md",
    [switch]$DryRun = $false,
    [switch]$AddToAllDocs = $false
)

$ErrorActionPreference = "Stop"

function Add-StoryHeader {
    param([string]$FilePath, [string]$StoryId)

    $content = Get-Content -Path $FilePath -Raw

    # Skip if already has Related Documents section
    if ($content -match "📍 Related Documents") {
        Write-Host "⏭️  $StoryId already has cross-references, skipping..."
        return
    }

    # Extract story metadata from first few lines
    $lines = $content -split "`n" | Select-Object -First 10
    $phaseMatch = $lines | Select-String "Phase"
    $dependsMatch = $lines | Select-String "Depends On"
    $blocksMatch = $lines | Select-String "Blocks"

    # Build Related Documents section
    $related = "`n**📍 Related Documents**`n"
    $related += "- [[Story_Map.md|← Story Map (Master Index)]] — Find all stories here`n"
    $related += "- [[VAULT_INDEX.md]] — Complete documentation index`n"
    $related += "- [[docs/roles/BUSINESS_ANALYST.md]] — How stories are written`n"

    if ($dependsMatch) {
        $related += "- **Dependencies:** See story file for details`n"
    }
    if ($blocksMatch) {
        $related += "- **Enables:** See story file for details`n"
    }

    $related += "`n---`n"

    # Insert after title and metadata (before User Story section)
    $newContent = $content -replace "(^# .+?\n\n.*?---\n)", "`$1$related"

    # Add footer before end
    $footer = "`n---`n`n## Navigation`n`n"
    $footer += "[[Story_Map.md|← Back to Story Map]] | [[VAULT_INDEX.md|Documentation Index]]`n`n"
    $footer += "**Story File:** \`docs/business/stories/$StoryId.md\`"

    if ($newContent -notmatch "## Navigation") {
        $newContent = $newContent -replace "(.*)", "`$1$footer" -replace "(.*?)", "`$1", 1
        $newContent += $footer
    }

    if (-not $DryRun) {
        Set-Content -Path $FilePath -Value $newContent -Encoding UTF8
        Write-Host "✅ Updated: $StoryId"
    } else {
        Write-Host "🔍 [DRY RUN] Would update: $StoryId"
    }
}

# Main execution
Write-Host "🔄 Batch Cross-Reference Processor`n"
Write-Host "Path: $Path"
Write-Host "Pattern: $Pattern"
Write-Host "Dry Run: $DryRun`n"

$files = Get-ChildItem -Path $Path -Filter $Pattern -ErrorAction SilentlyContinue

if ($files.Count -eq 0) {
    Write-Host "❌ No files found matching pattern: $Pattern in $Path"
    exit 1
}

Write-Host "📊 Found $($files.Count) files to process`n"

$updated = 0
foreach ($file in $files) {
    $storyId = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    try {
        Add-StoryHeader -FilePath $file.FullName -StoryId $storyId
        $updated++
    } catch {
        Write-Host "❌ Error processing $storyId : $_"
    }
}

Write-Host "`n✅ Processing complete!"
Write-Host "Updated: $updated/$($files.Count) files"

if ($DryRun) {
    Write-Host "`n💡 Tip: Run without -DryRun flag to apply changes`n"
    Write-Host "Example: .\batch-add-cross-references.ps1 -DryRun:`$false"
}
