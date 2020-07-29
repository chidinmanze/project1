// Open Weather API Key
var owKey = "63bf744b035f495cccad8662678a851d";

// Zomato API Key
var zmKey = "994c943d3c627184565ead545dcb7dac";

// Search button event listener
$("#search-button").on("click", function() {

    // Search input feild value
    var city = $("#search").val();
    
    
    if($("#radius").val() == "") {

        // If radius input feild is blank, set distance to 1 mile
        var distance = "1";

    }else{

        // Else set distance equal to the radius input feild value
        var distance = $("#radius").val();

    }

    // Send parameters to first Zomato API call
    firstCall(city,distance);

    // Send city parameter to Open weather API call
    weatherForecast(city);

});


// Toggle Search Radius Input Feild 
$("#check-box").on("change", function() {

    // this will contain a reference to the checkbox   
    if (this.checked) {

        // the checkbox is now checked, remove "hide" class
        $("#search-radius-input").removeClass("hide");

    } else {

        // the checkbox is now no longer checked, add "hide" class
        $("#search-radius-input").addClass("hide");

    }

});


// function currentWeather makes open weather api call with whatever valid city name it is passed
function weatherForecast(city) {

    // querry url for open weather api call
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&appid=" + owKey;

    // ajax call to the open weather api - fetch(queryURL) may also be used for this pourpose
    $.ajax({
        async: true,
        crossDomain: true,
        url: queryURL,
        method: "GET",
    })
    
    // promise - on api responce, execute the following
    .then(function(response) {

        // function call oneCall creates a new open weather instance to get current weather, and 7 day forecast w/ uv index
        oneCall(response);

    });

}


// function oneCall creates a new open weather instance to get current weather, and 7 day forecast w/ uv index, and adds the previous call's city name value to the new object structure
function oneCall(r) {

    // querry url for open weather one-call api - uses lat and lon form previous api call response structure
    var queryURL = "https://api.openweathermap.org/data/2.5/onecall?" + "&appid=" + owKey + "&lat=" + r.coord.lat + "&lon=" + r.coord.lon + "&units=imperial&exclude=hourly,minutely";

    // ajax call to the open weather api - fetch(queryURL) may also be used for this pourpose
    $.ajax({
        async: true,
        crossDomain: true,
        url: queryURL,
        method: "GET"
    })
    
    // promise - on api responce execute the following
    .then(function(response) {

        // add city name (r.name) value to current api responce object structure, from original api call response "r" and overwrite r
        r = Object.assign({name:r.name}, response)

        // set last_searched key word with currently searched city name as value in local storage
        localStorage.setItem("last_searched",r.name);

        // set last_searched_timezone key word with currently searched city timezone as value in local storage
        localStorage.setItem("last_searched_timezone",r.timezone);

        // function call display5Day passes city name to display 5-day forecast
        display5Day(r);

    });

}


// Updates the time in the city date-time header above the weather forecast area 
function updateTime() {

    // Get last searched city from local storage
    var name = localStorage.getItem("last_searched");

    // Get last searched city timezone for local storage
    var timezone = localStorage.getItem("last_searched_timezone");

    // Set dateTime equal tp the current time output of moment-timezone.js
    var dateTime = moment().tz(timezone).format('MMMM Do YYYY - h:mm a')

    // Display the city name, current date, and time in the header above the weather forecast area
    $("#city-time").text(name + " - " + dateTime);
    
}


