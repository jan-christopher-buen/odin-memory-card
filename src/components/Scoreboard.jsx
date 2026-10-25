export default function Scoreboard({ score, best }) {
  return (
    <dl className="scoreboard" aria-label="Scores">
      <div>
        <dt>Current score</dt>
        <dd>
          {score}
          <span> / 12</span>
        </dd>
      </div>
      <div>
        <dt>Best score</dt>
        <dd>
          {best}
          <span> / 12</span>
        </dd>
      </div>
    </dl>
  )
}
