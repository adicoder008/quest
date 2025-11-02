#!/usr/bin/env node
/**
 * Automated Local Video Rendering Script
 * Fetches quest data from Firebase and renders video in one command
 *
 * Usage: node scripts/autoRender.js <questId>
 */

const { spawn } = require('child_process');
// --- CHANGED: Use firebase-admin ---
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// --- CHANGED: Load your service account key ---
// Assumes this script is in /scripts and the key is in the project root
const serviceAccount = require('../serviceAccountKey.json');

// --- CHANGED: Initialize the Admin app ---
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // You can find this in your Firebase console if needed
  // databaseURL: 'https://onquest-bdc27.firebaseio.com' 
});

// --- CHANGED: Get Firestore from the admin app ---
const db = admin.firestore();

async function fetchQuestData(questId) {
  // --- CHANGED: Admin SDK syntax ---
  const questRef = db.collection('quest').doc(questId);
  const questSnap = await questRef.get();

  if (!questSnap.exists) {
    throw new Error(`Quest with ID ${questId} not found`);
  }

  const questData = questSnap.data();

  let userName = 'Traveler';
  let userProfilePic = '';

  if (questData.owner) {
    // --- CHANGED: Admin SDK syntax ---
    const userRef = db.collection('users').doc(questData.uid);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      const userData = userSnap.data();
      userName = userData.displayName || 'Traveler';
      userProfilePic = userData.photoURL || '';
    }
  }

  return {
    destination: questData.destination,
    userName: userName,
    userProfilePic: userProfilePic,
    coverImageUrl: questData.coverImageUrl || '',
    days: questData.itinerary?.days || [],
    questTitle: questData.title || `Quest to ${questData.destination}`
  };
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  const questId = process.argv[2];

  if (!questId) {
    console.error('❌ Error: Quest ID is required\n');
    console.log('Usage:');
    console.log('  node scripts/autoRender.js <questId>\n');
    console.log('Example:');
    console.log('  node scripts/autoRender.js abc123xyz\n');
    process.exit(1);
  }

  console.log('╔════════════════════════════════════════╗');
  console.log('║   🎬 OnQuest Auto Video Renderer      ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // Step 1: Fetch quest data
    console.log('📋 Step 1/3: Fetching quest data...');
    const questData = await fetchQuestData(questId);
    console.log(`✅ Quest: ${questData.destination} (${questData.days.length} days)\n`);

    // Step 2: Save props file
    console.log('💾 Step 2/3: Preparing render props...');
    const tempDir = path.join(process.cwd(), '.remotion-temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const propsPath = path.join(tempDir, `quest-${questId}-props.json`);
    fs.writeFileSync(propsPath, JSON.stringify(questData, null, 2));
    console.log(`✅ Props saved\n`);

    // Step 3: Render video
    console.log('🎬 Step 3/3: Rendering video...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const outputDir = path.join(process.cwd(), 'videos');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `quest-${questId}-${Date.now()}.mp4`);

    await runCommand('npx', [
      'remotion',
      'render',
      'remotion/Root.tsx',
      'QuestVideo',
      outputPath,
      `--props=${propsPath}`
    ]);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ VIDEO RENDERED SUCCESSFULLY! 🎉\n');
    console.log(`📹 Video saved to:`);
    console.log(`   ${outputPath}\n`);
    console.log(`📊 Stats:`);
    console.log(`   Destination: ${questData.destination}`);
    console.log(`   Days: ${questData.days.length}`);
    console.log(`   Activities: ${questData.days.reduce((sum, day) => sum + (day.activities?.length || 0), 0)}\n`);

    // Clean up temp file
    fs.unlinkSync(propsPath);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();