// Function display5Day displays 5-day forecast weather data
function display5Day(r) {

    // Set 1 second update (callback) time interval to give user an accurate time for the city they are viewing 
    setInterval(updateTime, 1000);

    // Call updateTime function to set the city-date-time display and trigger the continuous time update
    updateTime();

    // Set forcastConditions equal to the open weather api responce object data structure
    var forecastConditions = r;

    // Clear previous weather cards prior to appending new forecast cards
    $("#days").empty();

    // loop for 6 of the 8 availible daily forecast object arrays - todays forecast + 5 days
    for (i=0; i < 6; i++) {

        // Initialize container divs
        var cardContainer = $("<div>");
        var cardImage = $("<img>");
        var cardBody = $("<div>");
        var cardDate = $("<h5>");
        var cardSpace = $("<br>");
        var cardTemp = $("<p>");
        var cardWind = $("<p>");
        var cardHumid = $("<p>");
        var cardUVI = $("<p>");

        // Set styling and append weather forecast card 
        $(cardContainer).addClass("card");
        $(cardContainer).attr("id","day" + i + "card");
        $("#days").append(cardContainer);

        // Create weather icon image source url with current weather icon - icon images are located in assets
        var imgURL = "assets/css/images/weather-icons/" + forecastConditions.daily[i].weather[0].icon + ".png";

        // Set styling and append weather icon image to weather forecast card 
        $(cardImage).addClass("weatherIcon");
        $(cardImage).attr("alt","weatherIcon");
        $(cardImage).attr("src", imgURL);
        $(cardContainer).append(cardImage);

        // Set styling and append card body container to weather forecast card 
        $(cardBody).addClass("card-body");
        $(cardContainer).append(cardBody);

        // Set the "date" text to "today" if on the first loop itteration - first item is today's forecast
        if (i==0) {
            var date = "Today";
        }else{
            // Get date (MM/DD) using moment-timezone.js
            var date = moment.unix(forecastConditions.daily[i].dt).tz(forecastConditions.timezone).format('dddd');
        };
        
        // Set styling and append date to card body container
        $(cardDate).addClass("fiveday");
        $(cardDate).attr("id","day" + i);
        $(cardDate).text(date);
        $(cardBody).append(cardDate);

        // Append line break to card body, between date and weather forecast data 
        $(cardBody).append(cardSpace);

        // Get the day temperature for the current date with no decemal place
        var Temp = (forecastConditions.daily[i].temp.day).toFixed(0);

        // Set styling and append temperatue data to card body container
        $(cardTemp).addClass("card-text");
        $(cardTemp).attr("id","Temp");
        $(cardTemp).text("Temp: " + Temp + String.fromCharCode(176) + "F");
        $(cardBody).append(cardTemp);

        // Set styling and append wind speed data to card body container
        $(cardWind).text("Wind: " + forecastConditions.daily[i].wind_speed + " mph");
        $(cardBody).append(cardWind);

        // Set styling and append relative humidity data to card body container
        $(cardHumid).text("RH: " + forecastConditions.daily[i].humidity + "%");
        $(cardBody).append(cardHumid);

        // Set styling and append uv index data to card body container
        $(cardUVI).text("UV: " + forecastConditions.daily[0].uvi);
        $(cardBody).append(cardUVI);

    }

}


// Function firstCall is meant to convert search radius distance from miles to meters, and make zomato api call to get city id
function firstCall(c, d) { 

    // Set cityName equal to the city name parameter "c", which contains the string value from the search input feild
    var cityName = c;

    // Set distance equal to the search radius distance parameter "d" and convert it to meters.
    var distance = d * 1609.34;
    
    // querry url for zomato api
    var queryURL = "https://developers.zomato.com/api/v2.1/cities?q="  + cityName ;

    // ajax call to the zomato api
    $.ajax({
        async: true,
        crossDomain: true,
        url: queryURL,
        method: "GET",
        headers: {"user-key": zmKey},
        dataType: "json"
    })

    // promise - on api responce execute the following
    .then(function(response){

        // Call locationDetails and pass it the city id from zomato's responce aswell as the newly converted search radius distance parameter
        locationDetails(response.location_suggestions[0].id, distance);

    });

}


// Function locationDetails is meant to make a second zomato api call with the city id, and search radius distance to retrieve top rated restaulants 
function locationDetails(r, d) {

    // rename function parameters
    var cityId = r;
    var dist = d;

    // querry url for zomato api - requires city id - search radius is optional
    var queryURL = "https://developers.zomato.com/api/v2.1/search?entity_id=" + cityId + "&entity_type=city&radius=" + dist + "&sort=rating";

    // ajax call to the zomato api
    $.ajax({
        async: true,
        crossDomain: true,
        url: queryURL,
        method: "GET",
        headers: {"user-key": zmKey},
        dataType: "json"
    })    

    // promise - on api response execute the following
    .then(function(response){

        // Call displayResults function and pass the response object data structure form zomato
        displayResults(response);

    });

}

