import { ChevronDown, ChevronUp } from 'lucide-react';
import { styles } from '@/components/styles';

// ---------------------------------------------------------------------------
// CollapsedText
// ---------------------------------------------------------------------------

export function CollapsedText({
  text,
  label,
  expanded,
}: {
  text: string;
  label: string;
  expanded: boolean;
}) {
  return (
    <div>
      <span className={styles.promptDisplay.label}>{label}</span>
      <pre
        className={styles.promptDisplay.preBlock}
        style={
          expanded
            ? undefined
            : ({
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              } as React.CSSProperties)
        }
      >
        {text}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CollapsedMessages
// ---------------------------------------------------------------------------

export function CollapsedMessages({
  messages,
  expanded,
}: {
  messages: { role: string; text: string }[];
  expanded: boolean;
}) {
  const preview = expanded ? messages : messages.slice(0, 2);
  return (
    <div>
      <span className={styles.promptDisplay.label}>Messages ({messages.length})</span>
      <div className="space-y-1">
        {preview.map((msg, idx) => (
          <div key={idx} className={styles.promptDisplay.messageItem}>
            <span className={styles.card.roleBadge}>{msg.role}</span>
            <span
              className="text-xs text-gray-700 font-mono min-w-0 wrap-break-word"
              style={
                expanded
                  ? undefined
                  : ({
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    } as React.CSSProperties)
              }
            >
              {msg.text}
            </span>
          </div>
        ))}
        {!expanded && messages.length > 2 && (
          <span className="text-xs text-gray-400">+{messages.length - 2} more</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ExpandToggleButton
// ---------------------------------------------------------------------------

export function ExpandToggleButton({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className={styles.card.toggleButton}>
      {expanded ? (
        <>
          <ChevronUp size={12} />
          Less
        </>
      ) : (
        <>
          <ChevronDown size={12} />
          More
        </>
      )}
    </button>
  );
}
