const fetch = require('node-fetch'); // Only if using Node.js < 18

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

exports.getGwei = async (req, res) => {
  try {
    const url = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.status !== '1') {
      return res.status(502).json({ error: 'Invalid response from Etherscan', result: data });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gas prices', details: err.message });
  }
};