// Function displayResults appends top rated restaurant data for the city in question to viewport
function displayResults(response) {

    // Clear previous results prior to appending new zomato data
    $("#resultsBackground").empty();

    // Loop through the response object data structure form zomato for each restaurant
    for (i=0 ; i < response.restaurants.length; i++) {

        // Initialize container divs
        var rowContainer = $("<div>");
        var imageContainer = $("<div>");
        var infoContainer = $("<div>");
        var name = $("<p>");
        var cuisine = $("<p>");
        var cuisineIcon = $("<i>");
        var address = $("<p>");
        var addressIcon = $("<i>");
        var phone = $("<p>");
        var phoneIcon = $("<i>");
        var ratings = $("<p>");
        var ratingIcon = $("<i>");
        var link = $("<a>");
        var linkIcon = $("<i>");

        // Set styling and append the main row div container to viewport
        $(rowContainer).addClass("row");
        $(rowContainer).attr("id","row");
        $("#resultsBackground").append(rowContainer);


        // Set styling and append image container to the main div container
        $(imageContainer).addClass("col-lg-3 text-center");

        // If no thumbnail is present, add WeatherDine stock logo image to the image container
        if (response.restaurants[i].restaurant.thumb == ""){

            var imgUrl = "assets/css/images/weather-dine.jpg";

            $(imageContainer).append('<img src =' + imgUrl + '>');
        
        // Else, append the zomato provided thumbnail to the image container
        }else {

            var imgUrl = response.restaurants[i].restaurant.thumb;

            $(imageContainer).append('<img src =' + imgUrl + '>');

        };
        
        $(rowContainer).append(imageContainer);


        // Set styling and append info container to the main div container
        $(infoContainer).addClass("col-lg-6");
        $(rowContainer).append(infoContainer);

        // Set styling and append restaurant name to info container
        $(name).addClass("name");
        $(name).text(response.restaurants[i].restaurant.name);
        $(infoContainer).append(name);

        // Set styling and append restaurant cuisine types to info container
        $(cuisine).addClass("cuisines");
        $(cuisineIcon).addClass("fas fa-utensils");
        $(cuisineIcon).text("   " + response.restaurants[i].restaurant.cuisines);
        $(cuisine).append(cuisineIcon);
        $(infoContainer).append(cuisine);
        
        // Set styling and append restaurant location to info container
        $(address).addClass("address");
        $(addressIcon).addClass("fas fa-map-marker-alt");
        $(addressIcon).text("   " + response.restaurants[i].restaurant.location.address);
        $(address).append(addressIcon);
        $(infoContainer).append(address);

        // Set styling and append restaurant phone number to info container
        $(phone).addClass("phone");
        $(phoneIcon).addClass("fas fa-phone");
        $(phoneIcon).text("   " + response.restaurants[i].restaurant.phone_numbers);
        $(phone).append(phoneIcon);
        $(infoContainer).append(phone);

        // Set styling and append zomato restaurant rating to info container
        $(ratings).addClass("rating");
        $(ratingIcon).addClass("fas fa-star");
        $(ratingIcon).text("   " + response.restaurants[i].restaurant.user_rating.aggregate_rating);
        $(ratings).append(ratingIcon);
        $(infoContainer).append(ratings);

        // Set styling and append zomato restaurant url to info container
        $(link).addClass("link");
        $(link).attr("href", response.restaurants[i].restaurant.url);
        $(linkIcon).addClass("fas fa-external-link-alt");
        $(linkIcon).text("   " + response.restaurants[i].restaurant.name);
        $(link).append(linkIcon);
        $(infoContainer).append(link);
    
    }

}