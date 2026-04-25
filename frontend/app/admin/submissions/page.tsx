import SubmissionsManagement from '@/components/SubmissionsManagement';

export const metadata = {
  title: 'Dossiers | Admin Tarcom',
  description: 'Gérer les soumissions des candidats',
};

export default function SubmissionsPage() {
  return (
    <div className="flex-1 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <SubmissionsManagement />
    </div>
  );
}
