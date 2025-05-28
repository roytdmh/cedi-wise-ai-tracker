
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, TrendingUp, TrendingDown, Search, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PriceData {
  id: string;
  item: string;
  category: string;
  price: number;
  currency: string;
  change: number;
  unit: string;
  lastUpdated: string;
}

const PriceTracker = () => {
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState('Ghana');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);

  const countries = [
    { name: 'Ghana', currency: 'GHS', flag: '🇬🇭' },
    { name: 'Nigeria', currency: 'NGN', flag: '🇳🇬' },
    { name: 'United States', currency: 'USD', flag: '🇺🇸' },
    { name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
    { name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
  ];

  const categories = [
    'All', 'Food & Beverages', 'Transportation', 'Housing', 
    'Utilities', 'Healthcare', 'Education', 'Entertainment'
  ];

  // Mock price data
  const mockPricesData = {
    Ghana: [
      { id: '1', item: 'Rice (1kg)', category: 'Food & Beverages', price: 8.50, currency: 'GHS', change: 2.3, unit: 'kg', lastUpdated: '2024-01-15' },
      { id: '2', item: 'Bread (Local)', category: 'Food & Beverages', price: 3.00, currency: 'GHS', change: 0.5, unit: 'loaf', lastUpdated: '2024-01-15' },
      { id: '3', item: 'Chicken (1kg)', category: 'Food & Beverages', price: 25.00, currency: 'GHS', change: -1.2, unit: 'kg', lastUpdated: '2024-01-15' },
      { id: '4', item: 'Gasoline', category: 'Transportation', price: 13.50, currency: 'GHS', change: 5.1, unit: 'liter', lastUpdated: '2024-01-15' },
      { id: '5', item: 'Taxi (Local)', category: 'Transportation', price: 2.50, currency: 'GHS', change: 0, unit: 'per km', lastUpdated: '2024-01-15' },
      { id: '6', item: 'Electricity', category: 'Utilities', price: 0.95, currency: 'GHS', change: 3.2, unit: 'kWh', lastUpdated: '2024-01-15' },
    ],
    Nigeria: [
      { id: '7', item: 'Rice (1kg)', category: 'Food & Beverages', price: 450, currency: 'NGN', change: 1.8, unit: 'kg', lastUpdated: '2024-01-15' },
      { id: '8', item: 'Bread (Local)', category: 'Food & Beverages', price: 200, currency: 'NGN', change: 2.1, unit: 'loaf', lastUpdated: '2024-01-15' },
      { id: '9', item: 'Gasoline', category: 'Transportation', price: 617, currency: 'NGN', change: 8.5, unit: 'liter', lastUpdated: '2024-01-15' },
    ],
    'United States': [
      { id: '10', item: 'Rice (1kg)', category: 'Food & Beverages', price: 3.50, currency: 'USD', change: 0.8, unit: 'kg', lastUpdated: '2024-01-15' },
      { id: '11', item: 'Bread (Local)', category: 'Food & Beverages', price: 2.80, currency: 'USD', change: 1.2, unit: 'loaf', lastUpdated: '2024-01-15' },
      { id: '12', item: 'Gasoline', category: 'Transportation', price: 3.45, currency: 'USD', change: -2.1, unit: 'gallon', lastUpdated: '2024-01-15' },
    ]
  };

  const fetchPrices = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const countryPrices = mockPricesData[selectedCountry as keyof typeof mockPricesData] || [];
      setPrices(countryPrices);
      
      toast({
        title: "Prices Updated",
        description: `Fetched latest prices for ${selectedCountry}`
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not fetch latest price data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedCountry]);

  const filteredPrices = prices.filter(price => {
    const matchesCategory = selectedCategory === 'All' || price.category === selectedCategory;
    const matchesSearch = price.item.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCountryInfo = () => {
    return countries.find(c => c.name === selectedCountry);
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      'GHS': '₵',
      'NGN': '₦',
      'USD': '$',
      'GBP': '£',
      'CAD': 'C$',
    };
    return symbols[currency] || currency;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="border-emerald-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <MapPin className="h-5 w-5" />
            Price Tracker Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.name} value={country.name}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search Items</Label>
              <Input
                id="search"
                placeholder="Search for items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fetchPrices} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country Info */}
      {getCountryInfo() && (
        <Card className="border-blue-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{getCountryInfo()?.flag}</span>
              <div>
                <h3 className="text-xl font-bold text-blue-700">{selectedCountry}</h3>
                <p className="text-gray-600">Currency: {getCountryInfo()?.currency}</p>
                <p className="text-sm text-gray-500">
                  Showing {filteredPrices.length} items
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrices.map((price) => (
          <Card key={price.id} className="border border-gray-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">{price.item}</h4>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {price.category}
                    </Badge>
                  </div>
                  <ShoppingCart className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-800">
                      {getCurrencySymbol(price.currency)}{price.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">per {price.unit}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-1 text-sm ${
                      price.change >= 0 ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {price.change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(price.change).toFixed(1)}%
                    </div>
                    <span className="text-xs text-gray-400">
                      Updated: {new Date(price.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrices.length === 0 && !loading && (
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No items found</h3>
              <p className="text-gray-400">
                Try adjusting your search or category filters
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PriceTracker;
