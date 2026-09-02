type Props = { logs: string[]; onClear: () => void };

export function EventLog({ logs, onClear }: Props) {
  return <div className="logs"><div className="panel-title"><h2>Recent events</h2><button className="text-button" onClick={onClear}>Clear</button></div>{logs.length ? <ul>{logs.map((log, index) => <li key={`${log}-${index}`}>{log}</li>)}</ul> : <p className="subtle">No recent events.</p>}</div>;
}
