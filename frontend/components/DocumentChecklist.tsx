'use client';

import { CheckCircle2, Circle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  completed: boolean;
}

interface DocumentChecklistProps {
  items: ChecklistItem[];
}

export default function DocumentChecklist({
  items,
}: DocumentChecklistProps) {
  const completedCount = items.filter((item) => item.completed).length;
  const totalRequired = items.filter((item) => item.required).length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Progression</h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${(completedCount / totalRequired) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            {completedCount}/{totalRequired}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            {item.completed ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-border shrink-0" />
            )}
            <span className={`text-xs ${item.completed ? 'text-green-600 dark:text-green-400 line-through' : 'text-muted-foreground'}`}>
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
