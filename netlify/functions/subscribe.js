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

    // Log environment variables (safely)
    console.log('Environment check:', {
      hasKey: !!KLAVIYO_API_KEY,
      keyLength: KLAVIYO_API_KEY?.length,
      listId: LIST_ID
    });

    if (!KLAVIYO_API_KEY || !LIST_ID) {
      throw new Error('Missing required configuration');
    }

    // First try to identify if the profile exists
    const identifyResponse = await fetch('https://a.klaviyo.com/api/identify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: KLAVIYO_API_KEY,
        properties: {
          email: email
        }
      })
    });

    if (!identifyResponse.ok) {
      const identifyText = await identifyResponse.text();
      console.error('Identify failed:', identifyText);
    }

    // Then subscribe to list
    const subscribeResponse = await fetch(`https://a.klaviyo.com/api/v2/list/${LIST_ID}/subscribe`, {
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

    const subscribeText = await subscribeResponse.text();
    console.log('Subscribe response:', {
      status: subscribeResponse.status,
      body: subscribeText
    });

    if (!subscribeResponse.ok) {
      throw new Error(`Subscription failed: ${subscribeText}`);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        message: 'Successfully subscribed to waitlist',
        details: subscribeText
      })
    };

  } catch (error) {
    console.error('Subscription error:', {
      message: error.message,
      stack: error.stack
    });
    
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
