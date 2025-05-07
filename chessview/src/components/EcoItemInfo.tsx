import { ecoInfo } from '@/constants/ecoInfo';

interface EcoItemInfoProps {
  eco: string;
}

export default function EcoItemInfo({ eco }: EcoItemInfoProps) {
  const category = eco[0];
  const info = ecoInfo[category];

  if (!info) return null;

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold text-blue-800">
        {category} - {info.name}
      </h3>
      <p className="text-blue-600 mt-1">{info.description}</p>
    </div>
  );
} 