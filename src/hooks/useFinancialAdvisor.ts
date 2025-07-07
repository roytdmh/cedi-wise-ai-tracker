import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

type SavedBudget = Tables<'budgets'>;

export const useFinancialAdvisor = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'failed'>('unknown');
  const [savedBudgets, setSavedBudgets] = useState<SavedBudget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<SavedBudget | null>(null);
  const [loadingBudgets, setLoadingBudgets] = useState(false);

  // Initialize chat session
  useEffect(() => {
    initializeChatSession();
    fetchSavedBudgets();
  }, []);

  const initializeChatSession = async () => {
    try {
      console.log('Initializing chat session...');
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          context_data: {},
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
        console.error('Connection test failed:', error);
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
    } catch (error: any) {
      console.error('Connection test error:', error);
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

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || loading) return;

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
          timestamp: new Date().toISOString()
        });

        const startTime = Date.now();
        const { data, error } = await supabase.functions.invoke('financial-advisor', {
          body: {
            message: userMessage,
            budgetData: selectedBudget ? {
              income: {
                amount: selectedBudget.income_amount,
                frequency: selectedBudget.income_frequency,
                currency: selectedBudget.income_currency
              },
              expenses: Array.isArray(selectedBudget.expenses) ? selectedBudget.expenses : []
            } : null,
            sessionId
          }
        });
        const responseTime = Date.now() - startTime;

        console.log(`Response received in ${responseTime}ms`);

        if (error) {
          console.error('Supabase function invocation error:', error);
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
      } catch (error: any) {
        console.error(`Message attempt ${attempt + 1} failed:`, error);
        
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

  const analyzeBudget = async (budget: SavedBudget) => {
    setSelectedBudget(budget);
    
    // Clear existing messages and start fresh analysis
    setMessages([]);
    setHealthScore(null);
    setRecommendations([]);
    
    // Send initial analysis message
    const analysisMessage = `Please provide a comprehensive financial analysis for the budget "${budget.name}". Include health score assessment, detailed expense breakdown, savings potential, and specific recommendations for improvement.`;
    
    await sendMessage(analysisMessage);

    toast({
      title: "Analysis Started",
      description: `Analyzing budget: ${budget.name}`,
      variant: "default"
    });
  };

  return {
    // State
    messages,
    loading,
    healthScore,
    recommendations,
    retryCount,
    lastError,
    isTestingConnection,
    connectionStatus,
    savedBudgets,
    selectedBudget,
    loadingBudgets,
    
    // Actions
    sendMessage,
    testConnection,
    analyzeBudget,
    fetchSavedBudgets
  };
};