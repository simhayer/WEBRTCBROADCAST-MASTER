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
  // Uncomment and replace the above with the following if using dynamic ICE servers
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
  // ],
};

async function fetchIceServers() {
  try {
    const response = await fetch(
      "https://wobble.metered.live/api/v1/turn/credentials?apiKey=435f246f87361e4cd9a03f0224e9f2cef837"
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch ICE servers: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching ICE servers:", error);
    return configurationPeerConnection.iceServers; // Fallback to static configuration
  }
}

const offerSdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

const addTransceiverConstraints = { direction: "recvonly" };

window.onload = () => {
  showList();
};

let peer;
let broadcast_id = "";
let consumer_id = "";
let localCandidates = [];
let remoteCandidates = [];
let socket_id;

async function watch(e) {
  broadcast_id = e.getAttribute("data");
  await createPeer();
  document.getElementById("text-container").innerHTML =
    "Streaming on id:" + broadcast_id;
}

async function showList() {
  const data = await axios.get("/list-broadcast");
  let html = `<ul style="list-style-type: none;">`;
  data.data.forEach((e) => {
    html += `<li style="margin-top:4px;">
        <button data='${e}' id='view-${e}' onClick="watch(this)">Watch ${e}</button>
      </li>`;
  });
  html += "</ul>";
  document.getElementById("list-container").innerHTML += html;
}

async function createPeer() {
  localCandidates = [];
  remoteCandidates = [];

  if (peer != null && peer != undefined) {
    return handleNegotiationNeededEvent(peer);
  }

  //const iceServers = await fetchIceServers();

  const configuration = {
    iceServers: configurationPeerConnection.iceServers,
  };

  peer = new RTCPeerConnection(configuration);

  peer.addTransceiver("video", addTransceiverConstraints);
  peer.addTransceiver("audio", addTransceiverConstraints);

  peer.ontrack = handleTrackEvent;

  iceCandidate();

  peer.onnegotiationneeded = async () =>
    await handleNegotiationNeededEvent(peer);

  return peer;
}

async function handleNegotiationNeededEvent(peer) {
  try {
    const offer = await peer.createOffer(offerSdpConstraints);
    await peer.setLocalDescription(offer);

    const payload = {
      sdp: peer.localDescription,
      broadcast_id: broadcast_id,
      socket_id: socket_id,
    };

    const { data } = await axios.post("/consumer", payload);
    console.log(data.message);
    consumer_id = data.data.id;

    const desc = new RTCSessionDescription(data.data.sdp);
    await peer.setRemoteDescription(desc).catch((e) => console.log(e));

    // send local candidates to the server
    localCandidates.forEach((e) => {
      socket.emit("add-candidate-consumer", {
        id: consumer_id,
        candidate: e,
      });
    });

    // add remote candidates to the local peer
    remoteCandidates.forEach((e) => {
      peer.addIceCandidate(new RTCIceCandidate(e));
    });
  } catch (error) {
    console.error("Error during negotiation:", error);
  }
}

function handleTrackEvent(e) {
  console.log(e.streams[0]);
  document.getElementById("video").srcObject = e.streams[0];
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
    } catch (error) {
      console.error("Error during ICE connection state change:", error);
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
