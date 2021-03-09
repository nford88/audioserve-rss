const express = require('express');
const js2xmlparser = require("js2xmlparser");
const fetch = require("node-fetch");
const ip = require('ip');

const listen = 3005
const domain = ip.address()
const as_port = 3004


const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

const server = express();

server.get("/rss/:folder", asyncMiddleware(async (req, res, next) => {
    res.contentType('application/xml');
    await getData(req.params.folder, res);
}));

server.listen(listen, () => {
    console.log(`Server listening at ${listen}`);
});

const getData = (folder, res) => {
    const URL = `http://${domain}:${as_port}`
    fetch(`${URL}/folder/${folder}`)
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            const imgUrl = {
                image: {
                    url: `${URL}/cover/${data.cover.path}`,
                    title: folder,
                }
            };
            const items = data.files.map((item, imgUrl) => ({
                title: item.name,
                description: item.name,
                pubDate: new Date('2020-06-06').toString(),
                enclosure: [{
                    "@": {
                        url: `${URL}/audio/${item.path}`,
                        type: item.mime,
                        length:item.meta.duration,
                    }
                }],
                guid: `${URL}/audio/${item.path}`,
                ...imgUrl
            }));
            const rss = [{
                    "@": {
                        version: "2.0",
                        "xmlns:googleplay": "http://www.google.com/schemas/play-podcasts/1.0",
                        "xmlns:itunes":"http://www.itunes.com/dtds/podcast-1.0.dtd"
                    },
                    channel: {
                        title: folder,
                        description: folder,
                        language: 'en-us',
                        ...imgUrl,
                        item: [
                            ...items
                        ],
                    }
                }];
            const xml = js2xmlparser.parse("rss", ...rss);
            res.send(xml);
        })
        .catch((error) => {
            res.status(500)
            res.send(error);
        })     
}