# Build and test script for Nakama with Rollup (PowerShell)
param(
    [switch]$SkipTest = $false
)

Write-Host "🔄 Building Nakama with Rollup Docker image..." -ForegroundColor Cyan

try {
    # Build the Docker image
    Write-Host "Building Docker image..." -ForegroundColor Yellow
    docker build -t nakama-rollup:latest .
    
    if ($LASTEXITCODE -ne 0) {
        throw "Docker build failed"
    }
    
    Write-Host "✅ Docker image built successfully!" -ForegroundColor Green
    
    if (-not $SkipTest) {
        # Test the image
        Write-Host "🧪 Testing the Docker image..." -ForegroundColor Cyan
        
        # Run container in detached mode
        $ContainerId = docker run -d -p 7349:7349 -p 7350:7350 -p 7351:7351 nakama-rollup:latest
        
        Write-Host "📦 Container started with ID: $ContainerId" -ForegroundColor Blue
        
        # Wait for Nakama to start
        Write-Host "⏳ Waiting for Nakama to start..." -ForegroundColor Yellow
        Start-Sleep 15
        
        # Check if container is running
        $IsRunning = docker ps --filter "id=$ContainerId" --format "{{.ID}}"
        
        if ($IsRunning) {
            Write-Host "✅ Container is running successfully!" -ForegroundColor Green
            
            # Test health check
            try {
                docker exec $ContainerId /nakama/nakama healthcheck | Out-Null
                Write-Host "✅ Health check passed!" -ForegroundColor Green
            }
            catch {
                Write-Host "⚠️  Health check failed" -ForegroundColor Yellow
            }
            
            # Show logs
            Write-Host "📋 Container logs:" -ForegroundColor Cyan
            docker logs $ContainerId | Select-Object -Last 20
        }
        else {
            Write-Host "❌ Container failed to start" -ForegroundColor Red
            docker logs $ContainerId
            exit 1
        }
        
        # Cleanup
        Write-Host "🧹 Cleaning up test container..." -ForegroundColor Yellow
        docker stop $ContainerId | Out-Null
        docker rm $ContainerId | Out-Null
    }
    
    Write-Host "🎉 Build completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To run the container:" -ForegroundColor Cyan
    Write-Host "docker run -p 7349:7349 -p 7350:7350 -p 7351:7351 nakama-rollup:latest" -ForegroundColor White
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}