import axios from 'axios';

const geocodingApi = axios.create({
    baseURL: 'https://geocoding-api.open-meteo.com/v1',
    timeout: 10000,
});

const weatherApi = axios.create({
    baseURL: 'https://api.open-meteo.com/v1',
    timeout: 10000,
});

const weatherDescriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    56: 'Freezing drizzle',
    57: 'Freezing drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Light showers',
    81: 'Showers',
    82: 'Heavy showers',
    85: 'Light snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
};

const getWeatherDescription = (code) => {
    return weatherDescriptions[code] || 'Unknown conditions';
};

const getCoordinatesFromLocation = async (location) => {

    if (!location) {
        throw new Error('Location is not available.');
    }

    const response = await geocodingApi.get('/search', {
        params: {
            name: location,
            count: 1,
            language: 'en',
            format: 'json',
        },
    });

    const result = response.data?.results?.[0];

    if (!result) {
        throw new Error('Unable to find your location.');
    }

    return {
        latitude: result.latitude,
        longitude: result.longitude,
        name: result.name,
        country: result.country,
    };
};

const getCoordinatesFromBrowser = () => {

    return new Promise((resolve, reject) => {

        if (!navigator.geolocation) {
            reject(
                new Error(
                    'Location services are not supported by your browser.'
                )
            );
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {

                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    name: 'Your location',
                    country: '',
                });

            },
            () => {

                reject(
                    new Error(
                        'Unable to access your location.'
                    )
                );

            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000,
            }
        );

    });
};

const getWeather = async (location) => {

    let coordinates;

    if (location) {

        try {

            coordinates =
                await getCoordinatesFromLocation(
                    location
                );

        } catch (error) {

            coordinates =
                await getCoordinatesFromBrowser();

        }

    } else {

        coordinates =
            await getCoordinatesFromBrowser();

    }

    const response = await weatherApi.get(
        '/forecast',
        {
            params: {
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                current: [
                    'temperature_2m',
                    'weather_code',
                    'is_day',
                ].join(','),
                daily: [
                    'weather_code',
                    'temperature_2m_max',
                    'temperature_2m_min',
                ].join(','),
                forecast_days: 3,
                timezone: 'auto',
            },
        }
    );

    const data = response.data;

    const forecast = data.daily?.time?.map(
        (date, index) => ({
            date,
            weatherCode:
                data.daily.weather_code?.[index],
            condition:
                getWeatherDescription(
                    data.daily.weather_code?.[index]
                ),
            maxTemperature:
                data.daily.temperature_2m_max?.[index],
            minTemperature:
                data.daily.temperature_2m_min?.[index],
        })
    ) || [];

    return {
        location: coordinates.name,
        country: coordinates.country,
        temperature:
            data.current?.temperature_2m,
        condition:
            getWeatherDescription(
                data.current?.weather_code
            ),
        weatherCode:
            data.current?.weather_code,
        isDay:
            data.current?.is_day,
        forecast,
    };
};

const weatherService = {
    getWeather,
};

export default weatherService;