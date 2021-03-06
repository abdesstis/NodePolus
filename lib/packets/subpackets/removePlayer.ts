import {
  DisconnectReason,
  DisconnectReasons,
} from "../packetElements/disconnectReason";
import { PolusBuffer } from "../../util/polusBuffer";
import { roomCode } from "../packetElements/roomCode";
import { Room } from "../../util/room";
import { PacketHandler } from "../packet";

export interface RemovePlayerProperPacket {
  type: "RemovePlayer";
  RoomCode: string;
  PlayerClientID: number;
  HostClientID: number;
  DisconnectReason?: DisconnectReason;
}

export interface LateRejectionPacket {
  type: "LateRejection";
  RoomCode: string;
  PlayerClientID: bigint;
  DisconnectReason: DisconnectReasons.GameFull;
}

export type RemovePlayerPacket = RemovePlayerProperPacket | LateRejectionPacket;

export const RemovePlayer: PacketHandler<RemovePlayerPacket> = {
  parse(packet: PolusBuffer, room: Room): RemovePlayerPacket {
    if (packet.dataRemaining().length >= 8) {
      let code = roomCode.intToString(packet.read32());
      let PlayerClientID = packet.readU32();
      let HostClientID = packet.readU32();
      let DisconnectReasonts;
      if (packet.dataRemaining().length > 0) {
        DisconnectReasonts = new DisconnectReason(packet, room);
      }
      return {
        type: "RemovePlayer",
        RoomCode: code,
        PlayerClientID,
        HostClientID,
        DisconnectReason: DisconnectReasonts,
      };
    } else {
      let code = roomCode.intToString(packet.read32());
      let PlayerClientID = packet.readVarInt();
      packet.readU8();
      return {
        type: "LateRejection",
        RoomCode: code,
        PlayerClientID,
        DisconnectReason: DisconnectReasons.GameFull,
      };
    }
  },

  serialize(packet: RemovePlayerPacket) {
    if (packet.type == "RemovePlayer") {
      var buf = new PolusBuffer(12);
      buf.write32(roomCode.stringToInt(packet.RoomCode));
      buf.writeU32(packet.PlayerClientID);
      buf.writeU32(packet.HostClientID);
      if (packet.DisconnectReason) {
        buf.writeBytes(packet.DisconnectReason.serialize());
      }
      return buf;
    }
    if (packet.type == "LateRejection") {
      var buf = new PolusBuffer();
      buf.write32(roomCode.stringToInt(packet.RoomCode));
      buf.writeVarInt(packet.PlayerClientID);
      buf.writeU8(DisconnectReasons.GameFull);
      return buf;
    }

    throw new Error("Unknown packet type for RemovePlayer: " + packet);
  },
};
