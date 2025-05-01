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
      hasListId: !!LIST_ID,
      listId: LIST_ID,
      email: email
    });

    if (!KLAVIYO_API_KEY || !LIST_ID) {
      throw new Error('Missing required environment variables');
    }

    // Prepare and log Klaviyo API request
    console.log('Making Klaviyo API request');

    // Make API request to add subscriber to list
    const response = await fetch(`https://a.klaviyo.com/api/v2/list/${LIST_ID}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        api_key: KLAVIYO_API_KEY,
        profiles: [{
          email: email,
          consent: true
        }]
      })
    });

    // Get and log response
    const responseText = await response.text();
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText
    });

    // Handle API errors
    if (!response.ok) {
      throw new Error(`Klaviyo API error: ${responseText}`);
    }

    // Success response
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
    // Log error details
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });

    // Error response
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
