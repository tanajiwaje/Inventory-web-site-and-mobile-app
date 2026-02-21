declare global {
  interface Window {
    Swal?: {
      fire: (options: Record<string, unknown>) => Promise<{ isConfirmed?: boolean; value?: string }>;
    };
  }
}

export const notify = (icon: 'success' | 'error' | 'info' | 'warning', title: string, text?: string) => {
  if (!window.Swal) {
    alert(`${title}${text ? `\n${text}` : ''}`);
    return;
  }
  window.Swal.fire({
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
