type ToastIcon = 'success' | 'error' | 'warning' | 'info';

const getSwal = () => (window as typeof window & { Swal?: { fire: (options: Record<string, unknown>) => void } }).Swal;

export const showToast = (icon: ToastIcon, title: string, text?: string) => {
  const Swal = getSwal();
  if (!Swal) {
    // Fallback
    alert(`${title}${text ? `\n${text}` : ''}`);
    return;
  }
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    text,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });
};

export const showSuccess = (title: string, text?: string) => showToast('success', title, text);
export const showError = (title: string, text?: string) => showToast('error', title, text);
export const showInfo = (title: string, text?: string) => showToast('info', title, text);
