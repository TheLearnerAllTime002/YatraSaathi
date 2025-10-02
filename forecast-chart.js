// Simple chart using Chart.js instead
function renderForecastChart(containerId, weatherData) {
    if (!weatherData || !weatherData.list) return;
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Show loading animation first
    container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 300px; flex-direction: column;">
            <dotlottie-wc src="https://lottie.host/e7125e64-74bd-4732-bb19-87e2aafb5d2a/5RmW4UGyWf.lottie" style="width: 100px; height: 100px;" autoplay loop></dotlottie-wc>
            <p style="color: #666; margin-top: 1rem; font-weight: 600;">Loading forecast chart...</p>
        </div>
    `;
    
    // Process data for chart
    const chartData = weatherData.list
        .filter((_, index) => index % 8 === 0)
        .slice(0, 7)
        .map(item => ({
            day: new Date(item.dt * 1000).toLocaleDateString('en', { weekday: 'short', day: 'numeric' }),
            temp: Math.round(item.main.temp),
            weather: item.weather[0].main
        }));
    
    // Animate chart loading after delay
    setTimeout(() => {
        const width = container.offsetWidth || 400;
        const height = 300;
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        const maxTemp = Math.max(...chartData.map(d => d.temp));
        const minTemp = Math.min(...chartData.map(d => d.temp));
        const tempRange = maxTemp - minTemp || 10;
        
        let svg = `
            <svg width="${width}" height="${height}" style="background: white; border-radius: 15px; opacity: 0; animation: fadeIn 0.8s ease forwards;">
                <defs>
                    <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:#FF6B35;stop-opacity:0.05" />
                    </linearGradient>
                </defs>
                <style>
                    @keyframes fadeIn { to { opacity: 1; } }
                    @keyframes drawLine { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
                    @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
                </style>
        `;
        
        // Draw grid lines
        for (let i = 0; i <= 4; i++) {
            const y = margin.top + (chartHeight / 4) * i;
            svg += `<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="rgba(255,107,53,0.1)" stroke-dasharray="3,3"/>`;
        }
        
        // Create path for area chart
        let pathData = `M ${margin.left} ${height - margin.bottom}`;
        let lineData = '';
        
        chartData.forEach((d, i) => {
            const x = margin.left + (chartWidth / (chartData.length - 1)) * i;
            const y = margin.top + chartHeight - ((d.temp - minTemp) / tempRange) * chartHeight;
            
            if (i === 0) {
                pathData += ` L ${x} ${y}`;
                lineData = `M ${x} ${y}`;
            } else {
                pathData += ` L ${x} ${y}`;
                lineData += ` L ${x} ${y}`;
            }
            
            // Add animated data points
            svg += `<circle cx="${x}" cy="${y}" r="4" fill="#FF6B35" stroke="white" stroke-width="2" style="animation: scaleIn 0.5s ease ${i * 0.1}s both;"/>`;
            
            // Add animated labels
            svg += `<text x="${x}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#666" style="opacity: 0; animation: fadeIn 0.5s ease ${i * 0.1 + 0.3}s both;">${d.day}</text>`;
            svg += `<text x="${x}" y="${y - 10}" text-anchor="middle" font-size="12" fill="#FF6B35" font-weight="bold" style="opacity: 0; animation: fadeIn 0.5s ease ${i * 0.1 + 0.5}s both;">${d.temp}°</text>`;
        });
        
        pathData += ` L ${margin.left + chartWidth} ${height - margin.bottom} Z`;
        
        // Add animated area and line
        svg += `<path d="${pathData}" fill="url(#tempGradient)" style="opacity: 0; animation: fadeIn 0.8s ease 0.5s both;"/>`;
        svg += `<path d="${lineData}" fill="none" stroke="#FF6B35" stroke-width="3" stroke-dasharray="1000" style="animation: drawLine 1.5s ease 0.3s both;"/>`;
        
        svg += '</svg>';
        
        container.innerHTML = svg;
    }, 1500);
}

window.renderForecastChart = renderForecastChart;