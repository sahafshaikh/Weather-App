document.addEventListener('DOMContentLoaded', () => {
    // API Configuration
    const API_KEY = '0f8d0a048c3995619aa2f9540b3161db'; // Replace with your OpenWeatherMap API key
    const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
    const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
    const GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0/direct';

    // DOM Elements
    const cityInput = document.getElementById('cityInput');
    const searchBtn = document.getElementById('searchBtn');
    const locationBtn = document.getElementById('locationBtn');
    const favoritesList = document.getElementById('favoritesList');
    const addFavoriteBtn = document.getElementById('addFavorite');
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const themeToggle = document.getElementById('themeToggle');
    const unitToggle = document.getElementById('unitToggle');
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const searchHistory = document.getElementById('searchHistory');

    // State
    let currentWeatherData = null;
    let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
    let tasks = JSON.parse(localStorage.getItem('weatherTasks')) || {};
    let searchHistoryList = JSON.parse(localStorage.getItem('searchHistory')) || [];
    let unit = localStorage.getItem('unit') || 'metric'; // metric (Celsius) or imperial (Fahrenheit)
    let errorTimeout = null;

    // Initialize
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark', savedTheme === 'dark');
    themeToggle.checked = savedTheme === 'dark';
    unitToggle.textContent = unit === 'metric' ? '°C' : '°F';
    renderFavorites();
    renderSearchHistory();
    renderTasks();
    if (favorites.length > 0) {
        cityInput.value = favorites[0];
        handleSearch();
    } else {
        cityInput.value = 'London';
        handleSearch();
    }

    // Event Listeners
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });

    unitToggle.addEventListener('click', () => {
        unit = unit === 'metric' ? 'imperial' : 'metric';
        unitToggle.textContent = unit === 'metric' ? '°C' : '°F';
        localStorage.setItem('unit', unit);
        if (currentWeatherData) {
            handleSearch(); // Refresh weather data with new unit
        }
    });

    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    locationBtn.addEventListener('click', handleGeolocation);
    addFavoriteBtn.addEventListener('click', toggleFavorite);

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    async function handleSearch() {
        const city = cityInput.value.trim();
        if (!city) {
            showError('Please enter a city name');
            return;
        }
        if (API_KEY === 'YOUR_API_KEY') {
            showError('Invalid API key. Please set a valid OpenWeatherMap API key in script.js');
            return;
        }
        addToSearchHistory(city);
        await fetchWeatherData(city);
    }

    async function handleGeolocation() {
        if (!navigator.geolocation) {
            showError('Geolocation is not supported by this browser');
            return;
        }
        showLoading();
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    await fetchWeatherDataByCoords(latitude, longitude);
                } catch (error) {
                    hideLoading();
                    showError('Failed to fetch weather for your location');
                }
            },
            (error) => {
                hideLoading();
                showError(`Unable to retrieve your location: ${error.message}`);
            }
        );
    }

    async function fetchWeatherData(city) {
        showLoading();
        hideError();
        try {
            const geoResponse = await fetch(`${GEOCODING_URL}?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`);
            if (!geoResponse.ok) {
                throw new Error(`Geocoding API error: ${geoResponse.statusText}`);
            }
            const geoData = await geoResponse.json();
            if (geoData.length === 0) {
                throw new Error('City not found');
            }
            const { lat, lon, name, country } = geoData[0];
            cityInput.value = `${name}, ${country}`;
            await fetchWeatherDataByCoords(lat, lon);
        } catch (error) {
            console.error('Error fetching weather data:', error.message);
            showError(error.message === 'City not found' ? 'City not found. Please check the spelling.' : 'Failed to fetch location data. Please try again.');
        } finally {
            hideLoading();
        }
    }

    async function fetchWeatherDataByCoords(lat, lon) {
        try {
            const currentResponse = await fetch(`${CURRENT_WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`);
            if (!currentResponse.ok) {
                throw new Error(`Current weather API error: ${currentResponse.statusText}`);
            }
            const currentData = await currentResponse.json();

            const forecastResponse = await fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`);
            if (!forecastResponse.ok) {
                throw new Error(`Forecast API error: ${forecastResponse.statusText}`);
            }
            const forecastData = await forecastResponse.json();

            currentWeatherData = currentData;
            updateBackgroundTheme(currentData.weather[0].main.toLowerCase());
            displayCurrentWeather(currentData);
            displayForecast(forecastData);
            displayAlerts(currentData);
            updateFavoriteButton();
            renderTasks(); // Refresh tasks for the new city
        } catch (error) {
            console.error('Error fetching weather data:', error.message);
            showError('Failed to fetch weather data. Please check your API key or try again.');
        } finally {
            hideLoading();
        }
    }

    function displayCurrentWeather(data) {
        document.getElementById('cityNameText').textContent = `${data.name}, ${data.sys.country}`;
        document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°${unit === 'metric' ? 'C' : 'F'}`;
        document.getElementById('weatherCondition').textContent = data.weather[0].description;
        document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        document.getElementById('weatherIcon').alt = data.weather[0].description;
        document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°${unit === 'metric' ? 'C' : 'F'}`;
        document.getElementById('humidity').textContent = `${data.main.humidity}%`;
        document.getElementById('windSpeed').textContent = `${data.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}`;
        document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
        document.getElementById('currentWeather').style.display = 'block';
    }

    function displayForecast(data) {
        const forecastContainer = document.getElementById('forecastContainer');
        forecastContainer.innerHTML = '';
        const dailyForecasts = {};
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toDateString();
            if (!dailyForecasts[dateKey]) {
                dailyForecasts[dateKey] = {
                    date: date,
                    temps: [],
                    weather: item.weather[0],
                    icon: item.weather[0].icon
                };
            }
            dailyForecasts[dateKey].temps.push(item.main.temp);
        });
        Object.values(dailyForecasts).slice(0, 5).forEach(day => {
            const minTemp = Math.round(Math.min(...day.temps));
            const maxTemp = Math.round(Math.max(...day.temps));
            const forecastDay = document.createElement('div');
            forecastDay.className = 'forecast-day';
            forecastDay.innerHTML = `
                <div class="forecast-date">${day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <img class="forecast-icon" src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.weather.description}">
                <div class="weather-condition">${day.weather.description}</div>
                <div class="forecast-temps">
                    <span class="forecast-high">${maxTemp}°</span>
                    <span class="forecast-low">${minTemp}°</span>
                </div>
            `;
            forecastContainer.appendChild(forecastDay);
        });
    }

    function displayAlerts(data) {
        const alertsContainer = document.getElementById('alertsContainer');
        alertsContainer.innerHTML = '';
        const alerts = [];
        const tempThreshold = unit === 'metric' ? 35 : 95;
        const windThreshold = unit === 'metric' ? 15 : 33;
        if (data.main.temp > tempThreshold) {
            alerts.push({
                event: 'High Temperature Warning',
                description: `Extreme heat: ${Math.round(data.main.temp)}°${unit === 'metric' ? 'C' : 'F'}. Stay hydrated and avoid prolonged sun exposure.`
            });
        }
        if (data.wind.speed > windThreshold) {
            alerts.push({
                event: 'High Wind Warning',
                description: `Strong winds: ${data.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}. Secure loose objects and exercise caution.`
            });
        }
        if (alerts.length > 0) {
            alerts.forEach(alert => {
                const alertItem = document.createElement('div');
                alertItem.className = 'alert-item';
                alertItem.innerHTML = `
                    <div class="alert-title">${alert.event}</div>
                    <div class="alert-description">${alert.description}</div>
                `;
                alertsContainer.appendChild(alertItem);
            });
        } else {
            alertsContainer.innerHTML = '<div class="no-alerts">No weather alerts for this location</div>';
        }
    }

    function renderFavorites() {
        favoritesList.innerHTML = '';
        favorites.forEach(city => {
            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = 'favorite-city';
            favoriteBtn.textContent = city;
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-favorite';
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFavorite(city);
            });
            favoriteBtn.appendChild(removeBtn);
            favoriteBtn.addEventListener('click', () => {
                cityInput.value = city;
                handleSearch();
            });
            favoritesList.appendChild(favoriteBtn);
        });
    }

    function toggleFavorite() {
        if (!currentWeatherData) return;
        const cityName = `${currentWeatherData.name}, ${currentWeatherData.sys.country}`;
        if (favorites.includes(cityName)) {
            removeFavorite(cityName);
        } else {
            addFavorite(cityName);
        }
    }

    function addFavorite(cityName) {
        if (!favorites.includes(cityName)) {
            favorites.push(cityName);
            localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
            renderFavorites();
            updateFavoriteButton();
        }
    }

    function removeFavorite(cityName) {
        favorites = favorites.filter(city => city !== cityName);
        localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
        renderFavorites();
        updateFavoriteButton();
    }

    function updateFavoriteButton() {
        if (!currentWeatherData) return;
        const cityName = `${currentWeatherData.name}, ${currentWeatherData.sys.country}`;
        addFavoriteBtn.classList.toggle('favorited', favorites.includes(cityName));
        addFavoriteBtn.title = favorites.includes(cityName) ? 'Remove from Favorites' : 'Add to Favorites';
    }

    function addToSearchHistory(city) {
        if (!city) return;
        searchHistoryList = searchHistoryList.filter(item => item.toLowerCase() !== city.toLowerCase()).slice(0, 4);
        searchHistoryList.unshift(city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistoryList));
        renderSearchHistory();
    }

    function renderSearchHistory() {
        searchHistory.innerHTML = '';
        if (searchHistoryList.length === 0) {
            searchHistory.innerHTML = '<div class="no-history">No recent searches</div>';
            return;
        }
        searchHistoryList.forEach(city => {
            const historyItem = document.createElement('button');
            historyItem.className = 'history-item';
            historyItem.textContent = city;
            historyItem.addEventListener('click', () => {
                cityInput.value = city;
                handleSearch();
            });
            searchHistory.appendChild(historyItem);
        });
    }

    function addTask() {
        if (!currentWeatherData) {
            showError('Please select a city first');
            return;
        }
        const text = taskInput.value.trim();
        if (!text) {
            showError('Please enter a task');
            return;
        }
        const cityName = `${currentWeatherData.name}, ${currentWeatherData.sys.country}`;
        if (!tasks[cityName]) tasks[cityName] = [];
        const task = {
            id: Date.now(),
            text: text,
            completed: false
        };
        tasks[cityName].push(task);
        saveTasks();
        if (document.querySelector('.nav-tab.active').dataset.tab === 'tasks') {
            renderTasks();
        }
        taskInput.value = '';
    }

    function renderTasks() {
        taskList.innerHTML = '';
        if (!currentWeatherData) {
            taskList.innerHTML = '<div class="no-tasks">Select a city to view tasks</div>';
            return;
        }
        const cityName = `${currentWeatherData.name}, ${currentWeatherData.sys.country}`;
        const cityTasks = tasks[cityName] || [];
        if (cityTasks.length === 0) {
            taskList.innerHTML = '<div class="no-tasks">No tasks for this city</div>';
            return;
        }
        cityTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.dataset.id = task.id;
            if (task.completed) {
                li.classList.add('completed');
            }
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="btn edit-btn">Edit</button>
                    <button class="btn delete-btn">Delete</button>
                </div>
            `;
            taskList.appendChild(li);

            const checkbox = li.querySelector('.task-checkbox');
            checkbox.addEventListener('change', (e) => {
                task.completed = e.target.checked;
                li.classList.toggle('completed', task.completed);
                saveTasks();
            });

            const editBtn = li.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => {
                const textSpan = li.querySelector('.task-text');
                const currentText = textSpan.textContent;
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'task-input-edit';
                input.value = currentText;
                textSpan.replaceWith(input);
                input.focus();
                input.addEventListener('blur', saveEdit);
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') saveEdit.call(input);
                });

                function saveEdit() {
                    const newText = this.value.trim();
                    if (newText) {
                        task.text = newText;
                        const newSpan = document.createElement('span');
                        newSpan.className = 'task-text';
                        newSpan.textContent = newText;
                        this.replaceWith(newSpan);
                        saveTasks();
                    } else {
                        this.value = currentText;
                        this.replaceWith(textSpan);
                    }
                }
            });

            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                li.style.animation = 'slideOut 0.3s ease';
                li.addEventListener('animationend', () => {
                    tasks[cityName] = tasks[cityName].filter(t => t.id !== task.id);
                    if (tasks[cityName].length === 0) delete tasks[cityName];
                    saveTasks();
                    li.remove();
                }, { once: true });
            });
        });
    }

    function saveTasks() {
        localStorage.setItem('weatherTasks', JSON.stringify(tasks));
    }

    function switchTab(tabName) {
        navTabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}Tab`);
        if (activeTab && activeContent) {
            activeTab.classList.add('active');
            activeContent.classList.add('active');
            if (tabName === 'tasks') {
                renderTasks();
            }
        }
    }

    function updateBackgroundTheme(weatherCondition) {
        document.body.classList.remove('sunny', 'rainy', 'cloudy', 'snowy', 'misty');
        switch (weatherCondition) {
            case 'clear':
                document.body.classList.add('sunny');
                break;
            case 'clouds':
                document.body.classList.add('cloudy');
                break;
            case 'rain':
            case 'drizzle':
                document.body.classList.add('rainy');
                break;
            case 'snow':
                document.body.classList.add('snowy');
                break;
            case 'mist':
            case 'fog':
            case 'haze':
                document.body.classList.add('misty');
                break;
            default:
                document.body.classList.add('cloudy');
        }
    }

    function showLoading() {
        loading.classList.add('show');
    }

    function hideLoading() {
        loading.classList.remove('show');
    }

    function showError(message) {
        if (errorTimeout) {
            clearTimeout(errorTimeout);
        }
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        errorTimeout = setTimeout(hideError, 5000);
    }

    function hideError() {
        errorMessage.classList.remove('show');
        errorTimeout = null;
    }
});