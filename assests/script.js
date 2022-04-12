//Gotta start somewhere, may as well be global variables. LocalStorage stuffs and the all important API key
var locationsHistory = localStorage.getItem('locationsHistory');
var parsedLocationHistory;

if (!locationsHistory) {
    parsedLocationHistory = [];
} 

else {
    parsedLocationHistory = JSON.parse(locationsHistory);
    displayPastLocations();
}

var APIKey = "5744c3432fd96f6a598d9ed727de564b";


function displayPastLocations() {
    document.getElementById('location-history').innerHTML = "";
    parsedLocationHistory.slice().reverse().forEach((location) => {
        var previousLocationBtn = document.createElement('button');
        previousLocationBtn.classList.add('list-group-item');
        previousLocationBtn.classList.add('list-group-item-action');
        previousLocationBtn.innerHTML = location;
        document.getElementById('location-history').appendChild(previousLocationBtn);
        previousLocationBtn.addEventListener("click", handleHistoryClick);
    });
}
function savePastLocation (userSubmission) {
    userSubmission = userSubmission.toLowerCase().trim();
    userSubmission = userSubmission.charAt(0).toUpperCase() + userSubmission.slice(1);
    parsedLocationHistory.forEach((location, index) => {
      if (location === userSubmission) {
        parsedLocationHistory.splice(index, 1);    
      }
    });
  
    parsedLocationHistory.push(userSubmission);
    localStorage.setItem('locationSHistory', JSON.stringify(parsedLocationHistory));
  }
  
  function handleHistoryClick(event) {
    locationSearch(event.target.innerHTML);
  }
  
  //Search button event listener, takes the search text and attempts to get information on the location with an API request
  document.getElementById("location").addEventListener("submit", searchLocation);
  
  function searchLocation(event) {
    event.preventDefault();
    var userSubmission = document.getElementById("user-Submission").value;
    locationSearch(userSubmission);
  }
  
  function locationSearch(location) {
    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${APIKey}`;
    fetch(queryURL)
      .then(function (response) {
        if (response.ok) {
          savePastLocation(location);
          displayPastLocations();
          return response.json();
        } else {
          return alert("Error. Please try again.");
        }
      })
      .then(function (data) {
        if (data) {
          getWeather(data);
        }
  
      });
  }
  
  //This here little guy takes the user input and creates the fetch request using dynamic info
  function getWeather(locationData) {
      var locationName = locationData.name;
      var longitude = locationData.coord.lon;
      var latitutde = locationData.coord.lat;
      var oneCall = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitutde}&lon=${longitude}&exclude=minutely,hourly&units=imperial&appid=${APIKey}`;
  
    fetch(oneCall)
      .then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          return alert("Error. Please try again.");
        }
      })
      .then(function (weatherData) {
        displayWeather(weatherData);
        displayForecast(weatherData);
      });
    //Displays locationname
    document.getElementById("current-location").innerHTML = locationName;
  }
  
  function displayWeather(weatherData) {
      var uvIndex = weatherData.current.uvi;
      var humidity = weatherData.current.humidity;
      var temperature = weatherData.current.temp.toFixed(0);
      var weatherIcon = weatherData.current.weather[0].icon;
      var windSpeed = weatherData.current.wind_speed;
  
    let locationIcon = document.querySelector(".weather-icon");
  
    locationIcon.innerHTML = `<img src="http://openweathermap.org/img/wn/${weatherIcon}.png">`;
  
    var weatherInfo = document.getElementById("weather-info");
    weatherInfo.innerHTML = `Temperature = ${temperature}°F </br> Humidity = ${humidity}% </br> Wind Speed = ${windSpeed}MPH </br> UV Index = `;
    var uvBox = document.createElement("span");
    uvBox.classList.add("badge");
    if (uvIndex <= 2) {
      uvBox.classList.add("favorable");
    } else if (uvIndex >= 6) {
      uvBox.classList.add("severe");
    } else {
      uvBox.classList.add("moderate");
    }
    console.log(weatherData);
    weatherInfo.appendChild(uvBox).innerHTML = `${uvIndex}`;
  
    // Dispays current day, date, and time
    var currentDate = moment().format("MMMM Do, YYYY");
    document.getElementById("current-date").innerHTML = currentDate;
  }
  
  //Takes our location data packet and pulls out the coords to make a second API request finally pulling in weather data 
  function displayForecast(locate) {
    document.getElementById("forecast-container").innerHTML = "";
    document.getElementById("forecast-title").style.display = "block";
    var longitude = locate.lon;
    var latitutde = locate.lat;
    var endpoint = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitutde}&lon=${longitude}&exclude=minutely,hourly&units=imperial&appid=${APIKey}`;
  
    fetch(endpoint)
      .then(function (response) {
        if (200 !== response.status) {
          alert("Error - please try again.");
          return;
        }
  
        response.json().then(function (data) {
          data.daily.forEach((value, index) => {
            if (index > 0 && index < 6) {
              var dayName = new Date(value.dt * 1000).toLocaleDateString("en", {
                  month: "numeric",
                  day: "numeric",
                  weekday: "short",
              });
              var forecastCard = document.createElement('div');
              forecastCard.classList.add('col-2')
              forecastCard.classList.add('forecast');
              forecastCard.classList.add('card');
              var temp = value.temp.day.toFixed(0);
              var wind = value.wind_speed;
              var humidity = value.humidity;
              var icon = value.weather[0].icon;
              var foreplusonedaycast = `<div class="forecast-day">
                            <h5 class="card-title">${dayName}</h5>
                            <img src="http://openweathermap.org/img/wn/${icon}.png">
                            <div class="forecast-day--temp">Temperature: ${temp}°F</div>
                            <div class="forecast-day--wind">Humidity: ${humidity}%</div>
                            <div class="forecast-day--humidity">Wind Speed: ${wind}MPH</div>
                          </div>`;
              forecastCard.innerHTML = foreplusonedaycast;
              document.getElementById('forecast-container').appendChild(forecastCard);
  
            }
          });
        });
      })
      .catch(function (err) {
        console.log("Fetch Error");
      });
  }
