const API_KEY = '870bb2fbf741dc946b797ad727531b6d';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

let currentUnit = 'metric';
let currentCity = 'Bandar Lampung';
let favorites = JSON.parse(localStorage.getItem('favoriteCities')) || ['Jakarta', 'Surabaya', 'Bandung'];

const themeToggle = document.getElementById('theme-toggle');
const celsiusBtn = document.getElementById('celsius-btn');
const fahrenheitBtn = document.getElementById('fahrenheit-btn');
const refreshBtn = document.getElementById('refresh-btn');
const searchInput = document.getElementById('search-input');
const suggestions = document.getElementById('suggestions');
const favoritesContainer = document.getElementById('favorites');
const loading = document.getElementById('loading');
const currentWeather = document.getElementById('current-weather');
const forecast = document.getElementById('forecast');
const errorMessage = document.getElementById('error-message');

document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
        themeToggle.innerHTML = '<i class="fas fa-sun text-yellow-400"></i>';
    }

    renderFavorites();

    getWeatherData(currentCity);

    setInterval(() => {
        getWeatherData(currentCity);
    }, 300000);
});

themeToggle.addEventListener('click', function() {
    document.documentElement.classList.toggle('dark');
    const isDarkMode = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDarkMode);
    
    if (isDarkMode) {
        themeToggle.innerHTML = '<i class="fas fa-sun text-yellow-400"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon text-gray-700"></i>';
    }
});

celsiusBtn.addEventListener('click', function() {
    if (currentUnit !== 'metric') {
        currentUnit = 'metric';
        updateTemperatureButtons();
        getWeatherData(currentCity);
    }
});

fahrenheitBtn.addEventListener('click', function() {
    if (currentUnit !== 'imperial') {
        currentUnit = 'imperial';
        updateTemperatureButtons();
        getWeatherData(currentCity);
    }
});

function updateTemperatureButtons() {
    if (currentUnit === 'metric') {
        celsiusBtn.classList.add('bg-blue-500', 'text-white');
        celsiusBtn.classList.remove('text-gray-700', 'dark:text-gray-300');
        fahrenheitBtn.classList.remove('bg-blue-500', 'text-white');
        fahrenheitBtn.classList.add('text-gray-700', 'dark:text-gray-300');
    } else {
        fahrenheitBtn.classList.add('bg-blue-500', 'text-white');
        fahrenheitBtn.classList.remove('text-gray-700', 'dark:text-gray-300');
        celsiusBtn.classList.remove('bg-blue-500', 'text-white');
        celsiusBtn.classList.add('text-gray-700', 'dark:text-gray-300');
    }
}

refreshBtn.addEventListener('click', function() {
    getWeatherData(currentCity);
    refreshBtn.querySelector('i').classList.add('animate-spin');
    setTimeout(() => {
        refreshBtn.querySelector('i').classList.remove('animate-spin');
    }, 1000);
});

searchInput.addEventListener('input', function() {
    const query = this.value.trim();
    if (query.length > 2) {
        getCitySuggestions(query);
    } else {
        suggestions.classList.add('hidden');
    }
});

document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.classList.add('hidden');
    }
});

async function getWeatherData(city) {
    try {
        showLoading();
        hideError();

        const currentResponse = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}&lang=id`
        );
        
        if (!currentResponse.ok) {
            if (currentResponse.status === 401) {
                throw new Error('API Key tidak valid.');
            } else if (currentResponse.status === 404) {
                throw new Error(`Kota "${city}" tidak ditemukan. Coba nama kota lain.`);
            } else if (currentResponse.status === 429) {
                throw new Error('Terlalu banyak request. Tunggu 1 jam atau upgrade akun.');
            } else {
                throw new Error(`Error ${currentResponse.status}: Gagal mengambil data cuaca.`);
            }
        }
        
        const currentData = await currentResponse.json();

        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}&lang=id`
        );
        
        if (!forecastResponse.ok) {
            throw new Error('Gagal mengambil data prakiraan.');
        }
        
        const forecastData = await forecastResponse.json();

        updateCurrentWeather(currentData);
        updateForecast(forecastData);

        currentCity = city;
        
        hideLoading();
        showWeatherData();
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        hideLoading();
        showError(error.message);
    }
}

async function getCitySuggestions(query) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Gagal mengambil saran kota');
        }
        
        const cities = await response.json();
        renderSuggestions(cities);
        
    } catch (error) {
        console.error('Error fetching city suggestions:', error);
        const localCities = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Yogyakarta', 'Denpasar', 'Malang', 'Bogor'];
        const filteredCities = localCities.filter(city => 
            city.toLowerCase().includes(query.toLowerCase())
        );
        renderSuggestions(filteredCities.map(city => ({ name: city, country: 'ID' })));
    }
}

