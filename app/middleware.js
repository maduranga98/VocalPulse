import { NextResponse } from "next/server";
import { auth } from "firebase-admin";
import { initFirebaseAdmin } from "./app/lib/firebase-admin";

// Initialize Firebase Admin if it hasn't been initialized yet
const adminApp = initFirebaseAdmin();

export async function middleware(request) {
  const session = request.cookies.get("session")?.value || "";

  // Check if session exists
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify the session cookie
    const decodedClaims = await auth().verifySessionCookie(session, true);

    // If the token is valid, allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    // If the token is invalid, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Specify which routes require authentication
export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/kanban/:path*"],
};
