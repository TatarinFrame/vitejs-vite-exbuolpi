import ListAltOutlined from "@mui/icons-material/ListAltOutlined";
import EventNoteOutlined from "@mui/icons-material/EventNoteOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";

export const DEFAULT_NAV: NavItem[] = [
  { id: "catalog", label: "Каталог аудиторий", icon: ListAltOutlined },
  { id: "bookings", label: "Управление бронированием", icon: EventNoteOutlined },
  { id: "settings", label: "Настройки", icon: SettingsOutlined },
];