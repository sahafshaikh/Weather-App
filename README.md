Weather App
A modern, responsive web application built with HTML, CSS, and JavaScript that provides real-time weather information using the OpenWeatherMap API. The app allows users to view current weather, a 5-day forecast, manage weather-related tasks, save favorite cities, track search history, toggle temperature units, and receive basic weather alerts.
Features

Current Weather: Displays temperature, weather condition, feels-like temperature, humidity, wind speed, and pressure for any city.
5-Day Forecast: Shows daily weather forecasts with min/max temperatures and conditions.
Tasks: Add, edit, delete, and mark weather-related tasks (e.g., "Bring umbrella") for specific cities, persisted in localStorage.
Favorites: Save and quickly access favorite cities, stored in localStorage.
Search History: Tracks up to 5 recent searches, accessible for quick re-search, saved in localStorage.
Unit Toggle: Switch between Celsius (°C) and Fahrenheit (°F), with preference saved in localStorage.
Weather Alerts: Basic alerts for extreme temperatures or high winds based on free API data.
Theme Toggle: Switch between light and dark modes, with dynamic weather-based background gradients (sunny, rainy, cloudy, snowy, misty).
Responsive Design: Mobile-friendly layout with animations for task actions and tab switching.
Error Handling: User-friendly error messages for invalid inputs, API failures, or geolocation issues.

Prerequisites

A modern web browser (e.g., Chrome, Firefox, Edge).
An active internet connection for API requests.
A free OpenWeatherMap API key.

Installation

Clone or Download the Repository:

Download the project files (index.html, style.css, script.js) or clone the repository if available.


Obtain an OpenWeatherMap API Key:

Sign up at OpenWeatherMap.
Navigate to the API keys section in your account and copy your API key.


Configure the API Key:

Open script.js in a text editor.

Replace 'YOUR_API_KEY' with your OpenWeatherMap API key:
const API_KEY = '0f8d0a048c3995619aa2f9540b3161db';




Save Files:

Ensure index.html, style.css, and script.js are in the same directory.


Run the Application:

Open index.html in a web browser (e.g., double-click the file or use a local server like Live Server in VS Code).



Usage

Search for Weather:

Enter a city name (e.g., "London") in the search bar and click the search button (🔍) or press Enter.
Alternatively, click the location button (📍) to use your current location (browser permission required).


View Weather Data:

Current Tab: Displays current weather details, including temperature, condition, and additional metrics.
Forecast Tab: Shows a 5-day forecast with daily min/max temperatures.
Alerts Tab: Lists basic weather alerts (e.g., high temperature or wind warnings).
Tasks Tab: Manage city-specific tasks (see below).


Manage Favorites:

Click the star (★) button next to the city name to add or remove it from favorites.
Favorite cities appear as buttons for quick access.


Manage Tasks:

In the Tasks tab, enter a task (e.g., "Check raincoat") and click "Add Task" or press Enter.
Check the box to mark tasks as complete, or use Edit/Delete buttons to modify tasks.
Tasks are saved per city in localStorage.


Toggle Units and Theme:

Click the °C/°F button to switch between Celsius and Fahrenheit.
Use the theme toggle switch to change between light and dark modes.
Background gradients change based on weather conditions (e.g., sunny, rainy).


View Search History:

Recent searches (up to 5) appear below the search bar as clickable buttons for quick re-search.



File Structure
weather-app/
├── index.html    # Main HTML file
├── style.css     # Stylesheet for layout and design
├── script.js     # JavaScript logic for API calls and interactivity
├── README.md     # This documentation file

Dependencies

OpenWeatherMap API: Used for weather data (free tier sufficient).
No external libraries or frameworks; built with vanilla HTML, CSS, and JavaScript.

Limitations

API Key Requirement: The app requires a valid OpenWeatherMap API key. Without it, an error message will prompt configuration.
Basic Alerts: Alerts are generated from free API data (e.g., temperature > 35°C/95°F or wind > 15 m/s/33 mph) and are not as comprehensive as the paid OneCall API.
No Offline Support: The app requires an internet connection for API requests.
Excluded Features: Weather maps, historical data, and notifications were omitted due to missing dependencies (e.g., Chart.js, Leaflet.js) or paid API requirements.

Troubleshooting

API Errors:
Ensure the API key is correctly set in script.js.
Check the browser console (F12 > Console) for specific error messages.
Verify your OpenWeatherMap API key is active and not rate-limited.


Geolocation Issues:
Allow location access when prompted by the browser.
Ensure your device has location services enabled.


UI Glitches:
Clear localStorage (localStorage.clear() in the console) to reset favorites, tasks, or theme settings.
Ensure all files (index.html, style.css, script.js) are in the same directory.


Invalid City Names:
Use full city names with correct spelling (e.g., "New York, US" instead of "NY").



Future Enhancements

Add weather maps using Leaflet.js if provided.
Implement historical weather charts with Chart.js or a paid API.
Enable notifications with a service worker for weather alerts.
Support multi-city weather comparison.
Integrate advanced alerts via the OpenWeatherMap OneCall API (requires subscription).

Contributing
Contributions are welcome! Please fork the repository, make changes, and submit a pull request. Ensure code follows the existing style and includes documentation for new features.
License
This project is licensed under the MIT License. See the LICENSE file for details.
Acknowledgments

OpenWeatherMap for providing the weather API.
Built with vanilla JavaScript for a lightweight, dependency-free experience.

For issues or feature requests, please create an issue in the repository or contact the maintainer.
