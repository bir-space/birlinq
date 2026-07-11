export type MoveScenario =
  | "car_blocking"
  | "window_open"
  | "alarm_triggered"
  | "accident_urgent"
  | "custom_message"
  | "want_same_sticker";

export const MOVE_SCENARIOS: Array<{ value: MoveScenario; label: string }> = [
  { value: "car_blocking", label: "Ваш автомобиль блокирует проезд" },
  { value: "window_open", label: "У вас открыто окно" },
  { value: "alarm_triggered", label: "Сработала сигнализация" },
  { value: "accident_urgent", label: "Срочно: ДТП или повреждение" },
  { value: "custom_message", label: "Другое сообщение" },
  { value: "want_same_sticker", label: "Хочу такую же наклейку" },
];
