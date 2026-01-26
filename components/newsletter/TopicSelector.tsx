interface TopicSelectorProps {
  selectedTopics: {
    productivity: boolean
    ai: boolean
    marketing: boolean
  }
  onChange: (topics: { productivity: boolean; ai: boolean; marketing: boolean }) => void
}

export default function TopicSelector({ selectedTopics, onChange }: TopicSelectorProps) {
  const handleTopicChange = (topic: 'productivity' | 'ai' | 'marketing') => {
    onChange({
      ...selectedTopics,
      [topic]: !selectedTopics[topic],
    })
  }

  const topics = [
    {
      id: 'productivity',
      name: 'Productivity & Task Management',
      description: 'Tips on staying productive, using Taskitos, and time management strategies',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: 'ai',
      name: 'AI Tools & Integration',
      description: 'AI-powered workflows, tools I use, and practical AI implementation tips',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'marketing',
      name: 'SaaS Marketing & Growth',
      description: 'Product development, growth strategies, and lessons from building Taskitos & ExpandNote',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        What topics interest you? (Select all that apply)
      </label>

      {topics.map((topic) => (
        <label
          key={topic.id}
          className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedTopics[topic.id as keyof typeof selectedTopics]
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <input
            type="checkbox"
            checked={selectedTopics[topic.id as keyof typeof selectedTopics]}
            onChange={() => handleTopicChange(topic.id as 'productivity' | 'ai' | 'marketing')}
            className="mt-1 mr-4 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div className="text-primary-600 dark:text-primary-400 mr-2">
                {topic.icon}
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {topic.name}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {topic.description}
            </p>
          </div>
        </label>
      ))}

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Select at least one topic to continue
      </p>
    </div>
  )
}
