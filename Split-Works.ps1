# Create works directory if it doesn't exist
$worksDir = "works"
if (-not (Test-Path -Path $worksDir)) {
    New-Item -ItemType Directory -Path $worksDir | Out-Null
}

# Read the entire JSON file
$jsonContent = Get-Content -Path "output.json" -Raw -Encoding UTF8
$data = $jsonContent | ConvertFrom-Json

# Create an array to store index information
$index = @()

# Process each work
foreach ($work in $data.works) {
    $workTitle = $work.work_title
    
    # Create a safe filename
    $invalidChars = [System.IO.Path]::GetInvalidFileNameChars() -join ''
    $safeTitle = ($workTitle -split "[$invalidChars]" -join '_').Trim('_')
    $filename = "work-$safeTitle.json"
    $filepath = Join-Path -Path $worksDir -ChildPath $filename
    
    # Save the work to its own file
    $work | ConvertTo-Json -Depth 100 | Out-File -FilePath $filepath -Encoding utf8
    
    # Add to index
    $index += [PSCustomObject]@{
        work_title = $workTitle
        file = $filename
        parts = $work.parts | ForEach-Object { $_.part_title }
    }
    
    Write-Host "Created: $filename"
}

# Save the index file
$index | ConvertTo-Json -Depth 10 | Out-File -FilePath (Join-Path -Path $worksDir -ChildPath "works_index.json") -Encoding utf8

Write-Host "`nSplit $($data.works.Count) works into separate files in the '$worksDir' directory."
Write-Host "Created 'works_index.json' with metadata about all works."
