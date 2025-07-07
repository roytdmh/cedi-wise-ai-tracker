import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  connectionStatus: 'unknown' | 'success' | 'failed';
  isTestingConnection: boolean;
  retryCount: number;
  onTestConnection: () => Promise<void>;
}

const ConnectionStatus = ({ 
  connectionStatus, 
  isTestingConnection, 
  retryCount, 
  onTestConnection 
}: ConnectionStatusProps) => {
  return (
    <Card className="shadow-lg border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-700">
          {connectionStatus === 'success' ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : connectionStatus === 'failed' ? (
            <WifiOff className="h-5 w-5 text-red-600" />
          ) : (
            <Wifi className="h-5 w-5 text-gray-400" />
          )}
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">AI Advisor:</span>
          <div className="flex items-center gap-2">
            {connectionStatus === 'success' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                Online
              </Badge>
            )}
            {connectionStatus === 'failed' && (
              <Badge variant="destructive">
                Offline
              </Badge>
            )}
            {connectionStatus === 'unknown' && (
              <Badge variant="outline">
                Unknown
              </Badge>
            )}
          </div>
        </div>
        <Button
          onClick={onTestConnection}
          disabled={isTestingConnection}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isTestingConnection ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
              Testing Connection...
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4 mr-2" />
              Test Connection
            </>
          )}
        </Button>
        {retryCount > 1 && (
          <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
            Connection issues detected. Try the test above to diagnose the problem.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionStatus;