const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const API_URL = 'https://api.alphabot.app/v1';

app.post('/register', async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) {
        return res.status(400).json({ error: 'API Key is required' });
    }

    try {
        // Reuse the functions you already have for fetching and registering
        const slugs = await getRaffleSlugs(apiKey);
        const results = await joinRaffles(apiKey, slugs);
        res.json(results);
    } catch (error) {
        console.error('Error processing raffles:', error.message);
        res.status(500).json({ error: 'Failed to register raffles' });
    }
});

// The functions from your existing Node.js code
async function getRaffleSlugs(apiKey) {
    let page = 0;
    let allSlugs = [];
    while (true) {
        const response = await axios.get(`${API_URL}/raffles`, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
            params: {
                filter: 'unregistered',
                reqFilters: ['f', 'l', 't'],
                sortBy: 'ending',
                status: 'active',
                scope: 'community',
                pageSize: 50,
                pageNum: page
            }
        });

        const data = response.data;
        if (!data.success) throw new Error('Failed to get raffles: ' + data.errors[0].message);
        allSlugs.push(...data.data.raffles.map(item => item.slug));
        if (data.data.finalPage) break;
        page += 1;
    }
    return allSlugs;
}

async function joinRaffles(apiKey, slugs) {
    let results = {};
    for (const slug of slugs) {
        try {
            const response = await axios.post(`${API_URL}/register`,
                { slug: slug },
                { headers: { 'Authorization': `Bearer ${apiKey}` } }
            );
            if (response.data.success) {
                results[slug] = 'Success';
            } else {
                results[slug] = response.data.errors[0].message;
            }
        } catch (error) {
            results[slug] = error.message;
        }
    }
    return results;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
