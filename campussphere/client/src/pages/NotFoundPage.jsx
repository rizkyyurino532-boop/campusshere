import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <EmptyState
      icon="🧭"
      title="404 — Halaman Tidak Ditemukan"
      description="Alamat URL yang Anda tuju tidak tersedia di CampusSphere Institut Teknologi Indonesia."
      actionLabel="Kembali ke Beranda Kampus"
      onAction={() => navigate('/')}
    />
  );
}
