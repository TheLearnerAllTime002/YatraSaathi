// Travel Planning based on Weather Forecast
function generateTravelPlan(containerId, weatherData, destination) {
    const container = document.getElementById(containerId);
    if (!container || !weatherData || !weatherData.list) return;
    
    // Analyze weather data for travel recommendations
    const forecast = weatherData.list.slice(0, 7);
    const recommendations = analyzeForecast(forecast, destination);
    
    container.innerHTML = `
        <div class="travel_quote">
            <div class="quote_icon">
                <i class="${recommendations.icon}"></i>
            </div>
            <div class="quote_content">
                <h4 class="quote_title">${recommendations.title}</h4>
                <p class="quote_text">"${recommendations.quote}"</p>
                <div class="quote_details">
                    <div class="weather_summary">
                        <span class="summary_item">
                            <i class="fa-solid fa-thermometer-half"></i>
                            ${recommendations.tempRange}
                        </span>
                        <span class="summary_item">
                            <i class="fa-solid fa-cloud"></i>
                            ${recommendations.condition}
                        </span>
                        <span class="summary_item">
                            <i class="fa-solid fa-calendar-days"></i>
                            ${recommendations.bestDays}
                        </span>
                    </div>
                    <div class="travel_advice">
                        ${recommendations.advice.map(tip => `
                            <div class="advice_item">
                                <i class="fa-solid fa-lightbulb"></i>
                                <span>${tip}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function analyzeForecast(forecast, destination) {
    const temps = forecast.map(f => f.main.temp);
    const conditions = forecast.map(f => f.weather[0].main.toLowerCase());
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    
    // Weather condition analysis
    const rainDays = conditions.filter(c => c.includes('rain')).length;
    const snowDays = conditions.filter(c => c.includes('snow')).length;
    const stormDays = conditions.filter(c => c.includes('thunderstorm')).length;
    const clearDays = conditions.filter(c => c.includes('clear') || c.includes('sun')).length;
    const cloudyDays = conditions.filter(c => c.includes('cloud')).length;
    
    // Generate recommendations based on thresholds
    if (stormDays >= 3) {
        return {
            icon: 'fa-solid fa-bolt',
            title: 'Severe Weather Alert',
            quote: 'Thunderstorms expected! Consider postponing outdoor activities and stay indoors for safety.',
            tempRange: `${Math.round(minTemp)}°C - ${Math.round(maxTemp)}°C`,
            condition: 'Stormy Weather',
            bestDays: 'Limited outdoor days',
            advice: [
                'Pack waterproof gear and umbrellas',
                'Book indoor attractions and museums',
                'Consider travel insurance',
                'Monitor weather updates regularly'
            ]
        };
    }
    
    if (snowDays >= 2) {
        return {
            icon: 'fa-solid fa-snowflake',
            title: 'Winter Wonderland',
            quote: 'Snow is expected! Perfect for winter sports but pack warm clothes and plan for delays.',
            tempRange: `${Math.round(minTemp)}°C - ${Math.round(maxTemp)}°C`,
            condition: 'Snowy Conditions',
            bestDays: 'Winter activity days',
            advice: [
                'Pack heavy winter clothing',
                'Book winter sports activities',
                'Check road conditions',
                'Carry emergency supplies'
            ]
        };
    }
    
    if (rainDays >= 4) {
        return {
            icon: 'fa-solid fa-cloud-rain',
            title: 'Rainy Season Travel',
            quote: 'Frequent rain expected. Great for cozy indoor experiences and lush green scenery!',
            tempRange: `${Math.round(minTemp)}°C - ${Math.round(maxTemp)}°C`,
            condition: 'Rainy Weather',
            bestDays: 'Indoor exploration days',
            advice: [
                'Pack rain gear and waterproof bags',
                'Plan indoor activities and museums',
                'Book covered accommodations',
                'Enjoy local cuisine and cafes'
            ]
        };
    }
    
    if (avgTemp > 35) {
        return {
            icon: 'fa-solid fa-sun',
            title: 'Hot Weather Advisory',
            quote: 'Very hot temperatures ahead! Stay hydrated and plan activities during cooler hours.',
            tempRange: `${Math.round(minTemp)}°C - ${Math.round(maxTemp)}°C`,
            condition: 'Very Hot',
            bestDays: 'Early morning & evening',
            advice: [
                'Stay hydrated and use sunscreen',
                'Plan activities for early morning/evening',
                'Seek air-conditioned accommodations',
                'Pack light, breathable clothing'
            ]
        };
    }
    
    if (avgTemp < 0) {
        return {
            icon: 'fa-solid fa-icicles',
            title: 'Freezing Conditions',
            quote: 'Sub-zero temperatures expected! Bundle up and enjoy winter activities safely.',
            tempRange: `${Math.round(minTemp)}°C - ${Math.round(maxTemp)}°C`,
            condition: 'Freezing Cold',
            bestDays: 'Midday warmth',
            advice: [
                'Pack heavy winter gear',
                'Book heated accommodations',
                'Plan shorter outdoor activities',
                'Carry hand warmers and hot drinks'
            ]
        };
    }
    
    if (clearDays >= 5) {
        return {
            icon: 'fa-solid fa-sun',
            title: 'Perfect Travel Weather',
            quote: 'Excellent conditions ahead! Perfect time for outdoor adventures and sightseeing.',
            tempRange: `${Math.round(minTemp)}°C - ${Math.round(maxTemp)}°C`,
            condition: 'Clear & Sunny',
            bestDays: 'All week perfect!',
            advice: [
                'Pack sunscreen and sunglasses',
                'Plan outdoor activities and hiking',
                'Book outdoor dining experiences',
                'Perfect for photography and tours'
            ]
        };
    }
    
    // Default pleasant weather
    return {
        icon: 'fa-solid fa-cloud-sun',
        title: 'Pleasant Travel Conditions',
        quote: 'Mixed but generally good weather! Great for a balanced mix of indoor and outdoor activities.',
        tempRange: `${Math.round(minTemp)}°C - ${Math.round(maxTemp)}°C`,
        condition: 'Mixed Conditions',
        bestDays: `${clearDays} clear days`,
        advice: [
            'Pack layers for changing weather',
            'Plan flexible indoor/outdoor activities',
            'Check daily forecasts',
            'Perfect for exploring local culture'
        ]
    };
}

window.generateTravelPlan = generateTravelPlan;