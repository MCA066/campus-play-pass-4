# CampusPlay online chess
- Chess rules: chess.js 1.4.0 (BSD-2-Clause), loaded from jsDelivr.
- Network: PeerJS 1.5.5 (MIT), loaded from jsDelivr; default public PeerServer for signaling.
- Rooms are private by unguessable invite, not authenticated. Host validates moves, sends authoritative move history; this is not an anti-cheat system. Both peers must be online. Network/firewall restrictions may prevent WebRTC.
- Each accepted game state is saved independently on both browsers that receive it. LocalStorage is not a database and is not synced. PGN exports are available. Clearing storage loses history; the host and guest may differ if disconnected before a final update. 
- No forced time control or ratings. Chess.js draw detection is automatic in this casual mode.
- Future production work: authenticated accounts, server-authoritative move validation and durable per-account game records, TURN relay, time controls and reconnect handling.
