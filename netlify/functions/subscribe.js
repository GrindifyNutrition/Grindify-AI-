const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Add CORS headers to handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { email } = JSON.parse(event.body);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
    const LIST_ID = process.env.KLAVIYO_LIST_ID;

    console.log('Config check:', {
      hasKey: !!KLAVIYO_API_KEY,
      keyLength: KLAVIYO_API_KEY?.length,
      listId: LIST_ID
    });

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

    const responseText = await response.text();
    console.log('API Response:', {
      status: response.status,
      body: responseText,
      requestUrl: `https://a.klaviyo.com/api/v2/list/${LIST_ID}/subscribe`
    });

    if (!response.ok) {
      throw new Error(`Failed to subscribe: ${responseText}`);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ message: 'Successfully subscribed to waitlist' })
    };

  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        error: 'Failed to subscribe to waitlist',
        details: error.message
      })
    };
  }
};
