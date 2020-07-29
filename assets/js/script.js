$("#search-button").on("click", function() {

    var c = $("#search").val();
    
    if($("#radius").val() == "") {

        var d = "1";

    }else{

        var d = $("#radius").val();

    }

    firstCall(c,d)

    weatherForecast(c);

});


var owKey = "63bf744b035f495cccad8662678a851d";

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

        // function call display5Day passes city name to display 5-day forecast
        display5Day(r);

    });

}


function updateTime(r) {

    var dateTime = moment().tz(r.timezone).format('MMMM Do YYYY, h:mm:ss a')
    $("#city-time").text(r.name + " - " + dateTime);
    
}

// function display5Day displays 5-day forecast weather data from local storage to the 5-day forecast weather area
function display5Day(r) {

    var forecastConditions = r;

    setInterval(updateTime(r),1000);

    $("#days").empty();

    // loop for 6 of the 8 availible daily forecast object arrays - todays forecast + 5 days
    for (i=0; i < 6; i++) {

        var cardContainer = $("<div>");
        var cardImage = $("<img>");
        var cardBody = $("<div>");
        var cardDate = $("<h5>");
        var cardSpace = $("<br>");
        var cardTemp = $("<p>");
        var cardWind = $("<p>");
        var cardHumid = $("<p>");
        var cardUVI = $("<p>");

        $(cardContainer).addClass("card");
        $(cardContainer).attr("id","day" + i + "card");
        $("#days").append(cardContainer);

        // create weather icon image source url with current weather icon - used small icon by removing @2x in the URL
        var imgURL = "assets/css/images/weather-icons/" + forecastConditions.daily[i].weather[0].icon + ".png";

        $(cardImage).addClass("weatherIcon");
        $(cardImage).attr("alt","weatherIcon");
        $(cardImage).attr("src", imgURL);
        $(cardContainer).append(cardImage);

        $(cardBody).addClass("card-body");
        $(cardContainer).append(cardBody);

        if (i==0) {
            var date = "Today";
        }else{
            // get date (MM/DD) using moment-timezone.js
            var date = moment.unix(forecastConditions.daily[i].dt).tz(forecastConditions.timezone).format('dddd');
        }
        
        $(cardDate).addClass("fiveday");
        $(cardDate).attr("id","day" + i);
        $(cardDate).text(date);
        $(cardBody).append(cardDate);

        $(cardBody).append(cardSpace);

        // get the day temperature for the current date with no decemal place
        var Temp = (forecastConditions.daily[i].temp.day).toFixed(0);

        $(cardTemp).addClass("card-text");
        $(cardTemp).attr("id","Temp");
        $(cardTemp).text("Temp: " + Temp + String.fromCharCode(176) + "F");
        $(cardBody).append(cardTemp);

        $(cardWind).text("Wind: " + forecastConditions.daily[i].wind_speed + " mph");
        $(cardBody).append(cardWind);

        $(cardHumid).text("RH: " + forecastConditions.daily[i].humidity + "%");
        $(cardBody).append(cardHumid);

        $(cardUVI).text("UV: " + forecastConditions.daily[0].uvi);
        $(cardBody).append(cardUVI);

    }

}


$("#check-box").on("change", function() {
    // this will contain a reference to the checkbox   
    if (this.checked) {
        // the checkbox is now checked
        $("#search-radius-input").removeClass("hide");
    } else {
        // the checkbox is now no longer checked
        $("#search-radius-input").addClass("hide");
    }
});


function firstCall(c, d) { 

    var cityName = c;
    var distance = d * 1609.34;
    var zapiKey = "994c943d3c627184565ead545dcb7dac";
    let queryURL = "https://developers.zomato.com/api/v2.1/cities?q="  + cityName ;

    $.ajax({
        async: true,
        crossDomain: true,
        url: queryURL,
        method: "GET",
        headers: {"user-key": zapiKey},
        dataType: "json"
    })

    .then(function(response){

        var zomatoCityId = $("<div>");
        $(zomatoCityId).attr("id", "#zomato");
        $(zomatoCityId).addClass("card col-md-5 bg-secondary");
        $(zomatoCityId).text("City ID: " + response.location_suggestions[0].id);
       
        $("#suggestions-div").append(zomatoCityId);

        newCall(response, distance);

    })

}


