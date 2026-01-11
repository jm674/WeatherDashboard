const API_KEY="946ab5d9d1f00cc6b46d51f464c9eb17";
let forecastData=[];

date.innerText=new Date().toDateString();

async function fetchWeather(url){
    const res=await fetch(url);
    return res.json();
}

function formatTime(ts,tz){
    return new Date((ts+tz)*1000).toUTCString().slice(17,22);
}



function setWeatherBackground(weather, cityTime, sunrise, sunset) {
    document.body.className = "";

    weather = weather.toLowerCase();

    
    const sunriseCity = sunrise + (cityTime - Math.floor(Date.now()/1000));
    const sunsetCity  = sunset  + (cityTime - Math.floor(Date.now()/1000));

    const eveningStart = sunsetCity - 3600;
    const eveningEnd   = sunsetCity + 3600;

    if (cityTime >= eveningStart && cityTime <= eveningEnd) {
        document.body.classList.add("bg-evening");
        return;
    }

    if (cityTime < sunriseCity || cityTime > sunsetCity) {
        document.body.classList.add("bg-night");
        return;
    }

    if (weather.includes("clear")) {
        document.body.classList.add("bg-sunny");
    } else if (weather.includes("cloud")) {
        document.body.classList.add("bg-cloudy");
    } else if (weather.includes("rain") || weather.includes("drizzle")) {
        document.body.classList.add("bg-rainy");
    } else if (
        weather.includes("haze") ||
        weather.includes("mist") ||
        weather.includes("fog") ||
        weather.includes("smoke")
    ) {
        document.body.classList.add("bg-haze");
    } else {
        document.body.classList.add("bg-cloudy");
    }
}



function getWeatherImage(condition, isNight) {
    condition = condition.toLowerCase();

    if (condition.includes("clear")) {
        return isNight
            ? "https://cdn-icons-png.flaticon.com/512/1163/1163624.png" // 🌙 moon
            : "https://cdn-icons-png.flaticon.com/512/869/869869.png"; // ☀️ sun
    }

    if (condition.includes("cloud")) {
        return "https://cdn-icons-png.flaticon.com/512/414/414927.png";
    }

    if (condition.includes("rain") || condition.includes("drizzle")) {
        return "https://cdn-icons-png.flaticon.com/512/3351/3351979.png";
    }

    if (condition.includes("thunder")) {
        return "https://cdn-icons-png.flaticon.com/512/1146/1146869.png";
    }

    if (condition.includes("snow")) {
        return "https://cdn-icons-png.flaticon.com/512/642/642102.png";
    }

    if (
        condition.includes("mist") ||
        condition.includes("fog") ||
        condition.includes("haze") ||
        condition.includes("smoke") ||
        condition.includes("dust")
    ) {
        return "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";
    }

    return isNight
        ? "https://cdn-icons-png.flaticon.com/512/1163/1163624.png"
        : "https://cdn-icons-png.flaticon.com/512/869/869869.png";
}



function updateCurrent(d){
    city.innerText = `${d.name}, ${d.sys.country}`;
    temp.innerText = Math.round(d.main.temp) + "°";
    desc.innerText = d.weather[0].description;

    wind.innerText = d.wind.speed + " m/s";
    humidity.innerText = d.main.humidity + "%";
    pressure.innerText = d.main.pressure + " hPa";
    feels.innerText = Math.round(d.main.feels_like) + "°";
    visibility.innerText = d.visibility / 1000 + " km";
    clouds.innerText = d.clouds.all + "%";

    sunrise.innerText = formatTime(d.sys.sunrise, d.timezone);
    sunset.innerText = formatTime(d.sys.sunset, d.timezone);
    updated.innerText = new Date().toLocaleTimeString();
    
    const nowUTC = Math.floor(Date.now() / 1000);
    const cityTime = nowUTC + d.timezone;

    const isNight =
    cityTime < d.sys.sunrise ||
    cityTime > d.sys.sunset;


setWeatherBackground(
    d.weather[0].main,
    cityTime,
    d.sys.sunrise,
    d.sys.sunset
);

    weatherIconMain.src = getWeatherImage(
        d.weather[0].main,
        isNight
    );
}



