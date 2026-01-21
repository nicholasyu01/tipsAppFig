import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  Filter,
  Trash2,
  Edit,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import {
  getRestaurantById,
  roleLabels,
  shiftTimeLabels,
  type ShiftSubmission,
} from "@/data/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MySubmissionsPageProps {
  onBack: () => void;
  submissions: ShiftSubmission[];
  onDeleteSubmission: (id: string) => void;
}

type SortOption = "date-desc" | "date-asc" | "earnings-desc" | "earnings-asc";

export function MySubmissionsPage({
  onBack,
  submissions,
  onDeleteSubmission,
}: MySubmissionsPageProps) {
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterShift, setFilterShift] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(
    null,
  );

  // Get unique roles and shifts from submissions
  const uniqueRoles = Array.from(new Set(submissions.map((s) => s.role)));
  const uniqueShifts = Array.from(
    new Set(submissions.map((s) => s.shiftTimeOfDay)),
  );

  // Filter and sort submissions
  const filteredSubmissions = submissions
    .filter((sub) => {
      if (filterRole !== "all" && sub.role !== filterRole) return false;
      if (filterShift !== "all" && sub.shiftTimeOfDay !== filterShift)
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "earnings-desc":
          return b.netTips - a.netTips;
        case "earnings-asc":
          return a.netTips - b.netTips;
        default:
          return 0;
      }
    });

  // Calculate summary stats
  const totalEarnings = submissions.reduce((sum, s) => sum + s.netTips, 0);
  const totalHours = submissions.reduce((sum, s) => sum + s.hoursWorked, 0);
  const avgHourly = totalHours > 0 ? totalEarnings / totalHours : 0;
  const avgTipsPerShift =
    submissions.length > 0 ? totalEarnings / submissions.length : 0;

  // Prepare chart data - earnings over time
  const chartData = submissions
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((sub) => ({
      date: new Date(sub.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      tips: sub.netTips,
      hourly: sub.effectiveHourly,
    }));

  // Prepare role breakdown data
  const roleBreakdown = uniqueRoles.map((role) => {
    const roleSubs = submissions.filter((s) => s.role === role);
    const totalTips = roleSubs.reduce((sum, s) => sum + s.netTips, 0);
    const avgTips = roleSubs.length > 0 ? totalTips / roleSubs.length : 0;
    return {
      role: roleLabels[role],
      count: roleSubs.length,
      avgTips: Math.round(avgTips),
    };
  });

  const handleDeleteClick = (id: string) => {
    setSubmissionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (submissionToDelete) {
      onDeleteSubmission(submissionToDelete);
      setDeleteDialogOpen(false);
      setSubmissionToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Button onClick={onBack} variant="ghost" className="mb-4">
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">My History</h1>
          <p className="text-muted-foreground">
            Track all your shift earnings submissions and view your personal
            statistics
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <DollarSign className="size-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No submissions yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by submitting your first shift earnings to track your
                income over time
              </p>
              <Button onClick={onBack}>Submit Your First Shift</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <DollarSign className="size-4" />
                    Earnings
                  </CardDescription>
                  <CardTitle className="text-2xl">
                    ${totalEarnings.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Net tips across all shifts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="size-4" />
                    Avg per Shift
                  </CardDescription>
                  <CardTitle className="text-2xl">
                    ${Math.round(avgTipsPerShift)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Average net tips
                  </p>
                </CardContent>
              </Card>

              {/* <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="size-4" />
                    Avg Hourly
                  </CardDescription>
                  <CardTitle className="text-2xl">
                    ${Math.round(avgHourly)}/hr
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(totalHours)} total hours
                  </p>
                </CardContent>
              </Card> */}

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    Total Shifts
                  </CardDescription>
                  <CardTitle className="text-2xl">
                    {submissions.length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Submissions tracked
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Earnings Over Time</CardTitle>
                  <CardDescription>Net tips per shift</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar
                        dataKey="tips"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Earnings by Role</CardTitle>
                  <CardDescription>
                    Average tips per shift by role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={roleBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="role" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar
                        dataKey="avgTips"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div> */}

            {/* Filters and Sort */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      All Submissions ({filteredSubmissions.length})
                    </CardTitle>
                    <CardDescription>
                      View and manage your shift earnings
                    </CardDescription>
                  </div>
                  <Filter className="size-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Role:</label>
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {uniqueRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {roleLabels[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Shift:</label>
                    <Select value={filterShift} onValueChange={setFilterShift}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Shifts</SelectItem>
                        {uniqueShifts.map((shift) => (
                          <SelectItem key={shift} value={shift}>
                            {shiftTimeLabels[shift]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Sort:</label>
                    <Select
                      value={sortBy}
                      onValueChange={(v) => setSortBy(v as SortOption)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">Newest First</SelectItem>
                        <SelectItem value="date-asc">Oldest First</SelectItem>
                        <SelectItem value="earnings-desc">
                          Highest Earnings
                        </SelectItem>
                        <SelectItem value="earnings-asc">
                          Lowest Earnings
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Submissions List */}
                <div className="space-y-4">
                  {filteredSubmissions.map((submission) => {
                    const restaurant = getRestaurantById(
                      submission.restaurantId,
                    );

                    return (
                      <Card
                        key={submission.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">
                                  {restaurant?.name}
                                </h3>
                                <Badge variant="secondary">
                                  {roleLabels[submission.role]}
                                </Badge>
                                <Badge variant="outline">
                                  {shiftTimeLabels[submission.shiftTimeOfDay]}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                <div>
                                  <p className="text-xs text-muted-foreground"></p>
                                  <p className="font-medium">
                                    {new Date(
                                      submission.date,
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {submission.dayOfWeek}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Net Tips
                                  </p>
                                  <p className="font-semibold text-green-600 text-lg">
                                    ${submission.netTips}
                                  </p>
                                </div>
                                {/* 
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Effective Hourly
                                  </p>
                                  <p className="font-medium">
                                    ${submission.effectiveHourly}/hr
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {submission.hoursWorked}h worked
                                  </p>
                                </div> */}
                                {/* 
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Sales
                                  </p>
                                  <p className="font-medium">
                                    ${submission.totalSales.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {(
                                      (submission.grossTips /
                                        submission.totalSales) *
                                      100
                                    ).toFixed(1)}
                                    % tip rate
                                  </p>
                                </div> */}
                              </div>
                              {/* 
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span>Base: ${submission.baseWage}/hr</span>
                                <span>Gross: ${submission.grossTips}</span>
                                <span>Tip Out: ${submission.tipOutAmount}</span>
                                {submission.partyCount && (
                                  <span>{submission.partyCount} parties</span>
                                )}
                                {submission.sectionSize && (
                                  <span>{submission.sectionSize} tables</span>
                                )}
                              </div> */}
                            </div>

                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(submission.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this submission? This action
              cannot be undone and will remove your contribution to the earnings
              data for this restaurant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
