import { useState } from 'react';
import { ArrowLeft, Plus, X, TrendingUp } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  mockRestaurants,
  mockEarningsStats,
  getRestaurantById,
  roleLabels,
  shiftTimeLabels,
  type Role,
  type ShiftTimeOfDay,
} from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ComparePageProps {
  onBack: () => void;
}

interface ComparisonItem {
  id: string;
  restaurantId: string;
  role: Role;
  shiftTimeOfDay: ShiftTimeOfDay;
}

export function ComparePage({ onBack }: ComparePageProps) {
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([]);
  const [newComparison, setNewComparison] = useState<Partial<ComparisonItem>>({});

  const canAddComparison = newComparison.restaurantId && newComparison.role && newComparison.shiftTimeOfDay;

  const addComparison = () => {
    if (canAddComparison) {
      setComparisons([
        ...comparisons,
        {
          id: `comp-${Date.now()}`,
          restaurantId: newComparison.restaurantId!,
          role: newComparison.role!,
          shiftTimeOfDay: newComparison.shiftTimeOfDay!,
        },
      ]);
      setNewComparison({});
    }
  };

  const removeComparison = (id: string) => {
    setComparisons(comparisons.filter(c => c.id !== id));
  };

  const getComparisonData = (comparison: ComparisonItem) => {
    const stat = mockEarningsStats.find(
      s =>
        s.restaurantId === comparison.restaurantId &&
        s.role === comparison.role &&
        s.shiftTimeOfDay === comparison.shiftTimeOfDay
    );
    return stat;
  };

  // Prepare data for chart
  const chartData = comparisons.map(comp => {
    const restaurant = getRestaurantById(comp.restaurantId);
    const stat = getComparisonData(comp);
    return {
      name: `${restaurant?.name} - ${roleLabels[comp.role]}`,
      medianTips: stat?.medianNetTips || 0,
      medianHourly: stat?.medianHourly || 0,
      p25: stat?.percentile25 || 0,
      p75: stat?.percentile75 || 0,
    };
  });

  // Calculate monthly estimates (4 shifts per week)
  const monthlyEstimate = (hourly: number, hoursPerShift: number = 6) => {
    return Math.round(hourly * hoursPerShift * 4 * 4.33); // 4 shifts/week * 4.33 weeks/month
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Button onClick={onBack} variant="ghost" className="mb-4">
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Compare Earnings</h1>
          <p className="text-muted-foreground">
            Compare different restaurants, roles, and shift types side-by-side to make informed decisions.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Add Comparison Tool */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Comparison</CardTitle>
            <CardDescription>
              Select a restaurant, role, and shift type to add to the comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Restaurant</label>
                <Select
                  value={newComparison.restaurantId}
                  onValueChange={(value) => setNewComparison({ ...newComparison, restaurantId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockRestaurants.map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={newComparison.role}
                  onValueChange={(value) => setNewComparison({ ...newComparison, role: value as Role })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Shift</label>
                <Select
                  value={newComparison.shiftTimeOfDay}
                  onValueChange={(value) => setNewComparison({ ...newComparison, shiftTimeOfDay: value as ShiftTimeOfDay })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(shiftTimeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={addComparison} disabled={!canAddComparison} className="gap-2">
                <Plus className="size-4" />
                Add to Compare
              </Button>
            </div>
          </CardContent>
        </Card>

        {comparisons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No comparisons added yet. Add your first comparison above to get started.
              </p>
              <p className="text-sm text-muted-foreground">
                Try comparing the same role at different restaurants, or different shifts at the same restaurant.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparisons.map(comp => {
                const restaurant = getRestaurantById(comp.restaurantId);
                const stat = getComparisonData(comp);

                return (
                  <Card key={comp.id} className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeComparison(comp.id)}
                    >
                      <X className="size-4" />
                    </Button>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg pr-8">{restaurant?.name}</CardTitle>
                      <CardDescription>
                        {roleLabels[comp.role]} · {shiftTimeLabels[comp.shiftTimeOfDay]}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {stat ? (
                        <>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Median Hourly</p>
                            <p className="text-2xl font-bold text-green-700">${stat.medianHourly}/hr</p>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Median tips/shift</span>
                              <span className="font-medium">${stat.medianNetTips}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tip range (IQR)</span>
                              <span className="font-medium">${stat.percentile25} - ${stat.percentile75}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Avg hours/shift</span>
                              <span className="font-medium">{stat.avgHoursPerShift}h</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Data points</span>
                              <span className="font-medium">{stat.submissionCount}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground mb-1">Est. monthly (4 shifts/week)</p>
                            <p className="text-lg font-semibold">
                              ${monthlyEstimate(stat.medianHourly, stat.avgHoursPerShift).toLocaleString()}
                            </p>
                          </div>

                          <Badge variant={stat.confidenceScore >= 80 ? 'default' : 'secondary'} className="w-full justify-center">
                            {stat.confidenceScore}% confidence
                          </Badge>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No data available for this combination
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Charts */}
            {comparisons.length > 1 && chartData.every(d => d.medianHourly > 0) && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hourly Rate Comparison</CardTitle>
                    <CardDescription>
                      Median effective hourly rate (tips + base wage)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                        <YAxis label={{ value: '$/hour', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="medianHourly" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tips per Shift Comparison</CardTitle>
                    <CardDescription>
                      Median net tips with 25th-75th percentile range
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                        <YAxis label={{ value: 'Tips ($)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="medianTips" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="size-5 text-green-600" />
                      Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(() => {
                      const validStats = comparisons
                        .map(c => ({ comp: c, stat: getComparisonData(c) }))
                        .filter(d => d.stat);
                      
                      if (validStats.length < 2) return null;

                      const highest = validStats.reduce((max, curr) =>
                        curr.stat!.medianHourly > max.stat!.medianHourly ? curr : max
                      );
                      const lowest = validStats.reduce((min, curr) =>
                        curr.stat!.medianHourly < min.stat!.medianHourly ? curr : min
                      );
                      const mostConsistent = validStats.reduce((min, curr) => {
                        const currRange = curr.stat!.percentile75 - curr.stat!.percentile25;
                        const minRange = min.stat!.percentile75 - min.stat!.percentile25;
                        return currRange < minRange ? curr : min;
                      });

                      return (
                        <>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium mb-1">Highest Earning</p>
                            <p className="font-semibold">
                              {getRestaurantById(highest.comp.restaurantId)?.name} - {roleLabels[highest.comp.role]}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ${highest.stat!.medianHourly}/hr median
                            </p>
                          </div>

                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium mb-1">Most Consistent</p>
                            <p className="font-semibold">
                              {getRestaurantById(mostConsistent.comp.restaurantId)?.name} - {roleLabels[mostConsistent.comp.role]}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ${mostConsistent.stat!.percentile75 - mostConsistent.stat!.percentile25} earnings spread
                            </p>
                          </div>

                          <div className="p-3 bg-gray-100 rounded-lg">
                            <p className="text-sm font-medium mb-1">Earnings Difference</p>
                            <p className="font-semibold">
                              ${highest.stat!.medianHourly - lowest.stat!.medianHourly}/hr
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Between highest and lowest options
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