function renderSuggestions(cities) {
    if (cities.length === 0) {
        suggestions.classList.add('hidden');
        return;
    }
    
    suggestions.innerHTML = '';
    cities.forEach(city => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-white transition-colors flex justify-between items-center';
        suggestionItem.innerHTML = `
            <span>${city.name}, ${city.country}</span>
            <button class="favorite-btn p-1 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900" data-city="${city.name}">
                <i class="fas fa-star ${favorites.includes(city.name) ? 'text-yellow-500' : 'text-gray-300'}"></i>
            </button>
        `;
        
        suggestionItem.addEventListener('click', function(e) {
            if (!e.target.closest('.favorite-btn')) {
                searchInput.value = city.name;
                suggestions.classList.add('hidden');
                getWeatherData(city.name);
            }
        });

        const favoriteBtn = suggestionItem.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const cityName = this.getAttribute('data-city');
            toggleFavorite(cityName);
            this.querySelector('i').classList.toggle('text-yellow-500');
            this.querySelector('i').classList.toggle('text-gray-300');
        });
        
        suggestions.appendChild(suggestionItem);
    });
    
    suggestions.classList.remove('hidden');
}

function updateCurrentWeather(data) {
    document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('timestamp').textContent = formatDate(new Date(data.dt * 1000));
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById('weather-icon').alt = data.weather[0].description;
    document.getElementById('weather-condition').textContent = data.weather[0].description;
    
    const temp = Math.round(data.main.temp);
    document.getElementById('temperature').textContent = `${temp}°${currentUnit === 'metric' ? 'C' : 'F'}`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    
    const windSpeed = currentUnit === 'metric' ? 
        `${data.wind.speed} m/s` : 
        `${(data.wind.speed * 2.237).toFixed(1)} mph`;
    document.getElementById('wind-speed').textContent = windSpeed;
}

function updateForecast(data) {
    const forecastContainer = document.querySelector('#forecast .grid');
    forecastContainer.innerHTML = '';

    const dailyForecasts = getDailyForecasts(data.list);
    
    dailyForecasts.slice(0, 5).forEach(dayData => {
        const date = new Date(dayData.dt * 1000);
        const dayName = formatDay(date);
        
        const minTemp = Math.round(dayData.temp.min);
        const maxTemp = Math.round(dayData.temp.max);
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'weather-card bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all fade-in';
        forecastCard.innerHTML = `
            <p class="font-semibold text-gray-800 dark:text-white mb-2">${dayName}</p>
            <img src="https://openweathermap.org/img/wn/${dayData.weather[0].icon}@2x.png" 
                 alt="${dayData.weather[0].description}" 
                 class="w-12 h-12 mx-auto mb-2">
            <p class="text-sm text-gray-600 dark:text-gray-400 capitalize mb-2">${dayData.weather[0].description}</p>
            <div class="flex justify-center space-x-2">
                <span class="text-blue-500 font-bold">${maxTemp}°</span>
                <span class="text-gray-500">${minTemp}°</span>
            </div>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
    
    forecast.classList.remove('hidden');
}

function getDailyForecasts(hourlyForecasts) {
    const dailyData = {};
    
    hourlyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toDateString();
        
        if (!dailyData[day]) {
            dailyData[day] = {
                dt: forecast.dt,
                temp: { min: forecast.main.temp_min, max: forecast.main.temp_max },
                weather: [forecast.weather[0]]
            };
        } else {
            dailyData[day].temp.min = Math.min(dailyData[day].temp.min, forecast.main.temp_min);
            dailyData[day].temp.max = Math.max(dailyData[day].temp.max, forecast.main.temp_max);
        }
    });
    
    return Object.values(dailyData);
}

function renderFavorites() {
    favoritesContainer.innerHTML = '';
    
    favorites.forEach(city => {
        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center group';
        favoriteBtn.innerHTML = `
            <i class="fas fa-star text-yellow-500 mr-1"></i>
            ${city}
            <i class="fas fa-times ml-1 opacity-0 group-hover:opacity-100 transition-opacity"></i>
        `;
        favoriteBtn.addEventListener('click', function(e) {
            if (e.target.classList.contains('fa-times')) {
                e.stopPropagation();
                removeFromFavorites(city);
            } else {
                getWeatherData(city);
            }
        });
        
        favoritesContainer.appendChild(favoriteBtn);
    });
}

function toggleFavorite(city) {
    if (favorites.includes(city)) {
        removeFromFavorites(city);
    } else {
        addToFavorites(city);
    }
}

function addToFavorites(city) {
    if (!favorites.includes(city)) {
        favorites.push(city);
        localStorage.setItem('favoriteCities', JSON.stringify(favorites));
        renderFavorites();
    }
}

function removeFromFavorites(city) {
    favorites = favorites.filter(fav => fav !== city);
    localStorage.setItem('favoriteCities', JSON.stringify(favorites));
    renderFavorites();
}

function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
}

function formatDay(date) {
    const options = { weekday: 'long' };
    return date.toLocaleDateString('id-ID', options);
}

function showLoading() {
    loading.classList.remove('hidden');
    currentWeather.classList.add('hidden');
    forecast.classList.add('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showWeatherData() {
    currentWeather.classList.remove('hidden');
    forecast.classList.remove('hidden');
}

function showError(message) {
    errorMessage.innerHTML = `<p>${message}</p>`;
    errorMessage.classList.remove('hidden');
    currentWeather.classList.add('hidden');
    forecast.classList.add('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}