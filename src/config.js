const configurationPeerConnection = {
  iceServers: [
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:na.relay.metered.ca:80",
      username: "a9771e697028c08786af0d5e",
      credential: "YtkNt/ARwHi5hXLZ",
    },
    {
      urls: "turn:na.relay.metered.ca:80?transport=tcp",
      username: "a9771e697028c08786af0d5e",
      credential: "YtkNt/ARwHi5hXLZ",
    },
    {
      urls: "turn:na.relay.metered.ca:443",
      username: "a9771e697028c08786af0d5e",
      credential: "YtkNt/ARwHi5hXLZ",
    },
    {
      urls: "turns:na.relay.metered.ca:443?transport=tcp",
      username: "a9771e697028c08786af0d5e",
      credential: "YtkNt/ARwHi5hXLZ",
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
