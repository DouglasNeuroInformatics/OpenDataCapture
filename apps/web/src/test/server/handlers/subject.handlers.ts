import { HttpResponse, http } from 'msw';



export const SubjectHandlers = [
    http.get('/v1/subjects', () => {
        return HttpResponse.json([{"createdAt":"2023-11-23T17:04:30.555Z","dateOfBirth":"1986-03-07T03:38:36.157Z","firstName":"Meta","groups":["655f861eeb97aff8dc4f0c8e"],"id":"655f861eeb97aff8dc4f0c9f","identifier":"d7c6060b1b6df7ffc54ef306fec25470af518268c17058aedc4f28b752102a7b","lastName":"Keebler","sex":"female","updatedAt":"2023-11-23T17:04:30.682Z"},{"createdAt":"2023-11-23T17:04:34.617Z","dateOfBirth":"1978-02-10T18:56:27.754Z","firstName":"Arturo","groups":["655f861deb97aff8dc4f0c8b"],"id":"655f8622eb97aff8dc4f0da3","identifier":"99589f2ad3392774380ed50fbdea4c6947e58582c71f0b3cc2db4c615baa56ea","lastName":"Fahey","sex":"female","updatedAt":"2023-11-23T17:04:34.672Z"},{"createdAt":"2023-11-23T17:04:38.384Z","dateOfBirth":"1981-10-21T09:37:31.542Z","firstName":"Trevor","groups":["655f861eeb97aff8dc4f0c8e"],"id":"655f8626eb97aff8dc4f0ea7","identifier":"534f9363059a4839e7e356b169de8bd7e172bede128022f3ea3f832b5c966ce5","lastName":"Ryan","sex":"female","updatedAt":"2023-11-23T17:04:38.438Z"},{"createdAt":"2023-11-23T17:04:42.184Z","dateOfBirth":"1966-12-01T01:45:35.163Z","firstName":"Marcelina","groups":["655f861eeb97aff8dc4f0c8e"],"id":"655f862aeb97aff8dc4f0fab","identifier":"c71d83d8579bfcf7cfde2718fa78ec85955a2c2d5a8c4c57832caf59c997e57c","lastName":"Stokes","sex":"female","updatedAt":"2023-11-23T17:04:42.241Z"}])
    }),
    http.get("/v1/assignments/summary?subjectIdentifier=d7c6060b1b6df7ffc54ef306fec25470af518268c17058aedc4f28b752102a7b", () =>{
        return HttpResponse.json([
        ])
    }),

    http.get("/v1/instrument-records?instrumentId=6557bcdc930d9604d635551c&subjectIdentifier=d7c6060b1b6df7ffc54ef306fec25470af518268c17058aedc4f28b752102a7b", () =>{
        return HttpResponse.json([
            {
                "computedMeasures": {
                    "overallHappiness": 3
                },
                "createdAt": "2023-11-17T19:19:57.595Z",
                "data": {
                    "overallHappiness": 3
                },
                "date": "2022-09-28T10:23:13.696Z",
                "group": "6557bcdc930d9604d6355528",
                "id": "6557bcdd930d9604d63555a8",
                "instrument": "6557bcdc930d9604d635551c",
                "subject": "6557bcdd930d9604d6355539",
                "updatedAt": "2023-11-17T19:19:57.595Z"
            },
         
        ])
    }),

    //handlers for graph page

    http.get("/v1/instrument-records/linear-model?instrumentId=655f861deb97aff8dc4f0c82", () => {
        return HttpResponse.json();
    }),

    http.get("/v1/instrument-records?instrumentId=655f861deb97aff8dc4f0c82&subjectIdentifier=d7c6060b1b6df7ffc54ef306fec25470af518268c17058aedc4f28b752102a7b", () => {
        return HttpResponse.json();
    })
];