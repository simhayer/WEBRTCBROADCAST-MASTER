const configurationPeerConnection = {
  iceServers: [
    {
      urls: "stun:147.182.214.128:3478",
    },
    {
      urls: "stun:147.182.214.128:3478",
      username: "user1",
      credential: "key1",
    },
  ],
  // iceServers: [
  //   {
  //     urls: "stun:stun.relay.metered.ca:80",
  //   },
  //   {
  //     urls: "turn:global.relay.metered.ca:80",
  //     username: "aca60fb4568ea274f8245009",
  //     credential: "Zi/jzkiJuI2fmwLx",
  //   },
  //   {
  //     urls: "turn:global.relay.metered.ca:80?transport=tcp",
  //     username: "aca60fb4568ea274f8245009",
  //     credential: "Zi/jzkiJuI2fmwLx",
  //   },
  //   {
  //     urls: "turn:global.relay.metered.ca:443",
  //     username: "aca60fb4568ea274f8245009",
  //     credential: "Zi/jzkiJuI2fmwLx",
  //   },
  //   {
  //     urls: "turns:global.relay.metered.ca:443?transport=tcp",
  //     username: "aca60fb4568ea274f8245009",
  //     credential: "Zi/jzkiJuI2fmwLx",
  //   },
  //],
};

const apiKey = "435f246f87361e4cd9a03f0224e9f2cef837";
const iceServersUrl = `https://wobble.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`;

const offerSdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

const mediaConstraints = {
  video: true,
  audio: false,
};

let broadcast_id;
let localCandidates = [];
let remoteCandidates = [];
let peer;
let socket_id;

window.onload = () => {
  document.getElementById("my-button").onclick = () => {
    init();
  };
};

async function init() {
  try {
    // const response = await fetch(iceServersUrl);
    // if (!response.ok) {
    //   throw new Error(`Failed to fetch ICE servers: ${response.statusText}`);
    // }
    // const iceServers = await response.json();
    console.log("heree");
    const configurationPeerConnection = {
      iceServers: configurationPeerConnection,
    };

    const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    document.getElementById("video").srcObject = stream;
    peer = await createPeer(configurationPeerConnection);
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}

async function createPeer(configurationPeerConnection) {
  try {
    peer = new RTCPeerConnection(configurationPeerConnection);
    localCandidates = [];
    remoteCandidates = [];
    iceCandidate();
    peer.onnegotiationneeded = async () =>
      await handleNegotiationNeededEvent(peer);
    return peer;
  } catch (error) {
    console.error("Error creating peer connection:", error);
  }
}

async function handleNegotiationNeededEvent(peer) {
  try {
    const offer = await peer.createOffer(offerSdpConstraints);
    await peer.setLocalDescription(offer);

    const payload = {
      sdp: peer.localDescription,
      socket_id: socket_id,
    };

    console.log("Send socket id:", socket_id);

    const { data } = await axios.post("/broadcast", payload);
    console.log(data.message);
    const desc = new RTCSessionDescription(data.data.sdp);
    broadcast_id = data.data.id;
    document.getElementById("text-container").innerHTML =
      "Streaming id: " + broadcast_id;
    await peer.setRemoteDescription(desc).catch((e) => console.log(e));

    // add local candidate to server
    localCandidates.forEach((e) => {
      socket.emit("add-candidate-broadcast", {
        id: broadcast_id,
        candidate: e,
      });
    });

    // add remote candidate to local
    remoteCandidates.forEach((e) => {
      peer.addIceCandidate(new RTCIceCandidate(e));
    });
  } catch (error) {
    console.error("Error handling negotiation needed event:", error);
  }
}

function iceCandidate() {
  peer.onicecandidate = (e) => {
    if (!e || !e.candidate) return;
    const candidate = {
      candidate: String(e.candidate.candidate),
      sdpMid: String(e.candidate.sdpMid),
      sdpMLineIndex: e.candidate.sdpMLineIndex,
    };
    localCandidates.push(candidate);
  };

  peer.onconnectionstatechange = (e) => {
    console.log("Connection state change:", e);
  };

  peer.onicecandidateerror = (e) => {
    console.error("ICE candidate error:", e);
  };

  peer.oniceconnectionstatechange = (e) => {
    try {
      const connectionStatus = peer.connectionState;
      if (["disconnected", "failed", "closed"].includes(connectionStatus)) {
        console.log("Connection state:", connectionStatus);
      } else {
        console.log("Connection state:", connectionStatus);
      }
    } catch (e) {
      console.error("Error during ICE connection state change:", e);
    }
  };
}

// -----------------------------------------------------------------------------

const socket = io(Config.host + ":" + Config.port);

socket.on("from-server", function (_socket_id) {
  socket_id = _socket_id;
  console.log("Connected with socket id:", socket_id);
});

socket.on("candidate-from-server", (data) => {
  remoteCandidates.push(data);
});
