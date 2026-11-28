# Firebase chess setup

1. Enable Authentication Email/Password in Firebase Console.
2. Create Cloud Firestore Standard in production mode. Choose a region near users (Mumbai if available).
3. Copy the repository root firestore.rules into Firestore > Rules, then Publish. No open test rules.
4. Open the hosted /chess route and create two separate email/password accounts. Test create, invite, join, legal moves, resignation, sign-out and history after sign-in on a second device.

New games (both online and same-device) require sign-in and use Firestore transactions. Both participants query their own history. The older browser-local archive remains replayable/exportable but is not automatically uploaded. Invitation links contain a random ID; signed-in users with a waiting-room ID may join. Finished games are not deletable by the client. Rules protect participant identity, enforce alternating append-only move history, and restrict results. Chess rules are client validated; this is not server-authoritative or suitable for ranked play. No other site module is migrated yet. Firebase client SDK is loaded from Google's CDN, so npm lockfile stays unchanged. Firestore rules must be deployed separately; GitHub Pages deployment does not deploy them.
