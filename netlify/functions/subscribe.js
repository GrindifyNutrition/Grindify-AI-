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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { email } = JSON.parse(event.body);

    // Validate email
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

    // Get environment variables
    const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
    const LIST_ID = process.env.KLAVIYO_LIST_ID;

    if (!KLAVIYO_API_KEY || !LIST_ID) {
      console.error('Missing environment variables:', { 
        hasApiKey: !!KLAVIYO_API_KEY, 
        hasListId: !!LIST_ID 
      });
      throw new Error('Configuration error');
    }

    console.log('Attempting to subscribe:', email);

    // Add to Klaviyo list
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
      const errorText = await response.text();
      console.error('Subscription failed:', errorText);
      throw new Error(`Failed to subscribe: ${errorText}`);
    }

    console.log('Successfully subscribed to list:', LIST_ID);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        message: 'Successfully subscribed to waitlist'
      })
    };

  } catch (error) {
    console.error('Subscription error:', error.message);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        error: 'Failed to subscribe to waitlist',
        debug: error.message
      })
    };
  }
};
