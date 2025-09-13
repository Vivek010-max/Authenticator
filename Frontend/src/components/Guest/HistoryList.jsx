import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { History } from 'lucide-react';

const HistoryList = ({ verificationHistory, getStatusIcon, getStatusColor }) => {
  if (!verificationHistory.length) return null;
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>Recent Verifications</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {verificationHistory.slice(0, 10).map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-2 py-2 rounded bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-sm"
            >
              <div className="flex items-center gap-2 w-2/3">
                {getStatusIcon(item.status)}
                <span
                  className="text-sm truncate font-medium"
                  title={item.filename}
                >
                  {item.filename}
                </span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                {item.status ? item.status.toUpperCase() : "UNKNOWN"}
              </span>
              {/* Optional: show timestamp (if your data has it) */}
              {/* {item.timestamp && (
                <span className="ml-3 text-xs text-gray-400">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              )} */}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryList;
