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
        const containerWidth = container.offsetWidth || 300;
        const width = Math.min(containerWidth - 20, containerWidth);
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        const height = isSmallMobile ? 200 : isMobile ? 250 : 300;
        const margin = { 
            top: isSmallMobile ? 20 : isMobile ? 25 : 30, 
            right: isSmallMobile ? 15 : isMobile ? 20 : 25, 
            bottom: isSmallMobile ? 35 : isMobile ? 40 : 45, 
            left: isSmallMobile ? 25 : isMobile ? 30 : 35 
        };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        const maxTemp = Math.max(...chartData.map(d => d.temp));
        const minTemp = Math.min(...chartData.map(d => d.temp));
        const tempRange = maxTemp - minTemp || 10;
        
        let svg = `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background: white; border-radius: 10px; opacity: 0; animation: fadeIn 0.8s ease forwards; max-width: 100%; height: auto;">
                <defs>
                    <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:#FF6B35;stop-opacity:0.05" />
                    </linearGradient>
                </defs>
                <style>
                    @keyframes fadeIn { to { opacity: 1; } }
                    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
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
            
            // Add animated labels with responsive font sizes and better positioning
            const dayFontSize = isSmallMobile ? 9 : isMobile ? 10 : 11;
            const tempFontSize = isSmallMobile ? 10 : isMobile ? 11 : 12;
            const dayY = height - (isSmallMobile ? 12 : isMobile ? 15 : 18);
            const tempY = y - (isSmallMobile ? 12 : isMobile ? 15 : 18);
            
            svg += `<text x="${x}" y="${dayY}" text-anchor="middle" font-size="${dayFontSize}" fill="#666" font-weight="500" style="opacity: 0; animation: fadeIn 0.5s ease ${i * 0.1 + 0.3}s both;">${d.day}</text>`;
            svg += `<text x="${x}" y="${tempY}" text-anchor="middle" font-size="${tempFontSize}" fill="#FF6B35" font-weight="bold" style="opacity: 0; animation: fadeIn 0.5s ease ${i * 0.1 + 0.5}s both;">${d.temp}°</text>`;
        });
        
        pathData += ` L ${margin.left + chartWidth} ${height - margin.bottom} Z`;
        
        // Add animated area and line
        svg += `<path d="${pathData}" fill="url(#tempGradient)" style="opacity: 0; animation: fadeIn 0.8s ease 0.5s both;"/>`;
        svg += `<path d="${lineData}" fill="none" stroke="#FF6B35" stroke-width="2" stroke-dasharray="500" style="animation: drawLine 1.2s ease 0.3s both;"/>`;
        
        svg += '</svg>';
        
        container.innerHTML = svg;
    }, 1200);
}

window.renderForecastChart = renderForecastChart;