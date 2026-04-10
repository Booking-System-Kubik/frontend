import { toast } from "sonner";

export const showErrorToast = (message: string, title?: string) => {
  // Отключено по требованию: не показывать тосты ошибок
  void message;
  void title;
};

/**
 * Показать успешное уведомление через toast
 */
export const showSuccessToast = (message: string, title?: string) => {
  toast.success(title || "Успешно", {
    description: message,
    duration: 3000,
  });
};

/**
 * Показать информационное уведомление через toast
 */
export const showInfoToast = (message: string, title?: string) => {
  toast.info(title || "Информация", {
    description: message,
    duration: 4000,
  });
};

