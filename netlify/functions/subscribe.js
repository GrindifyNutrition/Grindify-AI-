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

    const response = await fetch(`https://a.klaviyo.com/api/v2/list/${LIST_ID}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`
      },
      body: JSON.stringify({
        profiles: [{
          email: email
        }]
      })
    });

    const responseText = await response.text();
    console.log('API Response:', {
      status: response.status,
      body: responseText
    });

    if (!response.ok) {
      throw new Error(responseText || 'Failed to subscribe');
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
    console.error('Error:', error);
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
