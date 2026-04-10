import './ActivityFeed.css'

const ACTIVITY_ICONS = {
  approved: { icon: 'check_circle', color: 'primary' },
  edited: { icon: 'edit_note', color: 'secondary' },
  created: { icon: 'add_circle', color: 'primary' },
  commented: { icon: 'chat_bubble', color: 'tertiary' },
  rejected: { icon: 'cancel', color: 'error' },
  flagged: { icon: 'priority_high', color: 'error' },
  assigned: { icon: 'person_add', color: 'secondary' },
  default: { icon: 'history_edu', color: 'primary' }
}

function ActivityFeed({ activities, onViewAll }) {
  return (
    <div className="activity-feed">
      <h4 className="activity-feed__title">Recent Activity</h4>

      <div className="activity-feed__list">
        {activities.map((activity, index) => {
          const config = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.default
          const isLast = index === activities.length - 1

          return (
            <div key={activity.id || index} className="activity-feed__item">
              <div className="activity-feed__icon-wrapper">
                <div className={`activity-feed__icon activity-feed__icon--${config.color}`}>
                  <span className="material-symbols-outlined">{config.icon}</span>
                </div>
                {!isLast && <div className="activity-feed__line"></div>}
              </div>
              <div className="activity-feed__content">
                <p className="activity-feed__text">
                  <span className="activity-feed__actor">{activity.actor}</span>
                  {' '}{activity.action}
                </p>
                <span className="activity-feed__time">{activity.time}</span>
              </div>
            </div>
          )
        })}
      </div>

      {onViewAll && (
        <button className="activity-feed__view-all" onClick={onViewAll}>
          View All Logs
        </button>
      )}
    </div>
  )
}

export default ActivityFeed
