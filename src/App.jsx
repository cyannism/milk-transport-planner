
import React, { useState, useEffect } from "react";

const TIMES = ["03:00", "07:00", "14:00"];
const HOURS = { "03:00": 3, "07:00": 7, "14:00": 14 };
const DAYS = Array.from({ length: 10 }, (_, i) => `Day ${i + 1}`);
const TRANSPORT_CAPACITY = 14500;
const STORAGE_CAPACITY = 16000;

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Input({ type = "text", value, onChange }) {
  return <input type={type} value={value} onChange={onChange} className="border rounded px-3 py-2 w-full" />;
}

function Label({ children }) {
  return <label className="font-medium text-sm text-gray-700">{children}</label>;
}

function Card({ children }) {
  return <div className="rounded-xl border bg-white shadow p-6">{children}</div>;
}

function CardContent({ children }) {
  return <div className="space-y-4">{children}</div>;
}

export default function SimulationPlanner() {
  const [milkPerDay, setMilkPerDay] = useState(26000);
  const [initialStorage, setInitialStorage] = useState(0);
  const [tripDuration, setTripDuration] = useState(40);
  const [weeklyHours, setWeeklyHours] = useState(168);
  const [numTrucks, setNumTrucks] = useState(3);
  const [suggestedTrucks, setSuggestedTrucks] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [scheduleMap, setScheduleMap] = useState({});
  const [truckNames, setTruckNames] = useState(["Truck 1", "Truck 2", "Truck 3"]);

  const milkPerRound = milkPerDay / 3;

  useEffect(() => {
    const updatedNames = Array.from({ length: numTrucks }, (_, i) => truckNames[i] || `Truck ${i + 1}`);
    setTruckNames(updatedNames);
    generatePlan();
    const totalMilk = milkPerDay * 7;
    const totalTrips = Math.ceil(totalMilk / TRANSPORT_CAPACITY);
    const maxHoursPerTruck = weeklyHours;
    const suggested = Math.ceil((totalTrips * tripDuration) / maxHoursPerTruck);
    setSuggestedTrucks(suggested);
  }, [milkPerDay, initialStorage, weeklyHours, tripDuration, numTrucks]);

  const generatePlan = () => {
    const schedule = {};
    const truckAvailableAt = Array(numTrucks).fill(0);
    let storage = initialStorage;

    for (let day = 0; day < 10; day++) {
      for (let t = 0; t < 3; t++) {
        storage += milkPerRound;
        const hour = day * 24 + HOURS[TIMES[t]];

        for (let truck = 0; truck < numTrucks; truck++) {
          const truckLabel = truckNames[truck] || `Truck ${truck + 1}`;
          const key = `${day}-${t}`;
          if (
            hour >= truckAvailableAt[truck] &&
            storage >= TRANSPORT_CAPACITY &&
            !schedule[key]
          ) {
            const reason = storage > STORAGE_CAPACITY ? "เกินความจุ" : "รถว่างแล้ว";
            schedule[key] = {
              truck: truckLabel,
              reason: `${reason}, เหลือ ${Math.ceil(storage - TRANSPORT_CAPACITY).toLocaleString()} kg`
            };
            truckAvailableAt[truck] = hour + tripDuration;
            storage -= TRANSPORT_CAPACITY;
            break;
          }
        }
      }
    }

    setScheduleMap(schedule);
    setRecommendations([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <Card>
          <CardContent>
            <h2 className="text-2xl font-bold text-gray-800">🚛 Milk Transport Planner</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Milk Production per Day</Label>
                <Input type="number" value={milkPerDay} onChange={(e) => setMilkPerDay(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label>Initial Storage (kg)</Label>
                <Input type="number" value={initialStorage} onChange={(e) => setInitialStorage(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label>Trip Duration (hours)</Label>
                <Input type="number" value={tripDuration} onChange={(e) => setTripDuration(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label>Weekly Work Hours</Label>
                <Input type="number" value={weeklyHours} onChange={(e) => setWeeklyHours(Number(e.target.value))} />
              </div>
              <div className="space-y-1 col-span-full">
                <Label>Number of Trucks</Label>
                <div className="text-sm text-gray-600">
                  {suggestedTrucks > 0 && (
                    numTrucks >= suggestedTrucks
                      ? `✅ เพียงพอแล้ว แนะนำให้ใช้ ${suggestedTrucks} คันขึ้นไป`
                      : `⚠️ ควรมีอย่างน้อย ${suggestedTrucks} คัน`
                  )}
                </div>
                <Input type="number" value={numTrucks} onChange={(e) => setNumTrucks(Number(e.target.value))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold text-gray-700">📊 Trip Schedule Table</h2>
            <div className="overflow-auto rounded-lg border">
              <table className="w-full table-fixed text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 text-left">Day / Time</th>
                    {TIMES.map((time) => (
                      <th key={time} className="text-center px-2">{time}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }).map((_, dIdx) => (
                    <tr key={dIdx} className="even:bg-gray-50">
                      <td className="px-2 py-2 font-medium text-left">{DAYS[dIdx]}</td>
                      {TIMES.map((_, tIdx) => {
                        const key = `${dIdx}-${tIdx}`;
                        const plan = scheduleMap[key];
                        return (
                          <td key={key} className="text-center align-top">
                            <div
                              className={cn(
                                "border rounded-md py-1 px-1 text-xs whitespace-pre-wrap min-h-[40px]",
                                plan ? "bg-green-100 font-semibold text-green-800" : "bg-gray-100 text-gray-400"
                              )}
                            >
                              {plan ? `${plan.truck}\n(${plan.reason})` : `\n–`}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
