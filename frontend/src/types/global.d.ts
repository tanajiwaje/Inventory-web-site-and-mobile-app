export {};

declare global {
  interface Window {
    Swal?: {
      fire: (options: Record<string, unknown>) => Promise<{
        isConfirmed: boolean;
        value?: string;
      }>;
    };
    Chart?: {
      new: (ctx: HTMLCanvasElement, config: Record<string, unknown>) => {
        destroy: () => void;
      };
    };
  }
}
