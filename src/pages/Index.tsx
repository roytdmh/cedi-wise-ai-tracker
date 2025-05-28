
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BudgetTracker from '@/components/BudgetTracker';
import ExchangeRates from '@/components/ExchangeRates';
import PriceTracker from '@/components/PriceTracker';
import { Wallet, TrendingUp, ShoppingCart } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-3 rounded-xl shadow-lg">
              <Wallet className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            AI Budget Tracker
          </h1>
          <p className="text-gray-600 text-lg">
            Master your finances with intelligent budgeting and real-time market insights
          </p>
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
