import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// Get MongoDB connection string from environment variable
const uri = process.env.DATABASE_URI;

// Create a function to connect to MongoDB
async function connectToDatabase() {
  if (!uri) {
    throw new Error('Please define the DATABASE_URI environment variable');
  }
  
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

export async function POST(request) {
  let client;
  
  try {
    const { email } = await request.json();
    
    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      );
    }
    
    // Connect to MongoDB directly
    client = await connectToDatabase();
    const db = client.db(); // Gets the default database in your connection string
    
    // Check if the email already exists
    const existingSubscriber = await db.collection('subscribers').findOne({ email });
    
    if (existingSubscriber) {
      return NextResponse.json(
        { success: true, message: 'You are already subscribed' },
        { status: 200 }
      );
    }
    
    // Create a new subscriber
    await db.collection('subscribers').insertOne({
      email,
      subscriptionDate: new Date(),
      status: 'active',
      source: 'Website Footer',
    });
    
    console.log(`Added subscriber with email: ${email}`);
    
    return NextResponse.json(
      { success: true, message: 'Thank you for subscribing!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}