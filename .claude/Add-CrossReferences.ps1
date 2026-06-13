# Add Cross-References to Story Files
# Usage: cd c:\projects\freightclub; .\\.claude\Add-CrossReferences.ps1

param(
    [switch]$DryRun = $false
)

$storiesPath = "docs/business/stories"
$files = Get-ChildItem -Path $storiesPath -Filter "US-*.md" | Sort-Object Name

Write-Host "Processing $($files.Count) story files...`n"

$updated = 0

foreach ($file in $files) {
    $storyId = $file.BaseName
    $filePath = $file.FullName

    try {
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8

        # Skip if already has cross-references
        if ($content -match "Related Documents") {
            Write-Host "SKIP: $storyId (already has cross-references)"
            continue
        }

        # Extract dependencies
        $depends = @()
        $enablesMatch = $content | Select-String "Blocks[:\s]*([^\n]+)"
        if ($enablesMatch) {
            $enables = [regex]::Matches($enablesMatch.Line, "US-\d+") | ForEach-Object { $_.Value }
        } else {
            $enables = @()
        }

        # Build header
        $header = "`n**Related Documents**`n"
        $header += "- [[Story_Map.md]] - Master Story Index`n"
        $header += "- [[VAULT_INDEX.md]] - Documentation Index`n"

        if ($enables.Count -gt 0) {
            $enablesLinks = $enables | ForEach-Object { "[[${_}.md|${_}]]" } | Join-String -Separator ", "
            $header += "- **Enables:** $enablesLinks`n"
        }

        $header += "`n---`n"

        # Insert header after first separator
        $newContent = $content -replace "(^---`n)", "`$1$header", 1

        # Add footer
        $footer = "`n---`n`n## Navigation`n`n"
        $footer += "[[Story_Map.md]] | [[VAULT_INDEX.md]]"

        if ($newContent -notmatch "## Navigation") {
            $newContent = $newContent + $footer
        }

        # Write back
        if (-not $DryRun) {
            Set-Content -Path $filePath -Value $newContent -Encoding UTF8
            Write-Host "DONE: $storyId"
        } else {
            Write-Host "PREVIEW: $storyId"
        }

        $updated++

    } catch {
        Write-Host "ERROR: $storyId - $_"
    }
}

Write-Host "`nCompleted: $updated/$($files.Count) files"
if ($DryRun) {
    Write-Host "DRY RUN MODE - No changes were made"
}
