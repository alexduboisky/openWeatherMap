document.addEventListener('DOMContentLoaded', function () {

    const API_KEY = '84d6ecb8cce7742b9bed2b6595991fb7';

    let citiesList = [];

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
            throw new HttpError(response);
        }
    }

    async function getWeatherArrayWithCoords(language = 'en') {
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

    async function getWeatherArrayWithCity(city, language = 'en') {
        let weatherArray = [];
        let position = await getCurrentLocation();
        let responseWeather = await getResponse(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}&lang=${language}`);
        let weatherObject = await responseWeather.json();
        weatherArray.push(weatherObject);
        let responseForecast = await getResponse(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}&lang=${language}`);
        let forecastObject = await responseForecast.json();
        weatherArray.push(forecastObject);
        return weatherArray;
    }


    async function createMarkup(position, language, forecast = 'day') {
        let array;
        if (position === undefined) {
            array = await getWeatherArrayWithCoords(language);
        } else {
            array = await getWeatherArrayWithCity(position, language);
        }

        document.body.innerHTML = '';
        let wrapper = document.createElement('div');
        wrapper.classList.add('wrapper');
        let searchDiv = document.createElement('div');
        searchDiv.innerHTML = `<form autocomplete="off">
                                    <div class="autocomplete" style="width:300px;">
                                        <input id="searchInput" type="text" name="City" placeholder="Search...">
                                    </div>
                                    <input type="submit">
                                </form>`;
        let divForButton = document.createElement('div');
        divForButton.innerHTML = `<button id="forDay">For a day</button>
                                  <button id="for5Days">For 5 Days</button>`
        wrapper.append(searchDiv,divForButton);
        document.body.append(wrapper);
        createCurrentWeatherDiv(array[0].name, array[0].sys.country, array[0].dt, array[0].main.temp, array[0].main.feels_like, array[0].weather[0].icon, array[0].wind.speed, array[0].wind.deg);
        if(forecast=='day'){
            createForecastDivForDay(array);
        }
        else{
            createForecastDivFor5Days(array);
        }
        if(position===undefined){
            eventListenerForButton();
        }
        else{
            eventListenerForButton(position)
        }
        getCitiesList();
        let searchForm = document.querySelector('form');
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let val = document.querySelector('#searchInput').value;
            createMarkup(val);
        })
    }

    function eventListenerForButton(value = undefined){
        let forecastForADayButton = document.querySelector('#forDay');
        let forecastFor5DaysButton = document.querySelector('#for5Days');
        forecastForADayButton.addEventListener('click',()=>{
            createMarkup(value,undefined,'day');
        })
        forecastFor5DaysButton.addEventListener('click',()=>{
            createMarkup(value,undefined,'5 days');
        })
    }

    function createCurrentWeatherDiv(city, country, time, temp, feelLike, icon, windSpeed, direction) {
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
            case (direction >= 337.6 && direction <= 22.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> North`;
                break;
            case (direction >= 22.6 && direction <= 67.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> North-East`;
                break;
            case (direction >= 67.6 && direction <= 112.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> East`;
                break;
            case (direction >= 112.6 && direction <= 157.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> South-East`;
                break;
            case (direction >= 157.6 && direction <= 202.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> South`;
                break;
            case (direction >= 202.6 && direction <= 247.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> South-West`;
                break;
            case (direction >= 247.6 && direction <= 292.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> West`;
                break;
            case (direction >= 292.6 && direction <= 337.5):
                weatherWindDirection.innerHTML = `<i class="far fa-compass"></i> North-West`;
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
        for (let i = 0; i < 5; i ++) {
            dt = new Date(array[1].list[i].dt * 1000)
            forecast.append(createDayDivForForecast(dt, array[1].list[i].weather[0].icon, Math.round(array[1].list[i].main['temp'])))
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

    function generateError(message) {
        document.body.style.textAlign = 'center';
        document.body.style.fontSize = 'xx-large'
        document.body.style.lineHeight = '100px'
        document.body.innerHTML = `${message}`
    }

    async function getCitiesList() {
        let response = await fetch('./city.list.json');
        if (response.status == 200) {
            let citiesListWithData = await response.json();
            citiesListWithData.forEach(element => {
                citiesList.push(element.name)
            });
            autocomplete(document.querySelector('#searchInput'), citiesList);
        } else {
            throw new HttpError(response);
        }
    }

    async function autocomplete(inp, arr) {
        var currentFocus;
        inp.addEventListener("input", function (e) {
            var a, b, i, val = this.value;
            closeAllLists();
            if (!val) {
                return false;
            }
            currentFocus = -1;
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            this.parentNode.appendChild(a);
            for (i = 0; i < arr.length; i++) {
                if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                    b = document.createElement("DIV");
                    b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                    b.innerHTML += arr[i].substr(val.length);
                    b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                    b.addEventListener("click", function (e) {
                        inp.value = this.getElementsByTagName("input")[0].value;
                        closeAllLists();
                    });
                    a.appendChild(b);
                }
            }
        });
        inp.addEventListener("keydown", function (e) {
            var x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
                currentFocus++;
                addActive(x);
            } else if (e.keyCode == 38) {
                currentFocus--;
                addActive(x);
            } else if (e.keyCode == 13) {
                e.preventDefault();
                if (currentFocus > -1) {
                    if (x) x[currentFocus].click();
                }
            }
        });

        function addActive(x) {
            if (!x) return false;
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            x[currentFocus].classList.add("autocomplete-active");
        }

        function removeActive(x) {
            for (var i = 0; i < x.length; i++) {
                x[i].classList.remove("autocomplete-active");
            }
        }

        function closeAllLists(elmnt) {
            var x = document.getElementsByClassName("autocomplete-items");
            for (var i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != inp) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }
        document.addEventListener("click", function (e) {
            closeAllLists(e.target);
        });
    }

    createMarkup();

})