function buildOverview(d){
    const overview=document.getElementById("overview");
    const nowUTC = Math.floor(Date.now() / 1000);
    const cityTime = nowUTC + d.timezone;

overview.className =
    cityTime > d.sys.sunrise && cityTime < d.sys.sunset
    ? "overview-card day"
    : "overview-card night";

    const hours=forecastData.slice(0,10);
    hourlyRow.innerHTML="";
    const temps=[];

    hours.forEach(h=>{
        temps.push(h.main.temp);
        hourlyRow.innerHTML+=`
        <div class="hour">
            <div>${new Date(h.dt*1000).getHours()}:00</div>
            <img src="https://openweathermap.org/img/wn/${h.weather[0].icon}.png">
            <div>${Math.round(h.main.temp)}°</div>
        </div>`;
    });

    const max=Math.max(...temps),min=Math.min(...temps);
    let path="M0 260 ";
    temps.forEach((t,i)=>{
        const x=i/(temps.length-1)*1000;
        const y=260-(t-min)/(max-min)*150;
        path+=`L${x} ${y} `;
    });
    path+="L1000 300 L0 300 Z";

    overviewGraph.innerHTML=`
    <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#facc15" stop-opacity=".6"/>
            <stop offset="100%" stop-color="#2563eb" stop-opacity=".25"/>
        </linearGradient>
    </defs>
    <path d="${path}" fill="url(#g)"/>`;

    sunriseTime.innerText="🌅 "+formatTime(d.sys.sunrise,d.timezone);
    sunsetTime.innerText="🌇 "+formatTime(d.sys.sunset,d.timezone);
}



function updateTodayDetails(d){
    detailTemp.innerText = Math.round(d.main.temp)+"°";
    detailFeels.innerText = Math.round(d.main.feels_like)+"°";
    detailCloud.innerText = d.clouds.all+"%";
    detailVisibility.innerText = (d.visibility/1000).toFixed(1)+" km";
    detailWind.innerText = Math.round(d.wind.speed*3.6);
    detailGust.innerText = d.wind.gust
        ? Math.round(d.wind.gust*3.6)
        : Math.round(d.wind.speed*3.6+5);

    cloudDesc.innerText = d.weather[0].main;
    nowTime.innerText = new Date().toLocaleTimeString([],{
        hour:"2-digit", minute:"2-digit"
    });
}



async function loadWeather(urlW, urlF){
    const w = await fetchWeather(urlW);

    if (w.cod !== 200) {
        alert("City not found or API error");
        return;
    }

    const f = await fetchWeather(urlF);

    forecastData = f.list;
    updateCurrent(w);
    buildOverview(w);
    updateTodayDetails(w);
    buildForecast();
}



function buildForecast(){
    forecastGrid.innerHTML="";
    const days=forecastData.filter((_,i)=>i%8===0).slice(0,5);

    days.forEach((d,i)=>{
        forecastGrid.innerHTML+=`
        <div class="forecast-card" onclick="showForecast(${i})">
            <p>${new Date(d.dt*1000).toDateString().slice(0,10)}</p>
            <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png">
            <h3>${Math.round(d.main.temp)}°</h3>
            <p>${d.weather[0].main}</p>
        </div>`;
    });
}



function showForecast(i){
    const d=forecastData.filter((_,idx)=>idx%8===0)[i];
    forecastDetails.style.display="block";

    fTemp.innerText=Math.round(d.main.temp)+"°";
    fFeels.innerText=Math.round(d.main.feels_like)+"°";
    fWind.innerText=d.wind.speed+" m/s";
    fHumidity.innerText=d.main.humidity+"%";
    fClouds.innerText=d.clouds.all+"%";
    fDesc.innerText=d.weather[0].description;
}

function searchCity(){
    const c=searchInput.value.trim();
    if(!c)return;
    loadWeather(
        `https://api.openweathermap.org/data/2.5/weather?q=${c}&units=metric&appid=${API_KEY}`,
        `https://api.openweathermap.org/data/2.5/forecast?q=${c}&units=metric&appid=${API_KEY}`
    );
}

function getLocation(){
    navigator.geolocation.getCurrentPosition(p=>{
        loadWeather(
            `https://api.openweathermap.org/data/2.5/weather?lat=${p.coords.latitude}&lon=${p.coords.longitude}&units=metric&appid=${API_KEY}`,
            `https://api.openweathermap.org/data/2.5/forecast?lat=${p.coords.latitude}&lon=${p.coords.longitude}&units=metric&appid=${API_KEY}`
        );
    });
}

getLocation();
