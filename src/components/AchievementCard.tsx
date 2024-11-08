// components/AchievementCard.tsx

import { CheckCircle, Circle } from 'lucide-react' // Ícones para conquistas obtidas e não obtidas

interface AchievementCardProps {
  title: string
  description: string
  achieved: boolean
}

export default function AchievementCard({
  title,
  description,
  achieved,
}: AchievementCardProps) {
  return (
    <div
      className={`p-4 border ${achieved ? 'border-green-500' : 'border-gray-300'} rounded-lg shadow-md flex items-center space-x-4`}
    >
      <div className="text-2xl">
        {achieved ? (
          <CheckCircle className="text-green-500" />
        ) : (
          <Circle className="text-gray-500" />
        )}
      </div>
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}
