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
};

const offerSdpConstraints = {
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true,
  },
  optional: [],
};

module.exports = {
  configurationPeerConnection,
  offerSdpConstraints,
};
