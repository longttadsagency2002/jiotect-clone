const axios = require('axios');

function extractCoordsFromUrl(url) {
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
    return null;
}

async function resolveUrlHandler(req, res) {
    try {
        const url = req.query.url;
        const e = req.query.e;

        if (!url) {
            return res.status(400).send('Missing URL parameter');
        }

        console.log(`Resolving: ${url}`);

        const response = await axios.get(url, {
            maxRedirects: 0,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            },
            validateStatus: status => status >= 300 && status < 400
        });

        console.log('Response Headers:', response.headers);

        const redirectUrl = response.headers.location;

        if (redirectUrl) {
            const coords = extractCoordsFromUrl(redirectUrl);
            if (e && coords) {
                res.send({ coords });
            } else {
                res.send({ redirectUrl });
            }
        } else {
            res.status(404).send('No redirect found');
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Cannot resolve URL');
    }
}

module.exports = { resolveUrlHandler };
