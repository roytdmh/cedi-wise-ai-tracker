
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BudgetTracker from '@/components/BudgetTracker';
import ExchangeRates from '@/components/ExchangeRates';
import PriceTracker from '@/components/PriceTracker';
import UserMenu from '@/components/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, TrendingUp, ShoppingCart, LogIn } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-3 rounded-xl shadow-lg mb-4 mx-auto w-fit">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600">Loading CediWise...</p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-emerald-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-4 rounded-xl shadow-lg">
                <Wallet className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
              CediWise
            </h1>
            <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto">
              Master your finances with intelligent budgeting, real-time market insights, and personalized financial advice
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Get Started
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/auth')}
                className="border-2 border-blue-200 hover:border-blue-300 px-8 py-6 text-lg rounded-xl"
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Feature Preview */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 max-w-4xl mx-auto">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                Why Choose CediWise?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-100 to-teal-100 p-4 rounded-xl mb-4 mx-auto w-fit">
                    <Wallet className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Smart Budgeting</h3>
                  <p className="text-gray-600 text-sm">Track income, expenses, and savings with intelligent insights</p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-100 to-teal-100 p-4 rounded-xl mb-4 mx-auto w-fit">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Live Market Data</h3>
                  <p className="text-gray-600 text-sm">Real-time exchange rates and price tracking</p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-100 to-teal-100 p-4 rounded-xl mb-4 mx-auto w-fit">
                    <ShoppingCart className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Price Intelligence</h3>
                  <p className="text-gray-600 text-sm">Compare wholesale and retail prices across markets</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with User Menu */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-3 rounded-xl shadow-lg">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                CediWise
              </h1>
              <p className="text-gray-600">
                Welcome back! Manage your finances intelligently
              </p>
            </div>
          </div>
          <UserMenu />
        </div>

        {/* Main Content */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <Tabs defaultValue="budget" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gradient-to-r from-blue-100 to-teal-100 p-1 rounded-xl">
              <TabsTrigger 
                value="budget" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <Wallet className="h-4 w-4" />
                Budget Tracker
              </TabsTrigger>
              <TabsTrigger 
                value="exchange" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <TrendingUp className="h-4 w-4" />
                Exchange Rates
              </TabsTrigger>
              <TabsTrigger 
                value="prices" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <ShoppingCart className="h-4 w-4" />
                Price Tracker
              </TabsTrigger>
            </TabsList>

            <TabsContent value="budget" className="mt-0">
              <BudgetTracker />
            </TabsContent>

            <TabsContent value="exchange" className="mt-0">
              <ExchangeRates />
            </TabsContent>

            <TabsContent value="prices" className="mt-0">
              <PriceTracker />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Index;
