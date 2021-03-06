document.addEventListener('DOMContentLoaded', function () {


    let lang = {
        en: {
            feels: 'Feels like',
            north: 'North',
            north_east: 'North-East',
            east: 'East',
            south_east: 'South-East',
            south: 'South',
            south_west: 'South-West',
            west: 'West',
            north_west: 'North-West',
            search: 'Search',
            forADay:'For a day',
            forTommorrow: 'For Tomorrow',
            for5Days:'For 5 Days'
        },
        ru: {
            feels: 'Ощущается как',
            north: 'Север',
            north_east: 'Северо-Восток',
            east: 'Восток',
            south_east: 'Юго-Восток',
            south: 'Юг',
            south_west: 'Юго-Запад',
            west: 'Запад',
            north_west: 'Северо-Запад',
            search: 'Поиск',
            forADay:'На сегодня',
            forTommorrow: 'На завтра',
            for5Days:'На 5 дней'
        }
    }

    const API_KEY = '84d6ecb8cce7742b9bed2b6595991fb7';

    async function getCurrentLocation() {
        return new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej => {
                generateError(rej.message);
            });
        });

    }

    async function getResponse(url) {
        let response = await fetch(url);
        if (response.status == 200) {
            return response;
        } else {
            let lableForError = document.createElement('label');
            lableForError.textContent = 'City not found';
            let form = document.querySelector('form');
            form.after(lableForError);
        }
    }

    async function getWeatherArrayWithCoords(language) {
        let weatherArray = [];
        let position = await getCurrentLocation();
        let responseWeather = await getResponse(`https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&appid=${API_KEY}&lang=${language}`);
        let weatherObject = await responseWeather.json();
        weatherArray.push(weatherObject);
        let responseForecast = await getResponse(`https://api.openweathermap.org/data/2.5/forecast?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&appid=${API_KEY}&lang=${language}`);
        let forecastObject = await responseForecast.json();
        weatherArray.push(forecastObject);
        return weatherArray;
    }

    async function getWeatherArrayWithCity(city, language) {
        let weatherArray = [];
        let responseWeather = await getResponse(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}&lang=${language}`);
        let weatherObject = await responseWeather.json();
        weatherArray.push(weatherObject);
        let responseForecast = await getResponse(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}&${language}`);
        let forecastObject = await responseForecast.json();
        weatherArray.push(forecastObject);
        return weatherArray;
    }


    async function createMarkup(position, language = 'en', forecast = 'day') {
        let array;
        if (position === undefined) {
            array = await getWeatherArrayWithCoords(language);
        } else {
            array = await getWeatherArrayWithCity(position, language);
        }

        document.body.innerHTML = '';
        let wrapper = document.createElement('div');
        wrapper.classList.add('wrapper');
        let divForLanguageButton = document.createElement('div');
        divForLanguageButton.setAttribute('id', 'divForLanguageButton');
        divForLanguageButton.innerHTML = `<button id="ru">RU</button>
                                          <button id="en">EN</button>`;
        let searchDiv = document.createElement('div');
        searchDiv.innerHTML = `<form autocomplete="off">
                                    <div class="autocomplete" style="width:300px;">
                                        <input id="searchInput" type="text" name="City" placeholder="${lang[language].search}...">
                                    </div>
                                    <input type="submit">
                                </form>`;
        searchDiv.setAttribute('id', 'divForForm');
        let divForButton = document.createElement('div');
        divForButton.setAttribute('id', 'divForButton');
        divForButton.innerHTML = `<button id="forDay">${lang[language].forADay}</button>
                                  <button id="forTomorrow">${lang[language].forTommorrow}</button>
                                  <button id="for5Days">${lang[language].for5Days}</button>`
        wrapper.append(searchDiv, divForButton, divForLanguageButton);
        document.body.append(wrapper);
        createCurrentWeatherDiv(array[0].name, array[0].sys.country, array[0].dt, array[0].main.temp, array[0].main.feels_like, array[0].weather[0].icon, array[0].weather[0].description, array[0].wind.speed, array[0].wind.deg, language);
        if (forecast == 'day') {
            let forecastForADayButton = document.querySelector('#forDay');
            forecastForADayButton.classList.add('active-forecast');
            createForecastDivForDay(array);
        }else if(forecast == 'tomorrow'){
            let forecastForTomorrowButton = document.querySelector('#forTomorrow');
            forecastForTomorrowButton.classList.add('active-forecast');
            createForecastDivForTommorow(array);
        }
         else {
            let forecastFor5DaysButton = document.querySelector('#for5Days');
            forecastFor5DaysButton.classList.add('active-forecast');
            createForecastDivFor5Days(array);
        };
        if (position === undefined) {
            eventListenerForButton();
        } else {
            eventListenerForButton(position)
        };
        eventListenerForLanguageButton(position);
        let searchForm = document.querySelector('form');
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let val = document.querySelector('#searchInput').value;
            createMarkup(val, localStorage.getItem('lang'));
        })
    }

    function eventListenerForButton(value = undefined) {
        let forecastForADayButton = document.querySelector('#forDay');
        let forecastForTomorrowButton = document.querySelector('#forTomorrow');
        let forecastFor5DaysButton = document.querySelector('#for5Days');
        forecastForADayButton.addEventListener('click', () => {
            let activeButton = document.querySelector('.active-forecast');
            activeButton.classList.remove('active-forecast');
            createMarkup(value, localStorage.getItem('lang'), 'day');
            //forecastForADayButton.classList.add('active-forecast');
        });
        forecastForTomorrowButton.addEventListener('click', () => {
            let activeButton = document.querySelector('.active-forecast');
            activeButton.classList.remove('active-forecast');
            createMarkup(value, localStorage.getItem('lang'), 'tomorrow');
        });
        forecastFor5DaysButton.addEventListener('click', () => {
            let activeButton = document.querySelector('.active-forecast');
            activeButton.classList.remove('active-forecast');
            createMarkup(value, localStorage.getItem('lang'), '5 days');
        })
    }

    function eventListenerForLanguageButton(value = undefined) {
        let ruButton = document.querySelector('#ru');
        let enButton = document.querySelector('#en');
        ruButton.addEventListener('click', () => {
            createMarkup(value, 'ru', undefined);
            localStorage.setItem('lang', 'ru');
        })
        enButton.addEventListener('click', () => {
            createMarkup(value, 'en', undefined);
            localStorage.setItem('lang', 'en');
        })
    }

    function createCurrentWeatherDiv(city, country, time, temp, feelLike, icon, description, windSpeed, direction, language) {
        let dt;
        dt = new Date(time * 1000)
        let div = document.createElement('div');
        div.innerHTML = `<div class="current_weather">
                            <div class="weather_city">${city}, ${country}</div>
                            <div class="weather_time"><i class="far fa-clock"></i> ${dt.toLocaleTimeString().slice(0, 5)}</div>
                            <div class="weather_icon"><img id="weather_icon" src="http://openweathermap.org/img/wn/${icon}@2x.png"></div>
                            <div class="weather_description">${description}</div>
                            <div class="weather_temp">${Math.round(temp)} ℃</div>
                            <div class="weather_feels">${lang[language].feels} ${Math.round(feelLike)} ℃</div>
                            <div class="weather_wind">
                                <div class="weather_wind__direction"></div>
                                <div class="weather_wind__speed"><i class="fas fa-wind"></i> ${windSpeed} m/s</div>
                            </div>
                        </div>`
        let wrapper = document.querySelector('.wrapper');
        wrapper.append(div);
        let weatherWindDirection = document.querySelector('.weather_wind__direction');
        switch (true) {
            case (direction >= 337.6 && direction <= 360):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> ${lang[language].north}`;
                break;
            case (direction >= 0 && direction <= 22.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> ${lang[language].north}`;
                break;
            case (direction >= 22.6 && direction <= 67.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> ${lang[language].north_east}`;
                break;
            case (direction >= 67.6 && direction <= 112.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> ${lang[language].east}`;
                break;
            case (direction >= 112.6 && direction <= 157.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> ${lang[language].south_east}`;
                break;
            case (direction >= 157.6 && direction <= 202.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> ${lang[language].south}`;
                break;
            case (direction >= 202.6 && direction <= 247.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> ${lang[language].south_west}`;
                break;
            case (direction >= 247.6 && direction <= 292.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> ${lang[language].west}`;
                break;
            case (direction >= 292.6 && direction <= 337.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> ${lang[language].north_west}`;
                break;
            default:
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> Unknown`;
                break;
        }
    }

    function createForecastDivForDay(array) {
        let forecast = document.createElement('div');
        forecast.classList.add('forecast');
        dt = new Date(array[1].list[0].dt * 1000)
        for (let i = 0; i < 5; i++) {
            dt = new Date(array[1].list[i].dt * 1000)
            forecast.append(createDayDivForForecast(dt, array[1].list[i].weather[0].icon, array[1].list[i].weather[0].description, Math.round(array[1].list[i].main['temp'])))
        }
        let wrapper = document.querySelector('.wrapper');
        wrapper.append(forecast);
    }

    function createForecastDivForTommorow(array) {
        let forecast = document.createElement('div');
        forecast.classList.add('forecast');
        dt = new Date(array[1].list[0].dt * 1000)
        for (let i = 5; i < 10; i++) {
            dt = new Date(array[1].list[i].dt * 1000)
            forecast.append(createDayDivForForecast(dt, array[1].list[i].weather[0].icon, array[1].list[i].weather[0].description, Math.round(array[1].list[i].main['temp'])))
        }
        let wrapper = document.querySelector('.wrapper');
        wrapper.append(forecast);
    }

    function createForecastDivFor5Days(array) {
        let forecast = document.createElement('div');
        forecast.classList.add('forecast');
        dt = new Date(array[1].list[0].dt * 1000)
        for (let i = 0; i < Object.keys(array[1].list).length; i += 8) {
            dt = new Date(array[1].list[i].dt * 1000)
            forecast.append(createDayDivForForecast(dt, array[1].list[i].weather[0].icon, array[1].list[i].weather[0].description, Math.round(array[1].list[i].main['temp'])))
        }
        let wrapper = document.querySelector('.wrapper');
        wrapper.append(forecast);
    }

    function createDayDivForForecast(date, icon, description,temp) {
        let dayDiv = document.createElement('div');
        dayDiv.innerHTML = `<div>${date.toLocaleDateString().slice(0,5)}</br>${date.toLocaleTimeString().slice(0,5)}</div>
                            <div><img src="http://openweathermap.org/img/wn/${icon}@2x.png"></div>
                            <div class="forecast-description">${description}</div>
                            <div>${temp} ℃</div>`
        return dayDiv
    }

    function generateError(message) {
        document.body.style.textAlign = 'center';
        document.body.style.fontSize = 'xx-large'
        document.body.style.lineHeight = '100px'
        document.body.innerHTML = `${message}`
    }

    if (localStorage.getItem('lang') === 'ru') {
        createMarkup(undefined, 'ru');
    } else {
        createMarkup();
    }

})