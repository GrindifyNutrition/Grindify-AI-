const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email } = JSON.parse(event.body);

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    // Klaviyo API endpoint
    const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
    const LIST_ID = process.env.KLAVIYO_LIST_ID;
    
    const response = await fetch(`https://a.klaviyo.com/api/v2/list/${LIST_ID}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: KLAVIYO_API_KEY,
        profiles: [{
          email: email
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe to Klaviyo');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Successfully subscribed to waitlist' })
    };
  } catch (error) {
    console.error('Subscription error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to subscribe to waitlist' })
    };
  }
};
