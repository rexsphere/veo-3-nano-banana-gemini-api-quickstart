import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  };

  initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
  });
}

export async function authenticateRequest(request: Request | NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    // Development bypass for local testing
    if (process.env.NODE_ENV === 'development') {
      if (authHeader === 'Bearer dev-token' || authHeader === 'Bearer dev') {
        console.log('Development bypass: Request authenticated');
        return NextResponse.next();
      }
      // In development, allow requests without auth header for easier testing
      console.log('Development mode: Allowing request without authentication header');
      return NextResponse.next();
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the Firebase ID token
    await getAuth().verifyIdToken(token);

    // Token is valid, proceed with the request
    return NextResponse.next();
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Unauthorized: Invalid token' },
      { status: 401 }
    );
  }
}

// Helper function to get the current user from the request
export async function getCurrentUser(request: Request | NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    return await getAuth().verifyIdToken(token);
  } catch {
    return null;
  }
}
