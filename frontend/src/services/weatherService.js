import axios from 'axios';

const geocodingApi=axios.create({
    baseURL:'https://geocoding-api.open-meteo.com/v1',
    timeout:10000
});

const weatherApi=axios.create({
    baseURL:'https://api.open-meteo.com/v1',
    timeout:10000
});

const weatherDescriptions={
    0:'Clear sky',
    1:'Mainly clear',
    2:'Partly cloudy',
    3:'Overcast',
    45:'Foggy',
    48:'Foggy',
    51:'Light drizzle',
    53:'Drizzle',
    55:'Heavy drizzle',
    56:'Freezing drizzle',
    57:'Freezing drizzle',
    61:'Light rain',
    63:'Rain',
    65:'Heavy rain',
    66:'Freezing rain',
    67:'Heavy freezing rain',
    71:'Light snow',
    73:'Snow',
    75:'Heavy snow',
    77:'Snow grains',
    80:'Light showers',
    81:'Showers',
    82:'Heavy showers',
    85:'Light snow showers',
    86:'Heavy snow showers',
    95:'Thunderstorm',
    96:'Thunderstorm with hail',
    99:'Thunderstorm with heavy hail'
};

const getWeatherDescription=code=>{
    return weatherDescriptions[code]||'Unknown conditions';
};

const getCoordinatesFromLocation=async location=>{
    if(!location?.trim()){
        throw new Error('Location is not available.');
    }

    const response=await geocodingApi.get('/search',{
        params:{
            name:location.trim(),
            count:5,
            language:'en',
            format:'json',
            countryCode:'NG'
        }
    });

    const results=response.data?.results||[];

    const result=results.find(item=>
        item.country_code?.toUpperCase()==='NG'
    )||results[0];

    if(!result){
        throw new Error(
            `Unable to find weather location for ${location}.`
        );
    }

    return{
        latitude:result.latitude,
        longitude:result.longitude,
        name:result.name,
        country:result.country||'Nigeria'
    };
};

const getCoordinatesFromBrowser=()=>{
    return new Promise((resolve,reject)=>{
        if(
            typeof navigator==='undefined'||
            !navigator.geolocation
        ){
            reject(
                new Error(
                    'Location services are not supported by your browser.'
                )
            );
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position=>{
                resolve({
                    latitude:position.coords.latitude,
                    longitude:position.coords.longitude,
                    name:'Your current location',
                    country:'Nigeria'
                });
            },
            error=>{
                let message='Unable to access your current location.';

                if(error?.code===1){
                    message='Location permission was denied.';
                }

                if(error?.code===2){
                    message='Your current location could not be determined.';
                }

                if(error?.code===3){
                    message='Location request timed out.';
                }

                reject(new Error(message));
            },
            {
                enableHighAccuracy:false,
                timeout:7000,
                maximumAge:300000
            }
        );
    });
};

const buildLocationCandidates=(location,fallbacks={})=>{
    const candidates=[];

    const addCandidate=value=>{
        if(
            typeof value!=='string'||
            !value.trim()
        ){
            return;
        }

        const normalized=value.trim();

        if(
            !candidates.some(
                candidate=>
                    candidate.toLowerCase()===
                    normalized.toLowerCase()
            )
        ){
            candidates.push(normalized);
        }
    };

    addCandidate(fallbacks.lga);
    addCandidate(
        fallbacks.state&&fallbacks.lga
            ?`${fallbacks.lga}, ${fallbacks.state}`
            :null
    );
    addCandidate(fallbacks.state);
    addCandidate(fallbacks.location);
    addCandidate(location);

    return candidates;
};

const getCoordinatesFromFallbackLocations=async(
    location,
    fallbacks
)=>{
    const candidates=buildLocationCandidates(
        location,
        fallbacks
    );

    let lastError=null;

    for(const candidate of candidates){
        try{
            return await getCoordinatesFromLocation(
                candidate
            );
        }catch(error){
            lastError=error;
        }
    }

    throw(
        lastError||
        new Error('Unable to determine your weather location.')
    );
};

const getForecast=async coordinates=>{
    const response=await weatherApi.get(
        '/forecast',
        {
            params:{
                latitude:coordinates.latitude,
                longitude:coordinates.longitude,
                current:[
                    'temperature_2m',
                    'weather_code',
                    'is_day'
                ].join(','),
                daily:[
                    'weather_code',
                    'temperature_2m_max',
                    'temperature_2m_min'
                ].join(','),
                forecast_days:2,
                timezone:'auto'
            }
        }
    );

    const data=response.data;

    const forecast=
        data.daily?.time?.map(
            (date,index)=>({
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
                    data.daily.temperature_2m_min?.[index]
            })
        )||[];

    return{
        location:coordinates.name,
        country:coordinates.country,
        latitude:coordinates.latitude,
        longitude:coordinates.longitude,
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
        forecast
    };
};

const getWeather=async(
    location,
    fallbacks={}
)=>{
    let coordinates;

    try{
        coordinates=
            await getCoordinatesFromBrowser();
    }catch(browserError){
        try{
            coordinates=
                await getCoordinatesFromFallbackLocations(
                    location,
                    fallbacks
                );
        }catch(locationError){
            throw new Error(
                'Weather is currently unavailable for your location.'
            );
        }
    }

    return getForecast(coordinates);
};

const weatherService={
    getWeather
};

export default weatherService;