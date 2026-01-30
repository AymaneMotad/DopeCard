/**
 * QStash Helper
 * 
 * Handles enqueueing push notification jobs to QStash queue
 */

import { Client } from "@upstash/qstash";

if (!process.env.QSTASH_TOKEN) {
  console.warn("QSTASH_TOKEN is not set in environment variables. Push notifications will not work.");
}

export const qstash = process.env.QSTASH_TOKEN
  ? new Client({
      token: process.env.QSTASH_TOKEN!,
      url: process.env.QSTASH_URL, // Optional: use custom URL if provided
    })
  : null;

/**
 * Enqueue a push notification job
 */
export async function enqueueNotification(data: {
  userId: string;
  passId: string;
  title: string;
  body: string;
  link?: string;
}) {
  if (!qstash) {
    throw new Error("QStash is not configured. Please set QSTASH_TOKEN environment variable.");
  }

  const workerUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000'}/api/qstash-worker`;
  
  if (!workerUrl || workerUrl.includes('localhost')) {
    console.warn("APP_URL not set properly. QStash worker may not work in production.");
  }

  await qstash.publishJSON({
    url: workerUrl,
    body: data,
    // Optional: Add delay, retries, etc.
    // delay: 5, // Delay 5 seconds
    // retries: 3, // Retry 3 times on failure
  });

  return { success: true };
}

