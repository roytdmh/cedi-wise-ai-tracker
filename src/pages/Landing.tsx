import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsletterSignupDialog } from "@/components/NewsletterSignupDialog";
import { BarChart3, BadgeCent, TrendingUp, Shield, Brain, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAccess } from "@/contexts/AccessContext";

export default function Landing() {
  const navigate = useNavigate();
  const { setAccessLevel } = useAccess();

  const handleDemoAccess = () => {
    setAccessLevel('demo');
    navigate('/app?access=demo');
  };

  const handleFullAccess = (onSuccess?: () => void) => {
    setAccessLevel('full');
    if (onSuccess) {
      onSuccess();
    } else {
      navigate('/app?access=full');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BadgeCent className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CediWise</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleDemoAccess}>
              View Demo
            </Button>
            <NewsletterSignupDialog onSuccess={() => handleFullAccess()}>
              <Button>Try for Free</Button>
            </NewsletterSignupDialog>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Smart Financial Tracking with AI
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Take control of your finances with CediWise - the AI-powered budget tracker that helps you make smarter financial decisions with real-time insights and personalized recommendations.
        </p>
        <div className="flex gap-4 justify-center">
          <NewsletterSignupDialog onSuccess={() => handleFullAccess()}>
            <Button size="lg" className="px-8">
              Get Early Access
            </Button>
          </NewsletterSignupDialog>
          <Button size="lg" variant="outline" className="px-8" onClick={handleDemoAccess}>
            View Demo
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to manage your finances
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Brain className="h-12 w-12 text-primary mb-4" />
              <CardTitle>AI Financial Advisor</CardTitle>
              <CardDescription>
                Get personalized financial advice and insights powered by artificial intelligence
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Smart Budget Tracking</CardTitle>
              <CardDescription>
                Track your income and expenses with intelligent categorization and real-time analysis
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Price & Exchange Tracking</CardTitle>
              <CardDescription>
                Monitor price trends and exchange rates to make informed financial decisions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Financial Health Score</CardTitle>
              <CardDescription>
                Get a comprehensive health score for your finances with actionable recommendations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Budget History</CardTitle>
              <CardDescription>
                Save and compare different budget scenarios to find what works best for you
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BadgeCent className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Multi-Currency Support</CardTitle>
              <CardDescription>
                Work with multiple currencies and get real-time exchange rate updates
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already making smarter financial decisions with CediWise.
          </p>
          <NewsletterSignupDialog onSuccess={() => handleFullAccess()}>
            <Button size="lg" className="px-8">
              Get Started for Free
            </Button>
          </NewsletterSignupDialog>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 CediWise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}