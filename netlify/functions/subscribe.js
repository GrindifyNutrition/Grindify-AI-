const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  console.log('Function invoked with:', {
    method: event.httpMethod,
    contentType: event.headers['content-type']
  });

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
    // Parse and validate request body
    if (!event.body) {
      throw new Error('Missing request body');
    }

    console.log('Request body:', event.body);
    const { email } = JSON.parse(event.body);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    // Get and validate environment variables
    const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
    const LIST_ID = process.env.KLAVIYO_LIST_ID;

    console.log('Environment check:', {
      hasKey: !!KLAVIYO_API_KEY,
      keyLength: KLAVIYO_API_KEY?.length,
      listId: LIST_ID,
      email: email
    });

    if (!KLAVIYO_API_KEY || !LIST_ID) {
      throw new Error('Missing required environment variables');
    }

    // Prepare Klaviyo API request
    const subscribeUrl = `https://a.klaviyo.com/api/v2/list/${LIST_ID}/subscribe`;
    const requestBody = {
      api_key: KLAVIYO_API_KEY,
      profiles: [{
        email: email
      }]
    };

    console.log('Making Klaviyo API request to:', subscribeUrl);

    // Make API request
    const response = await fetch(subscribeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('Klaviyo API response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      body: responseText
    });

    // Handle API response
    if (!response.ok) {
      throw new Error(`Klaviyo API error: ${responseText}`);
    }

    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: 'Successfully subscribed to waitlist',
        details: responseText
      })
    };

  } catch (error) {
    // Log detailed error information
    console.error('Subscription error:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });

    // Return error response
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Failed to subscribe to waitlist',
        details: error.message
      })
    };
  }
};
