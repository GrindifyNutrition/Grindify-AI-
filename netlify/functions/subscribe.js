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

    console.log('Attempting to create profile for:', email);

    // Create profile in Klaviyo
    const createProfileResponse = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'revision': '2023-09-15'
      },
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            email: email,
            subscribed: true
          }
        }
      })
    });

    if (!createProfileResponse.ok) {
      const errorText = await createProfileResponse.text();
      console.error('Profile creation failed:', errorText);
      throw new Error(`Failed to create profile: ${errorText}`);
    }

    const profileData = await createProfileResponse.json();
    const profileId = profileData.data.id;

    console.log('Profile created, ID:', profileId);

    // Add profile to list
    const addToListResponse = await fetch(`https://a.klaviyo.com/api/lists/${LIST_ID}/relationships/profiles/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'revision': '2023-09-15'
      },
      body: JSON.stringify({
        data: [{
          type: 'profile',
          id: profileId
        }]
      })
    });

    if (!addToListResponse.ok) {
      const errorText = await addToListResponse.text();
      console.error('Adding to list failed:', errorText);
      throw new Error(`Failed to add to list: ${errorText}`);
    }

    console.log('Successfully added to list:', LIST_ID);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        message: 'Successfully subscribed to waitlist',
        debug: { profileId, listId: LIST_ID }
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
