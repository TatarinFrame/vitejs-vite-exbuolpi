import { http } from "./http";
import { roomsPayload } from "../mocks/data";

export async function fetchRooms(page = 1): Promise<RoomsResponseDto> {
  try {
    const { data } = await http.get<RoomsResponseDto>("/rooms", { params: { page } });
    if (data && Array.isArray(data.items)) return data;
    console.warn("/api/rooms вернул не JSON — используются локальные данные");
  } catch (e) {
    console.warn("/api/rooms недоступен — используются локальные данные", e);
  }
  return { ...roomsPayload, page };
}