import { useEffect, useState } from "react";
import { useUser } from "@/app/lib/userContext";
// using local controlled form state for submission
import { ArrowLeft, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  mockRestaurants,
  roleLabels,
  type Role,
  type ShiftType,
  type Restaurant,
} from "@/data/mockData";
import { supabase } from "../lib/supabaseClient";
import PlacesAutocomplete from "./placesAutoComplete";
import { useNavigate } from "react-router-dom";
import { cn } from "./ui/utils";

interface SubmitPageProps {
  onBack: () => void;
}

interface ShiftFormData {
  restaurantId: string;
  role: Role;
  shiftTimeOfDay?: string;
  start_time?: string;
  shiftType: ShiftType;
  date: string;
  baseWage: number;
  totalSales: number;
  grossTips: number;
  tipOutAmount: number;
  hoursWorked: number;
}

export function SubmitPage({ onBack }: SubmitPageProps) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<
    "basic" | "earnings" | "review" | "success"
  >("basic");
  const [formData, setFormData] = useState<Partial<ShiftFormData>>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTips, setSubmittedTips] = useState(0);

  const [form, setForm] = useState({
    name: "",
    restaurant: "",
    address: "",
    tip_amount: "",
    role: "Server",
    date: "",
    start_time: "",
    tip_structure: "individual",
    shifts: 1,
    hours: 8,
  });

  const grossTips = Number(form.tip_amount) || Number(formData.grossTips) || 0;
  const tipOutAmount = Number(formData.tipOutAmount) || 0;
  const totalSales = Number(formData.totalSales) || 0;
  const hoursWorked = Number(formData.hoursWorked) || 0;
  const baseWage = Number(formData.baseWage) || 0;

  const netTips = grossTips - tipOutAmount;
  const effectiveHourly =
    hoursWorked > 0 ? netTips / hoursWorked + baseWage : 0;
  const tipPercentage = totalSales > 0 ? (grossTips / totalSales) * 100 : 0;

  const handleBasicInfo = (data: Partial<ShiftFormData>) => {
    setFormData({ ...formData, ...data });
    setCurrentStep("earnings");
  };

  function validate() {
    // if (!form.name.trim()) return "Name is required";
    if (!form.restaurant.trim()) return "Restaurant is required";
    if (!form.tip_amount || Number.isNaN(Number(form.tip_amount)))
      return "Valid tip amount is required";
    if (!form.role) return "Role is required";
    if (!form.date) return "Date is required";
    if (!form.start_time) return "Shift start time is required";
    return null;
  }

  async function submitTip(payload: any) {
    // Insert into Supabase `tips` table. Ensure your table has matching columns.
    const { data, error } = await supabase.from("tips").insert([payload]);
    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }
    // refresh tips list after successful insert
    // await loadTips();
    return data;
  }
  function update(field: any) {
    return (e: any) => setForm((s) => ({ ...s, [field]: e.target.value }));
  }
  const submitCashout = async (e: any) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      console.error("Validation error:", err);
      setMessage(err);
      return;
    }

    setSubmitting(true);
    setMessage("");

    const restaurantName =
      mockRestaurants.find((r: Restaurant) => r.id === form.restaurant)?.name ??
      form.restaurant;

    const payload = {
      name: user?.email ?? null,
      restaurant: (restaurantName ?? "").trim(),
      address: form.address || "",
      tip_amount: Number(form.tip_amount),
      role: form.role,
      date: form.date,
      start_time: "00:00", // form.start_time
      tip_structure: form.tip_structure,
      created_at: new Date().toISOString(),
      shifts: Number(form.shifts),
      hours: Number(form.hours),
    };

    try {
      // If a parent passed an onSubmit handler, call it (e.g., to persist to server)
      if (submitTip) {
        await submitTip(payload);
      } else {
        // Default local behavior: log to console. Replace with API call as needed.
      }
      setSubmittedTips(Number(form.tip_amount));
      setMessage("Tip submitted successfully.");
      setForm({
        name: "",
        restaurant: "",
        address: "",
        tip_amount: "",
        role: "Server",
        date: "",
        start_time: "",
        tip_structure: "individual",
        shifts: 1,
        hours: 8,
      });
      setCurrentStep("success");
    } catch (err) {
      console.error(err);
      setMessage("Failed to submit tip. See console for details.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleEarningsInfo = (data: Partial<ShiftFormData>) => {
    setFormData({ ...formData, ...data });
    setCurrentStep("review");
  };

  const handleFinalSubmit = () => {
    // In a real app, this would send to backend
    setCurrentStep("success");
  };

  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Cashout Successful!</CardTitle>
            {/* <CardDescription>
              Thank you for contributing to tip transparency. Your data helps
              thousands of workers make informed decisions.
            </CardDescription> */}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Your earnings:</p>
              <p className="text-2xl font-bold text-green-700">
                ${submittedTips.toFixed(2)}
              </p>
              {/* <p className="text-sm text-muted-foreground">
                Net tips for this shift
              </p> */}
            </div>

            {/* <Alert>
              <Info className="size-4" />
              <AlertDescription>
                Your submission is completely anonymous and will be aggregated
                with others to provide accurate earnings insights.
              </AlertDescription>
            </Alert> */}

            <div className="flex gap-2">
              <Button onClick={onBack} className="flex-1">
                Done
              </Button>
              <Button
                onClick={() => {
                  setFormData({});
                  setCurrentStep("basic");
                }}
                variant="outline"
                className="flex-1"
              >
                Submit Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Button onClick={onBack} variant="ghost" className="mb-4">
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">My Cashout</h1>
          {/* <p className="text-muted-foreground">
            Help other workers by sharing your shift earnings. All submissions are anonymous.
          </p> */}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Step 1: Basic Info */}
        {currentStep === "basic" && (
          <Card>
            <CardHeader>
              <CardTitle>Save Shift Information</CardTitle>
              {/* <CardDescription>
                Tell us about the shift you worked
              </CardDescription> */}
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tip_amount">Tips ($) *</Label>
                  <Input
                    id="tip_amount"
                    type="number"
                    step="0.01"
                    placeholder="00.00"
                    value={form.tip_amount}
                    onChange={update("tip_amount")}
                  />
                  {/* <p className="text-xs text-muted-foreground">
                      Total tips before tip-out
                    </p> */}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restaurant">Restaurant *</Label>
                  <PlacesAutocomplete
                    onSelect={(place) => {
                      setForm((s) => ({
                        ...s,
                        restaurant: place.displayName.text || "",
                        address: place.formattedAddress,
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tip_structure">Tip Model *</Label>
                  <Select
                    defaultValue={form.tip_structure}
                    onValueChange={(value: string) =>
                      setForm((s) => ({ ...s, tip_structure: value }))
                    }
                  >
                    <SelectTrigger id="tip_structure">
                      <SelectValue placeholder="Select Tip Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key={1} value={"individual"}>
                        Individual
                      </SelectItem>
                      <SelectItem key={2} value={"pool"}>
                        Tip Pool
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    defaultValue={form.role}
                    onValueChange={(value: string) =>
                      setForm((s) => ({ ...s, role: value as Role }))
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <input
                      id="date"
                      type="date"
                      value={form.date}
                      onChange={update("date")}
                      max={new Date().toISOString().split("T")[0]}
                      className={cn(
                        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 min-w-0 rounded-md border px-3 py-1 text-sm bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                        // Responsive overrides
                        "w-50/100 sm:w-full",
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shifts">Shifts *</Label>
                  <Input
                    id="shifts"
                    type="number"
                    step="1"
                    placeholder="Shifts Worked"
                    value={form.shifts}
                    onChange={update("shifts")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours">Hours *</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="1"
                    placeholder="Hours Worked"
                    value={form.hours}
                    onChange={update("hours")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time *</Label>
                  <input
                    id="start_time"
                    type="time"
                    step={900}
                    value={form.start_time}
                    onChange={update("start_time")}
                    className={cn(
                      "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 min-w-0 rounded-md border px-3 py-1 text-sm bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                      "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                      // Responsive overrides
                      "w-50/100 sm:w-full",
                    )}
                  />
                </div>

                {/* <div className="space-y-2">
                    <Label htmlFor="shiftType">Shift Type *</Label>
                    <Select
                      defaultValue={formData.shiftType}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          shiftType: value as ShiftType,
                        })
                      }
                    >
                      <SelectTrigger id="shiftType">
                        <SelectValue placeholder="Select shift type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">
                          Standard Service
                        </SelectItem>
                        <SelectItem value="private_party">
                          Private Party/Buyout
                        </SelectItem>
                        <SelectItem value="club_bar">
                          Club Bar Service
                        </SelectItem>
                        <SelectItem value="bottle_service">
                          Bottle Service
                        </SelectItem>
                        <SelectItem value="event">Event/Catering</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                      </SelectContent>
                    </Select>
                    </div> */}
                {/* </div> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div className="space-y-2">
                    <Label htmlFor="baseWage">Base Hourly Wage ($) *</Label>
                    <Input
                      id="baseWage"
                      type="number"
                      step="0.01"
                      placeholder="10.50"
                      defaultValue={formData.baseWage}
                      {...register("baseWage", { required: true, min: 0 })}
                    />
                  </div> */}

                  {/* <div className="space-y-2">
                    <Label htmlFor="hoursWorked">Hours Worked *</Label>
                    <Input
                      id="hoursWorked"
                      type="number"
                      step="0.5"
                      placeholder="6.5"
                      defaultValue={formData.hoursWorked}
                      {...register("hoursWorked", { required: true, min: 0 })}
                    />
                  </div> */}
                </div>
                {/* 
                <div className="space-y-2">
                  <Label htmlFor="totalSales">
                    Total Sales You Handled ($) *
                  </Label>
                  <Input
                    id="totalSales"
                    type="number"
                    step="0.01"
                    placeholder="1500.00"
                    defaultValue={formData.totalSales}
                    {...register("totalSales", { required: true, min: 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your total sales for the shift (found on your checkout
                    report)
                  </p>
                </div> */}
                {/* 
                <div className="space-y-2">
                  <Label htmlFor="tipOutAmount">Tip Out Amount ($)</Label>
                  <Input
                    id="tipOutAmount"
                    type="number"
                    step="0.01"
                    placeholder="15.00"
                    defaultValue={formData.tipOutAmount || 0}
                    {...register("tipOutAmount", { min: 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Total amount tipped out to support staff (leave 0 if none)
                  </p>
                </div> */}

                {/* Live Calculations */}
                {/* {grossTips > 0 && hoursWorked > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <h4 className="font-medium">Calculated Values:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Net Tips</p>
                        <p className="text-lg font-semibold text-green-600">
                          ${netTips.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Effective Hourly
                        </p>
                        <p className="text-lg font-semibold text-green-600">
                          ${effectiveHourly.toFixed(2)}/hr
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tip %</p>
                        <p className="text-lg font-semibold">
                          {tipPercentage.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tip Out %</p>
                        <p className="text-lg font-semibold">
                          {grossTips > 0
                            ? ((tipOutAmount / grossTips) * 100).toFixed(1)
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                )} */}

                <Button
                  type="submit"
                  className="w-full"
                  onClick={submitCashout}
                  disabled={
                    !form.tip_amount ||
                    !form.restaurant ||
                    !form.role ||
                    !form.date ||
                    !form.shifts ||
                    !form.hours ||
                    !form.start_time
                  }
                >
                  Save
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review */}
        {/* {currentStep === "basic" && (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Submission</CardTitle>
              <CardDescription>
                Please verify all information is correct before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Restaurant</p>
                    <p className="font-medium">
                      {
                        mockRestaurants.find(
                          (r) => r.id === formData.restaurantId,
                        )?.name
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium">
                      {formData.role && roleLabels[formData.role]}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shift</p>
                    <p className="font-medium">
                      {formData.shiftTimeOfDay &&
                        shiftTimeLabels[formData.shiftTimeOfDay]}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formData.date}</p>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Earnings Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Wage</span>
                      <span className="font-medium">
                        ${formData.baseWage}/hr
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Hours Worked
                      </span>
                      <span className="font-medium">
                        {formData.hoursWorked}h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Sales</span>
                      <span className="font-medium">
                        ${formData.totalSales}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gross Tips</span>
                      <span className="font-medium">${formData.grossTips}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tip Out</span>
                      <span className="font-medium">
                        -${formData.tipOutAmount || 0}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-semibold">Net Tips</span>
                      <span className="font-bold text-green-700">
                        ${netTips.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">
                        Effective Hourly Rate
                      </span>
                      <span className="font-bold text-green-700">
                        ${effectiveHourly.toFixed(2)}/hr
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="size-4" />
                <AlertDescription>
                  Your submission is <strong>completely anonymous</strong>. We
                  never store identifying information and your data will be
                  aggregated with others to provide insights.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("earnings")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={handleFinalSubmit} className="flex-1">
                  Submit Earnings
                </Button>
              </div>
            </CardContent>
          </Card>
        )} */}
      </div>
    </div>
  );
}
