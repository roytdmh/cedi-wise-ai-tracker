import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  loading: boolean;
}

const SuggestedQuestions = ({ onSelectQuestion, loading }: SuggestedQuestionsProps) => {
  const suggestedQuestions = [
    "How can I improve my financial health score?",
    "What's the best way to save money in Ghana?",
    "Should I invest in foreign currency?",
    "How much should I set aside for emergencies?",
    "Help me optimize my budget categories",
    "What are some side income opportunities?"
  ];

  return (
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
            className="w-full text-left h-auto p-3 justify-start hover-scale"
            onClick={() => onSelectQuestion(question)}
            disabled={loading}
          >
            <span className="text-sm">{question}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default SuggestedQuestions;