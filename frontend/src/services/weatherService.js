import axios from "axios";
import i18n from "../i18n";

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
    0: "Clear sky",
    1: "Mostly clear",
    2: "Some clouds",
    3: "Cloudy",

    45: "Foggy",
    48: "Foggy",

    51: "Light rain",
    53: "Light rain",
    55: "Rain",
    56: "Light rain",
    57: "Rain",

    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Light rain",
    67: "Heavy rain",

    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow",

    80: "Light rain",
    81: "Rain",
    82: "Heavy rain",

    85: "Light snow",
    86: "Heavy snow",

    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with hail",
};

const nightDescriptions = {
    0: "Clear night",
    1: "Mostly clear night",
    2: "Some clouds at night",
    3: "Cloudy night",
};

const getWeatherDescription = (
    code,
    isDay = null
) => {
    if (code === undefined || code === null) {
        return i18n.t(
            "Weather conditions unavailable"
        );
    }

    const numericCode = Number(code);

    if (
        isDay === 0 &&
        Object.prototype.hasOwnProperty.call(
            nightDescriptions,
            numericCode
        )
    ) {
        return i18n.t(
            nightDescriptions[numericCode]
        );
    }

    return i18n.t(
        weatherDescriptions[numericCode] ||
            "Weather conditions unavailable"
    );
};

const getCoordinatesFromLocation = async (
    location,
    options = {}
) => {
    if (
        typeof location !== "string" ||
        !location.trim()
    ) {
        throw new Error(
            i18n.t("Location is not available.")
        );
    }

    const normalizedLocation = location.trim();

    const countryCode =
        typeof options.countryCode === "string" &&
        /^[a-z]{2}$/i.test(
            options.countryCode.trim()
        )
            ? options.countryCode
                  .trim()
                  .toUpperCase()
            : null;

    const cacheKey = `${
        normalizedLocation.toLowerCase()
    }|${countryCode || ""}`;

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
            const results =
                response.data?.results || [];

            if (!results.length) {
                throw new Error(
                    i18n.t(
                        "Unable to find weather location for {{location}}.",
                        {
                            location:
                                normalizedLocation,
                        }
                    )
                );
            }

            const exactMatch = results.find(
                (item) =>
                    item.name?.toLowerCase() ===
                    normalizedLocation.toLowerCase()
            );

            const result =
                exactMatch || results[0];

            return {
                latitude: result.latitude,
                longitude: result.longitude,
                name: result.name,
                country: result.country || null,
                countryCode:
                    result.country_code || null,
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
                    i18n.t(
                        "Location services are not supported by your browser."
                    )
                )
            );
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude:
                        position.coords.latitude,
                    longitude:
                        position.coords.longitude,
                    name: i18n.t(
                        "Current location"
                    ),
                    country: null,
                    countryCode: null,
                    admin1: null,
                    timezone: null,
                });
            },
            (error) => {
                const messages = {
                    1: i18n.t(
                        "Location permission was denied."
                    ),
                    2: i18n.t(
                        "Your current location could not be determined."
                    ),
                    3: i18n.t(
                        "Location request timed out."
                    ),
                };

                reject(
                    new Error(
                        messages[error?.code] ||
                            i18n.t(
                                "Unable to access your current location."
                            )
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

const buildLocationCandidates = (
    location,
    fallbacks = {}
) => {
    const candidates = [];

    const addCandidate = (value) => {
        if (
            typeof value !== "string" ||
            !value.trim()
        ) {
            return;
        }

        const normalized = value.trim();

        if (
            !candidates.some(
                (candidate) =>
                    candidate.toLowerCase() ===
                    normalized.toLowerCase()
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

const getCoordinatesFromFallbackLocations =
    async (location, fallbacks = {}) => {
        const candidates =
            buildLocationCandidates(
                location,
                fallbacks
            );

        let lastError = null;

        for (const candidate of candidates) {
            try {
                return await getCoordinatesFromLocation(
                    candidate,
                    fallbacks
                );
            } catch (error) {
                lastError = error;
            }
        }

        throw (
            lastError ||
            new Error(
                i18n.t(
                    "Unable to determine your weather location."
                )
            )
        );
    };

const getForecast = async (coordinates) => {
    const response = await weatherApi.get(
        "/forecast",
        {
            params: {
                latitude:
                    coordinates.latitude,
                longitude:
                    coordinates.longitude,

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
        }
    );

    const data = response.data;
    const current = data.current || {};
    const daily = data.daily || {};

    const forecast = (
        daily.time || []
    ).map((date, index) => ({
        date,

        weatherCode:
            daily.weather_code?.[index],

        condition: getWeatherDescription(
            daily.weather_code?.[index]
        ),

        maxTemperature:
            daily.temperature_2m_max?.[index],

        minTemperature:
            daily.temperature_2m_min?.[index],

        precipitation:
            daily.precipitation_sum?.[index],

        precipitationProbability:
            daily.precipitation_probability_max?.[
                index
            ],

        maxWindSpeed:
            daily.wind_speed_10m_max?.[index],
    }));

    return {
        location: coordinates.name,
        country: coordinates.country,
        countryCode: coordinates.countryCode,
        region: coordinates.admin1,

        timezone:
            data.timezone ||
            coordinates.timezone,

        latitude: coordinates.latitude,
        longitude: coordinates.longitude,

        temperature:
            current.temperature_2m,

        apparentTemperature:
            current.apparent_temperature,

        humidity:
            current.relative_humidity_2m,

        precipitation:
            current.precipitation,

        rain: current.rain,
        showers: current.showers,

        windSpeed:
            current.wind_speed_10m,

        condition: getWeatherDescription(
            current.weather_code,
            current.is_day
        ),

        weatherCode:
            current.weather_code,

        isDay: current.is_day,

        forecast,
    };
};

const getWeather = async (
    location,
    fallbacks = {}
) => {
    let coordinates;

    try {
        coordinates =
            await getCoordinatesFromFallbackLocations(
                location,
                fallbacks
            );
    } catch (locationError) {
        try {
            coordinates =
                await getCoordinatesFromBrowser();
        } catch (browserError) {
            throw new Error(
                i18n.t(
                    "Weather is currently unavailable for your location."
                )
            );
        }
    }

    return getForecast(coordinates);
};

const weatherService = {
    getWeather,
};

export default weatherService;