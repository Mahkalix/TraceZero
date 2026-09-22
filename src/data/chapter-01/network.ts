export type SessionEvent = {
  id: string;
  time: string;
  user: string;
  sessionId: string;
  device: string;
  ip: string;
  event: string;
};

export const sessionEvents: SessionEvent[] = [
  {
    id: "evt-001",
    time: "22:41:08",
    user: "judy.alvarez",
    sessionId: "S-4831",
    device: "JUDY-LAPTOP",
    ip: "10.24.16.12",
    event: "session.resume",
  },
  {
    id: "evt-002",
    time: "22:44:31",
    user: "judy.alvarez",
    sessionId: "S-4831",
    device: "UNKNOWN-WIN",
    ip: "198.51.100.73",
    event: "session.resume",
  },
  {
    id: "evt-003",
    time: "22:45:02",
    user: "judy.alvarez",
    sessionId: "S-4831",
    device: "UNKNOWN-WIN",
    ip: "198.51.100.73",
    event: "orion.export.download",
  },
];