function newCall(r,d) {

    var cityId = r.location_suggestions[0].id;
    var distance = d;

    var zapiKey = "994c943d3c627184565ead545dcb7dac";
    let queryURL = "https://developers.zomato.com/api/v2.1/location_details?entity_id=" + cityId + "&entity_type=city";

    $.ajax({
        async: true,
        crossDomain: true,
        url: queryURL,
        method: "GET",
        headers: {"user-key": zapiKey},
        dataType: "json"
    })    

    .then(function(response){

        locationDetails(cityId, distance);

    })

}


function locationDetails(r, d) {

    var cityId = r;
    var dist = d;

    var zapiKey = "994c943d3c627184565ead545dcb7dac";
    let queryURL = "https://developers.zomato.com/api/v2.1/search?entity_id=" + cityId + "&entity_type=city&count=100&radius=" + dist + "&sort=rating";

    $.ajax({
        async: true,
        crossDomain: true,
        url: queryURL,
        method: "GET",
        headers: {"user-key": zapiKey},
        dataType: "json"
    })    

    .then(function(response){

        displayResults(response);

    })

}


function displayResults(response) {

    $("#resultsBackground").empty();

    for (i=0 ; i < response.restaurants.length; i++) {

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
        
        $(rowContainer).addClass("row");
        $(rowContainer).attr("id","row");
        $("#resultsBackground").append(rowContainer);

        $(imageContainer).addClass("col-lg-3 text-center");

        if (response.restaurants[i].restaurant.thumb == ""){

            var imgUrl = "assets/css/images/weather-dine.jpg";

            $(imageContainer).append('<img src =' + imgUrl + '>');

        }else {

            var imgUrl = response.restaurants[i].restaurant.thumb;

            $(imageContainer).append('<img src =' + imgUrl + '>');

        };
        
        $(rowContainer).append(imageContainer);

        $(infoContainer).addClass("col-lg-6");
        $(rowContainer).append(infoContainer);

        $(name).addClass("name");
        $(name).text(response.restaurants[i].restaurant.name);
        $(infoContainer).append(name);

        $(cuisine).addClass("cuisines");
        $(cuisineIcon).addClass("fas fa-utensils");
        $(cuisineIcon).text("   " + response.restaurants[i].restaurant.cuisines);
        $(cuisine).append(cuisineIcon);
        $(infoContainer).append(cuisine);
        
        $(address).addClass("address");
        $(addressIcon).addClass("fas fa-map-marker-alt");
        $(addressIcon).text("   " + response.restaurants[i].restaurant.location.address);
        $(address).append(addressIcon);
        $(infoContainer).append(address);

        $(phone).addClass("phone");
        $(phoneIcon).addClass("fas fa-phone");
        $(phoneIcon).text("   " + response.restaurants[i].restaurant.phone_numbers);
        $(phone).append(phoneIcon);
        $(infoContainer).append(phone);

        $(ratings).addClass("rating");
        $(ratingIcon).addClass("fas fa-star");
        $(ratingIcon).text("   " + response.restaurants[i].restaurant.user_rating.aggregate_rating);
        $(ratings).append(ratingIcon);
        $(infoContainer).append(ratings);

        $(link).addClass("link");
        $(link).attr("href", response.restaurants[i].restaurant.url);
        $(linkIcon).addClass("fas fa-external-link-alt");
        $(linkIcon).text("   " + response.restaurants[i].restaurant.name);
        $(link).append(linkIcon);
        $(infoContainer).append(link);
    
    }

}