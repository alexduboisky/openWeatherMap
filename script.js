document.addEventListener('DOMContentLoaded',function(){

    const API_KEY = '84d6ecb8cce7742b9bed2b6595991fb7';
    async function getCurrentLocation(){
        return new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej=>{
                generateError(rej.message);
            });
        });
        
    }

    async function getResponse(url){
        let response = await fetch(url);
        if (response.status == 200) {
            return response;
        } else {
            throw new HttpError(response);
        }
    }

    async function getWeatherArray(){
        let weatherArray = [];
        let position = await getCurrentLocation();
        let responseWeather = await getResponse(`https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&appid=${API_KEY}`);
        let weatherObject = await responseWeather.json();
        weatherArray.push(weatherObject);
        let responseForecast = await getResponse(`https://api.openweathermap.org/data/2.5/forecast?q=${weatherObject.name}&units=metric&appid=${API_KEY}`);
        let forecastObject = await responseForecast.json();
        weatherArray.push(forecastObject);
        return weatherArray;
    }


    async function createMarkup(){
        let array = await getWeatherArray();
        document.body.innerHTML = '';
        let wrapper = document.createElement('div');
        wrapper.classList.add('wrapper');
        document.body.append(wrapper);
        createCurrentWeatherDiv(array[0].name,array[0].sys.country,array[0].dt,array[0].main.temp,array[0].main.feels_like,array[0].weather[0].icon,array[0].wind.speed,array[0].wind.deg);
        createForecastDiv(array);
    }

    function createCurrentWeatherDiv(city, country, time, temp, feelLike, icon, windSpeed,direction){
        let dt;
        dt = new Date(time * 1000)
        let div = document.createElement('div');
        div.innerHTML = `<div class="current_weather">
                            <div class="weather_city">${city}, ${country}</div>
                            <div class="weather_time"><i class="far fa-clock"></i> ${dt.toLocaleTimeString().slice(0, 5)}</div>
                            <div class="weather_icon"><img id="weather_icon" src="http://openweathermap.org/img/wn/${icon}@2x.png"></div>
                            <div class="weather_temp">${Math.round(temp)} ℃</div>
                            <div class="weather_feels">Feels like ${Math.round(feelLike)} ℃</div>
                            <div class="weather_wind">
                                <div class="weather_wind__direction"></div>
                                <div class="weather_wind__speed"><i class="fas fa-wind"></i> ${windSpeed} m/s</div>
                            </div>
                        </div>`
        let wrapper = document.querySelector('.wrapper');
        wrapper.append(div);
        let weatherWindDirection = document.querySelector('.weather_wind__direction');
        switch (true) {
            case (direction >=337.6 && direction <=22.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> North`;
                break;
            case (direction >=22.6 && direction <=67.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> North-East`;
                break;
            case (direction >=67.6 && direction <=112.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> East`;
                break;
            case (direction >=112.6 && direction <=157.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> South-East`;
                break;
            case (direction >=157.6 && direction <=202.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> South`;
                break;
            case (direction >=202.6 && direction <=247.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> South-West`;
                break;
            case (direction >=247.6 && direction <=292.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> West`;
                break;
            case (direction >=292.6 && direction <=337.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> North-West`;
                break;
            default:
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> Unknown`;
                break;
        }
    }

    function createForecastDiv(array){
        let forecast = document.createElement('div');
        forecast.classList.add('forecast');
        dt = new Date(array[1].list[0].dt * 1000)
        for (let i = 0; i < Object.keys(array[1].list).length; i += 8) {
            dt = new Date(array[1].list[i].dt * 1000)
            forecast.append(createDayDivForForecast(dt, array[1].list[i].weather[0].icon, Math.round(array[1].list[i].main['temp'])))
        }
        let wrapper = document.querySelector('.wrapper');
        wrapper.append(forecast);
    }

    function createDayDivForForecast(date, icon, temp) {
        let dayDiv = document.createElement('div');
        dayDiv.innerHTML = `<div>${date.toLocaleDateString().slice(0,5)}</br>${date.toLocaleTimeString().slice(0,5)}</div>
                            <div><img src="http://openweathermap.org/img/wn/${icon}@2x.png"></div>
                            <div>${temp} ℃</div>`
        return dayDiv
    }

    function generateError(message){
        document.body.style.textAlign = 'center';
        document.body.style.fontSize = 'xx-large'
        document.body.style.lineHeight = '100px'
        document.body.innerHTML = `${message}`
    }

    createMarkup();
    
})