import Swal from 'sweetalert2';

export const notify = {
  success: (title: string, text?: string) => {
    Swal.fire({
      icon: 'success',
      title,
      text,
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      timerProgressBar: true,
      background: '#ffffff',
      color: '#0f172a',
    });
  },

  error: (title: string, text?: string) => {
    Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#2563eb',
      background: '#ffffff',
      color: '#0f172a',
    });
  },

  warning: (title: string, text?: string) => {
    Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonColor: '#2563eb',
      background: '#ffffff',
      color: '#0f172a',
    });
  },

  confirmDelete: async (title: string = 'Hapus Data?', text: string = 'Data yang dihapus tidak dapat dikembalikan!') => {
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: '#ffffff',
      color: '#0f172a',
    });
    return result.isConfirmed;
  },

  confirmAction: async (title: string, text: string, confirmBtnText: string = 'Ya, Lanjutkan') => {
    const result = await Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: confirmBtnText,
      cancelButtonText: 'Batal',
      background: '#ffffff',
      color: '#0f172a',
    });
    return result.isConfirmed;
  }
};
