export function calculateFinancialHealthScore(budgetData: any): number {
  const income = budgetData.income?.amount || 0;
  const expenses = budgetData.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
  
  if (income === 0) return 0;
  
  const savingsRate = ((income - expenses) / income) * 100;
  const expenseRatio = (expenses / income) * 100;
  
  let score = 100;
  
  // Deduct points based on expense ratio
  if (expenseRatio > 90) score -= 40;
  else if (expenseRatio > 80) score -= 30;
  else if (expenseRatio > 70) score -= 20;
  else if (expenseRatio > 60) score -= 10;
  
  // Add points for healthy savings rate
  if (savingsRate >= 20) score += 10;
  else if (savingsRate >= 10) score += 5;
  
  // Check for emergency fund (assume 10% should be emergency savings)
  const emergencyFund = budgetData.expenses?.find((e: any) => e.category?.toLowerCase().includes('emergency') || e.category?.toLowerCase().includes('savings'));
  if (!emergencyFund) score -= 15;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getScoreFactors(budgetData: any): any {
  const income = budgetData.income?.amount || 0;
  const expenses = budgetData.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
  
  return {
    income_utilization: Math.round((expenses / income) * 100),
    savings_rate: Math.round(((income - expenses) / income) * 100),
    expense_categories: budgetData.expenses?.length || 0,
    emergency_fund_present: budgetData.expenses?.some((e: any) => 
      e.category?.toLowerCase().includes('emergency') || 
      e.category?.toLowerCase().includes('savings')
    ) || false
  };
}

export function generateRecommendations(budgetData: any, healthScore: number): string[] {
  const recommendations = [];
  const income = budgetData.income?.amount || 0;
  const expenses = budgetData.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
  const savingsRate = ((income - expenses) / income) * 100;
  
  if (savingsRate < 10) {
    recommendations.push("Build an emergency fund covering 3-6 months of expenses");
    recommendations.push("Look for ways to reduce non-essential expenses");
  }
  
  if (expenses / income > 0.8) {
    recommendations.push("Your expenses are high relative to income - consider budget optimization");
  }
  
  if (healthScore < 50) {
    recommendations.push("Focus on creating a sustainable budget plan");
    recommendations.push("Consider additional income sources or expense reduction");
  }
  
  recommendations.push("Review and categorize all expenses monthly");
  recommendations.push("Set specific savings goals for the next 6 months");
  
  return recommendations;
}