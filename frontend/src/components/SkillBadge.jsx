const variants = {
  purple: 'bg-purple-900 text-purple-200',
  teal:   'bg-teal-900 text-teal-200',
  green:  'bg-green-900 text-green-300',
  red:    'bg-red-900 text-red-300',
  gray:   'bg-gray-700 text-gray-300',
}

export default function SkillBadge({ skill, variant = 'purple' }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}>
      {skill}
    </span>
  )
}