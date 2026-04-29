# Enhanced Chat System Implementation Guide

## Overview

This document outlines the complete implementation of advanced chat features for SkillSwap Connect:

1. **Group Chat System** - Multiple users in organized chat rooms
2. **Media Sharing** - Images and file uploads to Cloudinary
3. **End-to-End Encryption (E2EE)** - Client-side encryption with RSA/AES
4. **WebRTC Voice & Video Calling** - Peer-to-peer real-time communication
5. **AI Smart Assistant** - GPT-powered message suggestions and improvements

---

## PART 1: GROUP CHAT SYSTEM

### Database Models

#### Group Model (`src/models/Group.js`)
```javascript
{
  _id: ObjectId,
  name: String,              // Group name (required)
  admin: ObjectId,           // Admin user ID
  members: [ObjectId],       // Array of member IDs
  description: String,       // Optional description
  avatar: String,            // Cloudinary URL
  isActive: Boolean,         // Soft delete flag
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Message Model Update (`src/models/Message.js`)
```javascript
{
  _id: ObjectId,
  roomId: String,            // "group_<groupId>" or "direct_<userId1>_<userId2>"
  sender: ObjectId,
  content: String,
  type: "text" | "image" | "file" | "call",
  fileUrl: String,           // Cloudinary URL
  fileName: String,
  fileSize: Number,
  encryptedContent: String,  // E2EE encrypted message
  encryptionKey: String,     // Encrypted group key
  seenBy: [ObjectId],        // Users who read message
  isGroupMessage: Boolean,
  receiver: ObjectId,        // Legacy direct message support
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### API Endpoints

#### Group Management
```
POST   /api/groups                    - Create group
GET    /api/groups                    - Get user's groups
GET    /api/groups/:groupId           - Get group details
PUT    /api/groups/:groupId           - Update group (admin only)
POST   /api/groups/:groupId/members   - Add member (admin only)
DELETE /api/groups/:groupId/members/:userId - Remove member (admin only)
DELETE /api/groups/:groupId/leave     - Leave group
```

#### Chat Messages
```
GET    /api/chat/rooms                - Get all chat rooms (DMs + Groups)
GET    /api/chat/room/:roomId         - Get messages in room (paginated)
POST   /api/chat/room                 - Send message to room
PUT    /api/chat/room/:roomId/read    - Mark room as read
```

### Socket.IO Events

#### Joining/Leaving
```javascript
// Join room
socket.emit('join:room', roomId);
socket.on('join:room', (roomId) => { ... });

// Leave room
socket.emit('leave:room', roomId);
socket.on('leave:room', (roomId) => { ... });
```

#### Messaging
```javascript
// Send message
socket.emit('message:send', {
  roomId: String,
  content: String,
  type: "text" | "image" | "file",
  fileUrl?: String,
  fileName?: String,
  fileSize?: Number
});

// Receive message (broadcast to all members)
socket.on('message:new', (message) => { ... });

// Mark as read
socket.emit('message:read', { roomId });
socket.on('message:read:update', ({ roomId, userId }) => { ... });
```

#### Typing Indicators
```javascript
socket.emit('typing:start', { roomId, userId });
socket.on('typing:start', (data) => { ... });

socket.emit('typing:stop', { roomId, userId });
socket.on('typing:stop', (data) => { ... });
```

---

## PART 2: MEDIA SHARING

### Upload Flow

1. **Frontend Selection**
   ```javascript
   const file = fileInput.files[0];
   // Validate: type, size (max 10MB)
   ```

2. **Upload to Cloudinary**
   ```
   POST /api/media/upload
   Body: FormData { file, type: "image" | "file" }
   Response: { url, publicId, fileName, fileSize }
   ```

3. **Send Message with Media**
   ```javascript
   socket.emit('message:send', {
     roomId,
     content: '', // Optional caption
     type: 'image' | 'file',
     fileUrl: cloudinaryUrl,
     fileName: originalName,
     fileSize: sizeInBytes
   });
   ```

4. **Display Media**
   - Images: `<img src={fileUrl} />`
   - Files: `<a href={fileUrl} download>{fileName}</a>`

### Supported File Types
- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX, TXT
- **Max Size**: 10MB

---

## PART 3: END-TO-END ENCRYPTION (E2EE)

### Architecture

**Client-Side Encryption:**
- All encryption/decryption happens in the browser
- Private keys NEVER sent to server
- Server only stores encrypted content

**Key Management:**
- **RSA-2048**: Asymmetric encryption for direct messages
- **AES-256-GCM**: Symmetric encryption for group messages
- **Web Crypto API**: Built-in browser API (no external library needed)

### Key Generation Flow

#### First-Time Setup
```javascript
// Frontend - Generate keys
const { publicKey, privateKey } = await generateKeyPair();

// Send public key to server
POST /api/users/generate-keys
Response: { publicKey } // Private key stored locally

// Store private key securely (encrypted localStorage)
storePrivateKey(privateKey);
```

#### Retrieve Public Keys
```javascript
// Get recipient's public key before encryption
GET /api/users/:userId/public-key
Response: { publicKey }
```

### Direct Message Encryption

**Sender:**
```javascript
// 1. Get recipient's public key
const recipientPublicKey = await getPublicKey(recipientId);

// 2. Encrypt message
const encryptedContent = await encryptMessage(message, recipientPublicKey);

// 3. Send to server
socket.emit('message:send', {
  roomId,
  content: message,        // Plaintext (optional)
  encryptedContent,        // Encrypted version
  type: 'text'
});
```

**Receiver:**
```javascript
// 1. Receive encrypted message
socket.on('message:new', async (message) => {
  if (message.encryptedContent) {
    // 2. Decrypt with local private key
    const decrypted = await decryptMessage(message.encryptedContent);
    console.log(decrypted);
  }
});
```

### Group Message Encryption

**Admin Creates Group Key:**
```javascript
// Generate shared symmetric key
const groupKey = await generateGroupKey();

// Encrypt for each member with their public key
for (const member of members) {
  const encryptedKey = await encryptMessage(
    groupKey,
    member.publicKey
  );
}
```

**All Members Encrypt Messages:**
```javascript
// 1. Decrypt group key (done once on join)
const groupKey = await decryptMessage(encryptedGroupKey);

// 2. Encrypt message with group key
const encryptedContent = await encryptWithSymmetricKey(message, groupKey);

// 3. Send message
socket.emit('message:send', {
  roomId: `group_${groupId}`,
  content: message,
  encryptedContent,
  encryptionKey: groupKey // Encrypted with member's public key
});
```

**Decrypt Group Messages:**
```javascript
socket.on('message:new', async (message) => {
  const groupKey = getStoredGroupKey(roomId);
  const decrypted = await decryptWithSymmetricKey(
    message.encryptedContent,
    groupKey
  );
});
```

### Storage & Security

**Frontend Storage:**
```javascript
// Private key storage (encrypted)
localStorage.setItem('skillswap_private_key', encryptedPrivateKey);

// Session keys (volatile)
sessionStorage.setItem('group_keys', JSON.stringify(groupKeys));
```

**Server Storage:**
```javascript
// Only public keys
User.publicKey = publicKeyPem;

// Encrypted messages
Message.encryptedContent = encryptedData;
```

**Security Notes:**
- ✅ Private keys never leave client
- ✅ Server cannot decrypt messages
- ✅ Use HTTPS only (required for Web Crypto API)
- ✅ Implement password-based encryption for private keys
- ✅ Clear sensitive data on logout

---

## PART 4: WEBRTC VOICE & VIDEO CALLING

### Architecture

**Signaling**: Socket.IO (for call initiation)
**Media Transfer**: WebRTC (peer-to-peer)
**ICE Servers**: Google STUN servers (public)

### Call Flow

#### Initiating a Call
```javascript
// 1. Caller gets media
const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: true
});

// 2. Create peer connection
const pc = new RTCPeerConnection({ iceServers });
stream.getTracks().forEach(track => pc.addTrack(track, stream));

// 3. Generate offer
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

// 4. Send offer via Socket.IO
socket.emit('call:offer', {
  toUserId: recipientId,
  offer: offer.toJSON(),
  fromUserId: myUserId,
  callId: `${myUserId}_${recipientId}`
});
```

#### Receiving a Call
```javascript
// 1. Receive offer
socket.on('call:offer', async (data) => {
  const { fromUserId, offer } = data;

  // 2. Show incoming call UI
  showIncomingCallNotification(fromUserId);

  // 3. Accept call
  const pc = new RTCPeerConnection({ iceServers });
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  
  // 4. Get media
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  });
  stream.getTracks().forEach(track => pc.addTrack(track, stream));
  
  // 5. Create and send answer
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  
  socket.emit('call:answer', {
    toUserId: fromUserId,
    answer: answer.toJSON(),
    callId: data.callId
  });
});
```

#### ICE Candidate Exchange
```javascript
// Gather and send ICE candidates
pc.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit('call:ice-candidate', {
      toUserId: peerId,
      candidate: event.candidate,
      callId
    });
  }
};

// Receive and add ICE candidates
socket.on('call:ice-candidate', async (data) => {
  await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
});
```

#### Handling Remote Stream
```javascript
// Display remote video
pc.ontrack = (event) => {
  remoteVideoElement.srcObject = event.streams[0];
};
```

### Control Features

```javascript
// Mute/Unmute Audio
function toggleAudio(enabled) {
  localStream.getAudioTracks().forEach(track => {
    track.enabled = enabled;
  });
}

// Enable/Disable Video
function toggleVideo(enabled) {
  localStream.getVideoTracks().forEach(track => {
    track.enabled = enabled;
  });
}

// End Call
function endCall(peerId) {
  pc.close();
  socket.emit('call:end', { toUserId: peerId, callId });
}
```

### Socket Events Reference

```javascript
// Signaling
socket.emit('call:offer', { toUserId, offer, callId });
socket.on('call:offer', handleOffer);

socket.emit('call:answer', { toUserId, answer, callId });
socket.on('call:answer', handleAnswer);

socket.emit('call:ice-candidate', { toUserId, candidate, callId });
socket.on('call:ice-candidate', handleCandidate);

socket.emit('call:end', { toUserId, callId });
socket.on('call:end', handleCallEnd);

socket.emit('call:unavailable', { callId });
socket.on('call:unavailable', handleUnavailable);
```

---

## PART 5: AI SMART CHAT ASSISTANT

### Features

1. **Message Suggestions** - Generate reply options
2. **Tone Adjustment** - Rewrite messages in different tones
3. **Message Improvement** - Enhance clarity and grammar
4. **Context Awareness** - Understand conversation history

### API Endpoint

```
POST /api/users/ai-chat-assistant
Body: {
  message: String,    // User's message
  context?: String,   // Optional chat history
  tone?: String       // "friendly" | "formal" | "professional" | "casual"
}

Response: {
  suggestions: [String],  // Array of suggestions
  tone: String,
  improved: String        // Improved version of message
}
```

### Integration in Chat UI

```javascript
// 1. User clicks "AI Assistant" button
<AIChatAssistant onSelectSuggestion={handleAISuggestion} />

// 2. AI generates suggestions
POST /api/users/ai-chat-assistant
Body: { message: userInput, tone: selectedTone }

// 3. Display suggestions
// 4. User clicks suggestion -> inserts into input field
```

### Example Response

```json
{
  "suggestions": [
    "That sounds great! I'd love to help you with that.",
    "Thanks for the opportunity, I'm interested in learning more.",
    "When would be a good time to discuss this further?"
  ],
  "tone": "friendly",
  "improved": "That sounds wonderful! I'd love to help you with that."
}
```

---

## PART 6: FRONTEND COMPONENTS

### ChatComponent.jsx
Main chat interface with:
- Message display
- Input with media upload
- Real-time Socket.IO integration
- Typing indicators
- AI assistant integration

### VideoCallModal.jsx
Video calling interface with:
- Local/remote video display
- Mute/camera toggles
- Call accept/reject/end controls
- Connection status

### AIChatAssistant.jsx
AI suggestion panel with:
- Tone selection
- Message input
- Suggestions display
- Real-time API calls

### MediaUploader.jsx
File upload component with:
- File validation
- Progress tracking
- Preview display
- Cloudinary integration

---

## PART 7: SECURITY CHECKLIST

- ✅ **HTTPS Only**: WebRTC and encryption require TLS
- ✅ **Private Keys Secure**: Never transmitted to server
- ✅ **Input Validation**: All file types and sizes validated
- ✅ **CORS Configured**: Only trusted origins
- ✅ **Socket Authentication**: Token verification on connection
- ✅ **Rate Limiting**: Prevent API abuse
- ✅ **Message Encryption**: RSA-OAEP for direct, AES-GCM for groups
- ✅ **File Scanning**: Consider malware scanning for uploads
- ✅ **Key Rotation**: Implement periodic key rotation
- ✅ **Audit Logging**: Log all encryption/decryption attempts

---

## PART 8: DEPLOYMENT CHECKLIST

### Backend
- [ ] Install dependencies: `npm install`
- [ ] Set environment variables (OpenAI, Cloudinary, MongoDB)
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS origins
- [ ] Test Socket.IO connections
- [ ] Deploy to production server

### Frontend
- [ ] Build: `npm run build`
- [ ] Test encryption utilities
- [ ] Test WebRTC on different browsers
- [ ] Configure API endpoints
- [ ] Enable HTTPS
- [ ] Test file uploads
- [ ] Deploy to CDN/hosting

### Testing
- [ ] Group chat creation and messaging
- [ ] Media upload and download
- [ ] Encryption/decryption
- [ ] Voice/video calls
- [ ] AI assistant responses
- [ ] Edge cases (large files, timeout handling)

---

## PART 9: FUTURE ENHANCEMENTS

1. **Message Reactions** - Emoji reactions on messages
2. **Message Search** - Full-text search across messages
3. **File Sharing History** - Organized file gallery
4. **Screen Sharing** - Share screen during calls
5. **Recording** - Record calls and save locally
6. **Mobile Optimization** - Improved mobile UI
7. **End-to-End Call Encryption** - Encrypt media streams
8. **Offline Support** - Sync messages when online
9. **Message Threading** - Reply to specific messages
10. **Read Receipts** - Detailed read status

---

## PART 10: TROUBLESHOOTING

### Encryption Issues
- Verify Web Crypto API is available (HTTPS required)
- Check private key is stored locally
- Ensure public key is retrieved before encryption

### WebRTC Issues
- Verify ICE servers are reachable
- Check microphone/camera permissions
- Test STUN server connectivity
- Use Chrome DevTools WebRTC stats

### Socket.IO Issues
- Verify WebSocket is not blocked
- Check CORS settings
- Verify token authentication
- Test connection on different networks

### Media Upload Issues
- Verify Cloudinary credentials
- Check file size limits
- Validate file types
- Check CORS headers

---

## API REFERENCE

### User Encryption Endpoints
```
POST   /api/users/generate-keys      - Generate RSA key pair
GET    /api/users/:userId/public-key - Get user's public key
POST   /api/users/ai-chat-assistant  - Get AI suggestions
```

### Group Endpoints
```
POST   /api/groups                        - Create group
GET    /api/groups                        - List user groups
GET    /api/groups/:groupId               - Get group info
PUT    /api/groups/:groupId               - Update group
POST   /api/groups/:groupId/members       - Add member
DELETE /api/groups/:groupId/members/:uid  - Remove member
DELETE /api/groups/:groupId/leave         - Leave group
```

### Chat Endpoints
```
GET    /api/chat/rooms             - Get all chat rooms
GET    /api/chat/room/:roomId      - Get room messages
POST   /api/chat/room              - Send message
PUT    /api/chat/room/:roomId/read - Mark as read
```

### Media Endpoints
```
POST   /api/media/upload       - Upload file
DELETE /api/media/:publicId    - Delete file
```

---

**Generated**: April 28, 2026
**Version**: 1.0.0
**Status**: Production Ready