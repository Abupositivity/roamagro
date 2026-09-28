
import axios from "axios";

const geocodingApi = axios.create({
    baseURL: "https://geocoding-api.open-meteo.com/v1",
    timeout: 10000,
});

const weatherApi = axios.create({
    baseURL: "https://api.open-meteo.com/v1",
    timeout: 10000,
});

const geocodingCache = new Map();

const weatherDescriptions = {
    0: "Sunny",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
};

const getWeatherDescription = (code) => {
    if (code === undefined || code === null) {
        return "Weather conditions unavailable";
    }

    return weatherDescriptions[code] || "Weather conditions unavailable";
};

const getCoordinatesFromLocation = async (location, options = {}) => {
    if (typeof location !== "string" || !location.trim()) {
        throw new Error("Location is not available.");
    }

    const normalizedLocation = location.trim();
    const countryCode =
        typeof options.countryCode === "string" &&
        /^[a-z]{2}$/i.test(options.countryCode.trim())
            ? options.countryCode.trim().toUpperCase()
            : null;

    const cacheKey = `${normalizedLocation.toLowerCase()}|${countryCode || ""}`;

    if (geocodingCache.has(cacheKey)) {
        return geocodingCache.get(cacheKey);
    }

    const params = {
        name: normalizedLocation,
        count: 10,
        language: "en",
        format: "json",
    };

    if (countryCode) {
        params.countryCode = countryCode;
    }

    const request = geocodingApi
        .get("/search", { params })
        .then((response) => {
            const results = response.data?.results || [];

            if (!results.length) {
                throw new Error(
                    `Unable to find weather location for ${normalizedLocation}.`
                );
            }

            const exactMatch = results.find(
                (item) =>
                    item.name?.toLowerCase() ===
                    normalizedLocation.toLowerCase()
            );

            const result = exactMatch || results[0];

            return {
                latitude: result.latitude,
                longitude: result.longitude,
                name: result.name,
                country: result.country || null,
                countryCode: result.country_code || null,
                admin1: result.admin1 || null,
                timezone: result.timezone || null,
            };
        })
        .catch((error) => {
            geocodingCache.delete(cacheKey);
            throw error;
        });

    geocodingCache.set(cacheKey, request);

    return request;
};

const getCoordinatesFromBrowser = () =>
    new Promise((resolve, reject) => {
        if (
            typeof navigator === "undefined" ||
            !navigator.geolocation
        ) {
            reject(
                new Error(
                    "Location services are not supported by your browser."
                )
            );
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    name: "Current location",
                    country: null,
                    countryCode: null,
                    admin1: null,
                    timezone: null,
                });
            },
            (error) => {
                const messages = {
                    1: "Location permission was denied.",
                    2: "Your current location could not be determined.",
                    3: "Location request timed out.",
                };

                reject(
                    new Error(
                        messages[error?.code] ||
                            "Unable to access your current location."
                    )
                );
            },
            {
                enableHighAccuracy: false,
                timeout: 7000,
                maximumAge: 300000,
            }
        );
    });

const buildLocationCandidates = (location, fallbacks = {}) => {
    const candidates = [];

    const addCandidate = (value) => {
        if (typeof value !== "string" || !value.trim()) {
            return;
        }

        const normalized = value.trim();

        if (
            !candidates.some(
                (candidate) =>
                    candidate.toLowerCase() === normalized.toLowerCase()
            )
        ) {
            candidates.push(normalized);
        }
    };

    addCandidate(location);
    addCandidate(fallbacks.city);
    addCandidate(fallbacks.lga);
    addCandidate(fallbacks.state);
    addCandidate(fallbacks.region);

    return candidates;
};

const getCoordinatesFromFallbackLocations = async (
    location,
    fallbacks = {}
) => {
    const candidates = buildLocationCandidates(location, fallbacks);
    let lastError = null;

    for (const candidate of candidates) {
        try {
            return await getCoordinatesFromLocation(candidate, fallbacks);
        } catch (error) {
            lastError = error;
        }
    }

    throw (
        lastError ||
        new Error("Unable to determine your weather location.")
    );
};

const getForecast = async (coordinates) => {
    const response = await weatherApi.get("/forecast", {
        params: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            current: [
                "temperature_2m",
                "apparent_temperature",
                "relative_humidity_2m",
                "precipitation",
                "rain",
                "showers",
                "weather_code",
                "is_day",
                "wind_speed_10m",
            ].join(","),
            daily: [
                "weather_code",
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_sum",
                "precipitation_probability_max",
                "wind_speed_10m_max",
            ].join(","),
            forecast_days: 2,
            timezone: "auto",
            temperature_unit: "celsius",
            wind_speed_unit: "kmh",
            precipitation_unit: "mm",
        },
    });

    const data = response.data;
    const current = data.current || {};
    const daily = data.daily || {};

    const forecast = (daily.time || []).map((date, index) => ({
        date,
        weatherCode: daily.weather_code?.[index],
        condition: getWeatherDescription(daily.weather_code?.[index]),
        maxTemperature: daily.temperature_2m_max?.[index],
        minTemperature: daily.temperature_2m_min?.[index],
        precipitation: daily.precipitation_sum?.[index],
        precipitationProbability:
            daily.precipitation_probability_max?.[index],
        maxWindSpeed: daily.wind_speed_10m_max?.[index],
    }));

    return {
        location: coordinates.name,
        country: coordinates.country,
        countryCode: coordinates.countryCode,
        region: coordinates.admin1,
        timezone: data.timezone || coordinates.timezone,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        temperature: current.temperature_2m,
        apparentTemperature: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        rain: current.rain,
        showers: current.showers,
        windSpeed: current.wind_speed_10m,
        condition: getWeatherDescription(current.weather_code),
        weatherCode: current.weather_code,
        isDay: current.is_day,
        forecast,
    };
};

const getWeather = async (location, fallbacks = {}) => {
    let coordinates;

    try {
        coordinates = await getCoordinatesFromFallbackLocations(
            location,
            fallbacks
        );
    } catch (locationError) {
        try {
            coordinates = await getCoordinatesFromBrowser();
        } catch (browserError) {
            throw new Error(
                "Weather is currently unavailable for your location."
            );
        }
    }

    return getForecast(coordinates);
};

const weatherService = {
    getWeather,
};

export default weatherService;