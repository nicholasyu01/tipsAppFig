import { useState, useMemo, useEffect } from "react";
import { Search, TrendingUp, MapPin, DollarSign } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { getStatsForRestaurant, type Restaurant } from "@/data/mockData";
import { supabase } from "@/app/lib/supabaseClient";

interface HomePageProps {
  onSelectRestaurant: (restaurantId: string, address?: string) => void;
}

export function HomePage({ onSelectRestaurant }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  const filteredRestaurants = useMemo(() => {
    if (!searchQuery) return restaurants;

    const query = searchQuery.toLowerCase();
    return restaurants.filter(
      (r) =>
        r.restaurant.toLowerCase().includes(query) ||
        r.address.toLowerCase().includes(query),
    );
  }, [searchQuery, restaurants]);
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoadingRestaurants(true);
      try {
        const { data, error } = await supabase
          .from("latest_restaurant_tips")
          .select("*");

        if (error) {
          console.error(error);
        } else {
          setRestaurants(data ?? []);
        }
      } catch (err) {
        console.error(err);
        setRestaurants([]);
      } finally {
        setLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, []);

  const getStatsForRestaurant = (restaurant: string) => {
    const list = restaurants.filter((s) => {
      if (s.restaurant !== restaurant) return false;
      return true;
    });
    return list;
  };
  const getTopEarningForRestaurant = (restaurant: Restaurant) => {
    const stats = getStatsForRestaurant(restaurant.restaurant);
    if (stats.length === 0) return null;

    const topStat = stats.reduce((max, curr) =>
      curr.tip_amount > max.tip_amount ? curr : max,
    );

    return topStat;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">
              Real data from hospitality workers
            </h1>
            <p className="text-xl text-green-50 mb-8">
              See actual tips earnings from industry professionals like you
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by restaurant name or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base bg-white text-gray-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {/* <div className="container mx-auto px-4 -mt-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Submissions</CardDescription>
              <CardTitle className="text-3xl">
                {mockEarningsStats.reduce(
                  (sum, s) => sum + s.submissionCount,
                  0,
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verified shift earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Restaurants</CardDescription>
              <CardTitle className="text-3xl">
                {mockRestaurants.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Across major cities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg. Confidence Score</CardDescription>
              <CardTitle className="text-3xl">
                {Math.round(
                  mockEarningsStats.reduce(
                    (sum, s) => sum + s.confidenceScore,
                    0,
                  ) / mockEarningsStats.length,
                )}
                %
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Data reliability</p>
            </CardContent>
          </Card>
        </div>
      </div> */}

      {/* Restaurant Listings */}
      <div className="container mx-auto px-4 pb-16">
        <div className="mb-6 mt-12">
          <h2 className="text-2xl font-semibold mb-2">
            {searchQuery
              ? `Search Results (${filteredRestaurants.length})`
              : "All Restaurants"}
          </h2>
          {/* <p className="text-muted-foreground">
            Click any restaurant to see detailed earnings data by role and shift
            type
          </p> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => {
            const topEarning = getTopEarningForRestaurant(restaurant);
            const statsCount = getStatsForRestaurant(restaurant).length;

            return (
              <Card
                key={restaurant.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() =>
                  onSelectRestaurant(restaurant.restaurant, restaurant.address)
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1 capitalize">
                        {restaurant.restaurant}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="size-4" />
                        {restaurant.address
                          ? restaurant.address
                              .split(",")
                              .slice(0, 2)
                              .map((s) => s.trim())
                              .join(", ")
                          : (restaurant.city ?? "")}
                      </CardDescription>
                    </div>
                    {/* <Badge variant="secondary">{restaurant.priceRange}</Badge> */}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* <Badge variant="outline" className="text-xs">
                      {restaurant.cuisine}
                    </Badge> */}
                    {/* <Badge variant="outline" className="text-xs capitalize">
                      {restaurant.serviceStyle.replace("_", " ")}
                    </Badge> */}
                    <Badge variant="default" className="text-xs capitalize">
                      {restaurant.tip_structure == "individual"
                        ? "Individual Tips"
                        : "Tip Pool"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  {restaurant ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Latest tip submission
                          </p>
                          <p className="font-semibold text-lg">
                            {restaurant.tip_amount}
                          </p>
                        </div>
                        {/* <TrendingUp className="size-5 text-green-600" /> */}
                      </div>

                      {/* <div className="text-sm text-muted-foreground">
                        {statsCount} role
                        {statsCount > 1 || statsCount === 0 ? "s" : ""} with
                        earnings data
                      </div> */}

                      {/* <Button variant="outline" className="w-full">
                        See More
                      </Button> */}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        No earnings data yet
                      </p>
                      <Button variant="outline" size="sm">
                        Be the first to submit
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredRestaurants.length === 0 && !loadingRestaurants && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No restaurants found matching "{searchQuery}"
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
