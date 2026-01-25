import { useEffect, useState } from "react";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  getRestaurantById,
  getStatsForRestaurant,
  getSubmissionsForRestaurant,
  Restaurant,
  roleLabels,
  shiftTimeLabels,
  type Role,
  type ShiftTimeOfDay,
} from "@/data/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { supabase } from "../lib/supabaseClient";
import { get } from "react-hook-form";

interface RestaurantDetailPageProps {
  restaurantId: string;
  onBack: () => void;
}

export function RestaurantDetailPage({
  restaurantId,
  onBack,
}: RestaurantDetailPageProps) {
  // const allStats = getStatsForRestaurant(restaurantId);

  const [selectedRole, setSelectedRole] = useState<Role | "all">("all");
  const [selectedShiftTime, setSelectedShiftTime] = useState<
    ShiftTimeOfDay | "all"
  >("all");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant>(null);
  const [allStats, setAllStats] = useState<Restaurant[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);

  const getRestaurantById = (name: string) =>
    restaurants.find((r) => r.name === name);

  const getStatsForRestaurant = (
    restaurantId: string,
    role?: Role,
    shiftTime?: ShiftTimeOfDay,
  ) => {
    return restaurants.filter((s) => {
      if (s.restaurant !== restaurantId) return false;
      if (role && s.role !== role) return false;
      // if (shiftTime && s.shiftTimeOfDay !== shiftTime) return false;
      return true;
    });
  };
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoadingRestaurants(true);
      try {
        const { data, error } = await supabase
          .from("tips")
          .select(
            `createdAt, date, id, name, restaurant, address, role, shiftStartTime, tipAmount, tipStructure`,
          );

        if (error) {
          console.error("Error fetching restaurants:", error);
          setRestaurants([]);
          return;
        }

        const rows = (data ?? []) as any[];
        const map = new Map<string, Restaurant>();

        rows.forEach((r) => {
          const id = r.id;
          if (!id) return;

          if (!map.has(String(id))) {
            map.set(String(id), {
              id: String(id),
              name: r.restaurant,
              city: r.city ?? "Vancouver",
              state: r.state ?? "BC",
              cuisine: r.cuisine ?? "",
              priceRange: (r.price_range ?? r.priceRange ?? "$") as any,
              serviceStyle: (r.service_style ??
                r.serviceStyle ??
                "casual") as any,
              tipModel: (r.tipStructure ??
                r.tipStructure ??
                "individual") as any,
              poolDistribution: "",
              creditCardFeeDeduction: Boolean(false),
            });
          }
        });

        setRestaurants(data);
        const selectedRest = data.find((r) => r.restaurant === restaurantId);
        console.log("selectedRest", selectedRest);
        setRestaurant(selectedRest);
        const allStats = data.filter((s) => {
          if (s.restaurant !== restaurantId) return false;
          return true;
        });
        setAllStats(allStats);
        console.log("allStats", allStats);
        // console.log("allStats", JSON.stringify(allStats));

        // calculate aggregate data

        const availableRoles = Array.from(
          new Set(allStats.map((s) => s.role.toLowerCase())),
        );
        console.log("availableRoles", availableRoles);

        setAvailableRoles(availableRoles);
      } catch (err) {
        console.error(err);
        setRestaurants([]);
      } finally {
        setLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, []);
  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
        <p>Restaurant not found</p>
      </div>
    );
  }

  const filteredStats = allStats.filter((stat) => {
    if (selectedRole !== "all" && stat.role.toLowerCase() !== selectedRole)
      return false;
    if (
      selectedShiftTime !== "all" &&
      stat.shiftTimeOfDay !== selectedShiftTime
    )
      return false;
    return true;
  });

  const aggregateStats = [
    {
      id: 1,
      averageTips:
        filteredStats.reduce((sum, s) => sum + s.tipAmount, 0) /
        filteredStats.length,
    },
  ];

  // Get unique roles and shift times from stats
  // const availableRoles = Array.from(new Set(allStats.map((s) => s.role)));
  // const availableShiftTimes = Array.from(
  //   new Set(allStats?.map((s) => s.shiftTimeOfDay)),
  // );

  // Prepare data for distribution chart
  const getDistributionData = () => {
    if (filteredStats.length === 0) return [];

    return filteredStats?.map((stat) => ({
      name: `${roleLabels[stat.role]} - ${shiftTimeLabels[stat.shiftTimeOfDay]}`,
      median: stat.medianNetTips,
      hourly: stat.medianHourly,
    }));
  };

  const distributionData = getDistributionData();
  console.log("distributionData", distributionData);

  // Day of week analysis for selected combination
  const getDayOfWeekData = () => {
    console.log("restuarantId", restaurantId);
    const submissions = getSubmissionsForRestaurant(
      restaurantId,
      selectedRole !== "all" ? selectedRole : undefined,
      selectedShiftTime !== "all" ? selectedShiftTime : undefined,
    );

    const dayGroups: Record<string, number[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    submissions.forEach((sub) => {
      if (dayGroups[sub.dayOfWeek]) {
        dayGroups[sub.dayOfWeek].push(sub.netTips);
      }
    });

    return Object.entries(dayGroups).map(([day, tips]) => ({
      day: day.slice(0, 3),
      avgTips:
        tips.length > 0
          ? Math.round(tips.reduce((a, b) => a + b, 0) / tips.length)
          : 0,
      count: tips.length,
    }));
  };

  const dayOfWeekData = getDayOfWeekData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Button onClick={onBack} variant="ghost" className="mb-4">
            <ArrowLeft className="size-4 mr-2" />
            Back to Browse
          </Button>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 capitalize">
                {restaurant.restaurant}
              </h1>
              <p className="text-lg text-muted-foreground capitalize">
                {restaurant.address}
              </p>
            </div>
            {/* <Badge variant="secondary" className="text-lg px-4 py-2">
              {restaurant.priceRange}
            </Badge> */}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* <Badge variant="outline" className="capitalize">
              {restaurant.serviceStyle.replace("_", " ")}
            </Badge> */}
            <Badge
              variant={restaurant.tipModel === "pool" ? "default" : "secondary"}
            >
              {restaurant.tipStructure === "pool" && "Tip Pool"}
              {restaurant.tipStructure === "individual" && "Individual Tips"}
              {restaurant.tipStructure === "hybrid" && "Hybrid Tips"}
            </Badge>
            {/* {restaurant.poolDistribution && (
              <Badge variant="outline" className="capitalize">
                {restaurant.poolDistribution.replace("_", " ")} distribution
              </Badge>
            )} */}
            {restaurant.creditCardFeeDeduction && (
              <Badge variant="outline">CC Fee Deduction</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Role:</label>
              <Select
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as Role | "all")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {roleLabels[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Shift:</label>
              <Select
                value={selectedShiftTime}
                onValueChange={(v) =>
                  setSelectedShiftTime(v as ShiftTimeOfDay | "all")
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts</SelectItem>
                  {availableShiftTimes.map((shift) => (
                    <SelectItem key={shift} value={shift}>
                      {shiftTimeLabels[shift]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {filteredStats.length === 0 ? (
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              No earnings data available for this combination. Try adjusting
              your filters or be the first to submit data.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            {/* <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList> */}

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {aggregateStats.slice(0, 4).map((stat) => (
                  <Card key={`${stat.id}`}>
                    <CardHeader className="pb-3">
                      <CardDescription className="text-xs">
                        Average Tips Per Shift
                      </CardDescription>
                      <CardTitle className="text-2xl">
                        ${stat.averageTips}/shift
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {/* <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Median tips:
                        </span>
                        <span className="font-medium">${10}</span>
                      </div> */}
                      {/* <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Range:</span>
                        <span className="font-medium">
                          ${stat.percentile25} - ${stat.percentile75}
                        </span>
                      </div> */}
                      {/* <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Confidence:
                        </span>
                        <span className="font-medium">
                          {stat.confidenceScore}%
                        </span>
                      </div> */}
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{filteredStats.length} submissions</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Detailed Stats Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Earnings Data</CardTitle>
                  {/* <CardDescription>
                    Showing all available role and shift combinations with
                    earnings data
                  </CardDescription> */}
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium">
                            Role
                          </th>
                          <th className="text-left py-3 px-2 font-medium">
                            Date
                          </th>
                          <th className="text-right py-3 px-2 font-medium">
                            Tips
                          </th>
                          {/* <th className="text-right py-3 px-2 font-medium">
                            Start time
                          </th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStats.map((stat) => (
                          <tr
                            key={stat.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-3 px-2 capitalize">
                              {stat.role}
                            </td>
                            <td className="py-3 px-2">
                              {new Date(stat.date).toLocaleDateString()}
                            </td>
                            <td className="text-right py-3 px-2 font-medium">
                              ${stat.tipAmount}
                            </td>
                            {/* <td className="text-right py-3 px-2 font-medium">
                              {stat.shiftStartTime}
                            </td>
                            <td className="text-right py-3 px-2 font-medium">
                              ${stat.medianHourly}
                            </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="distribution" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Earnings Distribution</CardTitle>
                  <CardDescription>
                    Median tips per shift with 25th-75th percentile range
                    (interquartile range)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={distributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={120}
                      />
                      <YAxis
                        label={{
                          value: "Net Tips ($)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            console.log("tooltip data", data);
                            return (
                              <div className="bg-white p-3 border rounded shadow-lg">
                                <p className="font-medium mb-2">{data.name}</p>
                                <p className="text-sm">
                                  Median:{" "}
                                  <span className="font-medium">
                                    ${data.median}
                                  </span>
                                </p>
                                <p className="text-sm">
                                  Range: ${data.p25} - ${data.p75}
                                </p>
                                <p className="text-sm">
                                  Hourly:{" "}
                                  <span className="font-medium">
                                    ${data.hourly}/hr
                                  </span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="median"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Highest Earning</CardDescription>
                    <CardTitle className="text-xl">
                      {filteredStats.reduce((max, s) =>
                        s.medianHourly > max.medianHourly ? s : max,
                      ).medianHourly > 0
                        ? `$${filteredStats.reduce((max, s) => (s.medianHourly > max.medianHourly ? s : max)).medianHourly}/hr`
                        : "N/A"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {filteredStats.length > 0 &&
                        (() => {
                          const top = filteredStats.reduce((max, s) =>
                            s.medianHourly > max.medianHourly ? s : max,
                          );
                          return `${roleLabels[top.role]} - ${shiftTimeLabels[top.shiftTimeOfDay]}`;
                        })()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Most Consistent</CardDescription>
                    <CardTitle className="text-xl">
                      {filteredStats.length > 0 &&
                        (() => {
                          const mostConsistent = filteredStats.reduce(
                            (min, s) => {
                              const range = s.percentile75 - s.percentile25;
                              const minRange =
                                min.percentile75 - min.percentile25;
                              return range < minRange ? s : min;
                            },
                          );
                          return `$${mostConsistent.percentile75 - mostConsistent.percentile25} spread`;
                        })()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Smallest variance in earnings
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Data Points</CardDescription>
                    <CardTitle className="text-xl">
                      {filteredStats.reduce(
                        (sum, s) => sum + s.submissionCount,
                        0,
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Verified shift submissions
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Earnings by Day of Week</CardTitle>
                  <CardDescription>
                    Average tips per shift based on day of the week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={dayOfWeekData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis
                        label={{
                          value: "Avg Tips ($)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded shadow-lg">
                                <p className="font-medium mb-1">{data.day}</p>
                                <p className="text-sm">
                                  Avg Tips:{" "}
                                  <span className="font-medium">
                                    ${data.avgTips}
                                  </span>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {data.count} shifts
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="avgTips" radius={[4, 4, 0, 0]}>
                        {dayOfWeekData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              ["Fri", "Sat", "Sun"].includes(entry.day)
                                ? "#10b981"
                                : "#94a3b8"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Alert>
                <TrendingUp className="size-4" />
                <AlertDescription>
                  <strong>Insight:</strong> Weekend shifts typically show 20-40%
                  higher earnings compared to weekday shifts. Consider this when
                  planning your schedule.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
