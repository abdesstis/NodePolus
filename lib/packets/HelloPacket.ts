import PolusBuffer from '../util/PolusBuffer'
import { PacketHandler } from './Packet';

export interface HelloPacketData {
	HazelVersion: number,
	ClientVersion: number,
	Name: string
}

export interface HelloPacket {
	Nonce: number,
	Data: HelloPacketData
};

export const Hello: PacketHandler<HelloPacket> = {
	parse(packet: PolusBuffer): HelloPacket {
		return {
			Nonce: packet.readU16(true),
			Data: {
				HazelVersion: packet.readU8(),
				ClientVersion: packet.read32(),
				Name: packet.readString()
			}
		};
	},

	serialize(packet: HelloPacket): PolusBuffer {
		var buf = new PolusBuffer();
		buf.writeU16(packet.Nonce, true);
		buf.writeU8(packet.Data.HazelVersion);
		buf.write32(packet.Data.ClientVersion);
		buf.writeString(packet.Data.Name);
		return buf;
	}
}
