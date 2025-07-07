import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Brain, Send, MessageCircle, TrendingUp, AlertCircle, Lightbulb, BarChart3, Wifi, WifiOff, Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface FinancialAdvisorProps {
  budgetData?: any;
}

const FinancialAdvisor = ({ budgetData }: FinancialAdvisorProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'failed'>('unknown');
  const [savedBudgets, setSavedBudgets] = useState<any[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [loadingBudgets, setLoadingBudgets] = useState(false);

  // Initialize chat session
  useEffect(() => {
    initializeChatSession();
    fetchSavedBudgets();
  }, []);

  const fetchSavedBudgets = async () => {
    setLoadingBudgets(true);
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved budgets:', error);
        toast({
          title: "Error",
          description: "Failed to fetch saved budgets",
          variant: "destructive"
        });
        return;
      }

      setSavedBudgets(data || []);
    } catch (error) {
      console.error('Error in fetchSavedBudgets:', error);
    } finally {
      setLoadingBudgets(false);
    }
  };

  const analyzeBudget = async (budget: any) => {
    setSelectedBudget(budget);
    
    // Clear existing messages and start fresh analysis
    setMessages([]);
    setHealthScore(null);
    setRecommendations([]);
    
    // Transform budget data to match expected format
    const budgetDataForAnalysis = {
      income: {
        amount: budget.income_amount,
        frequency: budget.income_frequency,
        currency: budget.income_currency
      },
      expenses: budget.expenses
    };

    // Send initial analysis message
    const analysisMessage = `Please provide a comprehensive financial analysis for the budget "${budget.name}". Include health score assessment, detailed expense breakdown, savings potential, and specific recommendations for improvement.`;
    
    setInputMessage('');
    setLoading(true);

    // Add analysis request message to chat
    const newUserMessage: Message = {
      role: 'user',
      content: analysisMessage,
      timestamp: new Date().toISOString()
    };
    setMessages([newUserMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('financial-advisor', {
        body: {
          message: analysisMessage,
          budgetData: budgetDataForAnalysis,
          sessionId
        }
      });

      if (error) throw error;

      if (data.success) {
        const aiMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        };
        setMessages([newUserMessage, aiMessage]);

        // Update health score and recommendations if provided
        if (data.healthScore !== null) {
          setHealthScore(data.healthScore);
        }
        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }

        toast({
          title: "Analysis Complete",
          description: `Analyzed budget: ${budget.name}`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error analyzing budget:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the selected budget",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeChatSession = async () => {
    try {
      console.log('Initializing chat session...');
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          context_data: { budgetData },
          messages: []
        })
        .select('id')
        .single();

      if (error) {
        console.error('Chat session initialization error:', error);
        throw error;
      }
      console.log('Chat session initialized successfully:', data.id);
      setSessionId(data.id);
    } catch (error) {
      console.error('Error initializing chat session:', error);
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('unknown');
    
    try {
      console.log('Testing connection to financial advisor...');
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('financial-advisor', {
        body: {
          message: '__TEST_CONNECTION__',
          sessionId: null
        }
      });
      
      const responseTime = Date.now() - startTime;
      console.log(`Connection test completed in ${responseTime}ms`, { data, error });

      if (error) {
        console.error('Connection test failed:', {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        setConnectionStatus('failed');
        throw error;
      }

      if (data?.success) {
        console.log('Connection test successful');
        setConnectionStatus('success');
        toast({
          title: "Connection Test Successful",
          description: `AI advisor is working properly (${responseTime}ms response time)`,
          variant: "default"
        });
      } else {
        console.error('Connection test returned unsuccessful response:', data);
        setConnectionStatus('failed');
        throw new Error(data?.error || 'Unknown connection test failure');
      }
    } catch (error) {
      console.error('Connection test error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setConnectionStatus('failed');
      
      let errorMessage = 'Connection test failed';
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error - check your internet connection';
      } else if (error.message.includes('quota')) {
        errorMessage = 'AI service quota exceeded - try again later';
      } else if (error.message.includes('rate_limit')) {
        errorMessage = 'Rate limit reached - wait before testing again';
      }
      
      toast({
        title: "Connection Test Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Add user message to chat
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        console.log(`Sending message attempt ${attempt + 1}/${maxRetries}:`, {
          message: userMessage,
          sessionId,
          hasbudgetData: !!budgetData,
          timestamp: new Date().toISOString()
        });

        const startTime = Date.now();
        const { data, error } = await supabase.functions.invoke('financial-advisor', {
          body: {
            message: userMessage,
            budgetData,
            sessionId
          }
        });
        const responseTime = Date.now() - startTime;

        console.log(`Response received in ${responseTime}ms:`, {
          success: data?.success,
          hasResponse: !!data?.response,
          fallback: data?.fallback,
          errorType: data?.errorType,
          error: error?.message
        });

        if (error) {
          console.error('Supabase function invocation error:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }

        if (data.success) {
          const aiMessage: Message = {
            role: 'assistant',
            content: data.response,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, aiMessage]);

          // Update health score and recommendations if provided
          if (data.healthScore !== null) {
            setHealthScore(data.healthScore);
          }
          if (data.recommendations) {
            setRecommendations(data.recommendations);
          }
          
          // Reset retry count and error state on success
          setRetryCount(0);
          setLastError(null);
          setConnectionStatus('success');
          break; // Success, exit retry loop
        } else {
          throw new Error(data.error || 'Failed to get response');
        }
      } catch (error) {
        console.error(`Message attempt ${attempt + 1} failed:`, {
          error: error.message,
          attempt: attempt + 1,
          maxRetries,
          timestamp: new Date().toISOString()
        });
        
        attempt++;
        setLastError(error.message);
        setConnectionStatus('failed');
        
        // If this is not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // All retries failed, show error to user
        let errorTitle = "Error";
        let errorDescription = "Failed to get response from financial advisor";
        
        if (error.message.includes('quota') || error.message.includes('insufficient_quota')) {
          errorTitle = "Service Temporarily Unavailable";
          errorDescription = "AI service is at capacity. Please try again in a few minutes.";
        } else if (error.message.includes('rate_limit')) {
          errorTitle = "Rate Limited";
          errorDescription = "Please wait a moment before sending another message.";
        } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          errorTitle = "Connection Error";
          errorDescription = "Please check your internet connection and try again. Use the Test Connection button to diagnose issues.";
        } else if (error.message.includes('timeout')) {
          errorTitle = "Request Timeout";
          errorDescription = "The request took too long. Please try again with a shorter message.";
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive"
        });
        
        setRetryCount(prev => prev + 1);
      }
    }
    
    setLoading(false);
  };

  const suggestedQuestions = [
    "How can I improve my financial health score?",
    "What's the best way to save money in Ghana?",
    "Should I invest in foreign currency?",
    "How much should I set aside for emergencies?",
    "Help me optimize my budget categories",
    "What are some side income opportunities?"
  ];

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getHealthScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-4 w-4" />;
    if (score >= 60) return <BarChart3 className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Health Score */}
      <Card className="border-purple-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Brain className="h-5 w-5" />
            CediWise Financial Advisor
          </CardTitle>
          {healthScore !== null && (
            <div className="flex items-center gap-4 mt-2">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getHealthScoreColor(healthScore)}`}>
                {getHealthScoreIcon(healthScore)}
                <span className="font-semibold">Health Score: {healthScore}/100</span>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Service Status Alert */}
      {lastError && retryCount > 1 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {lastError.includes('quota') ? (
              <>
                <strong>Service temporarily at capacity.</strong> The AI advisor is experiencing high demand. 
                Basic financial guidance is still available through our fallback system.
              </>
            ) : lastError.includes('rate_limit') ? (
              <>
                <strong>Rate limit reached.</strong> Please wait a minute before sending another message.
              </>
            ) : (
              <>
                <strong>Connection issues detected.</strong> Please check your internet connection. 
                If the problem persists, try refreshing the page.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Financial Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <ScrollArea className="h-96 w-full border rounded-lg p-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Welcome to your Financial Advisor!</p>
                  <p>Ask me anything about budgeting, saving, investing, or financial planning.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Ask your financial question..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={loading}
              />
              <Button 
                onClick={sendMessage} 
                disabled={loading || !inputMessage.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar with Suggestions and Recommendations */}
        <div className="space-y-6">
          {/* Connection Status */}
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
                onClick={testConnection}
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
          {/* Suggested Questions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Lightbulb className="h-5 w-5" />
                Suggested Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left h-auto p-3 justify-start"
                  onClick={() => setInputMessage(question)}
                  disabled={loading}
                >
                  <span className="text-sm">{question}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Card className="shadow-lg border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <TrendingUp className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-emerald-50 rounded-lg">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-emerald-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saved Budgets */}
          <Card className="shadow-lg border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Folder className="h-5 w-5" />
                Saved Budgets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingBudgets ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading budgets...</p>
                </div>
              ) : savedBudgets.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No saved budgets found</p>
                  <p className="text-xs text-gray-400 mt-1">Create a budget in the Budget Tracker to get started</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedBudgets.map((budget) => (
                    <Button
                      key={budget.id}
                      variant="outline"
                      size="sm"
                      className={`w-full text-left h-auto p-3 justify-start ${
                        selectedBudget?.id === budget.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => analyzeBudget(budget)}
                      disabled={loading}
                    >
                      <div className="flex flex-col items-start w-full">
                        <span className="font-medium text-sm">{budget.name}</span>
                        <div className="flex justify-between w-full mt-1">
                          <span className="text-xs text-gray-500">
                            {budget.income_currency} {budget.income_amount}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(budget.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
              {selectedBudget && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">Analyzing: {selectedBudget.name}</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Income: {selectedBudget.income_currency} {selectedBudget.income_amount} ({selectedBudget.income_frequency})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinancialAdvisor;