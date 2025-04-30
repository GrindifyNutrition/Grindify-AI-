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
    
    console.log('Creating profile for:', email); // Debug log
    
    // First create the profile
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
      throw new Error(`Failed to create profile in Klaviyo: ${errorText}`);
    }

    const profileData = await createProfileResponse.json();
    const profileId = profileData.data.id;
    
    console.log('Profile created with ID:', profileId); // Debug log

    // Now add the profile to the list
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
      throw new Error(`Failed to add to Klaviyo list: ${errorText}`);
    }

    console.log('Successfully added to list:', LIST_ID); // Debug log

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Successfully subscribed to waitlist' })
    };
  } catch (error) {
    console.error('Subscription error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to subscribe to waitlist: ${error.message}` })
    };
  }
};
