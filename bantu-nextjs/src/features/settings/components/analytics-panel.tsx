"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useTRPC } from "@/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const requestsChartConfig = {
  requests: {
    label: "Requests",
    color: "var(--chart-1)",
  },
  errors: {
    label: "Errors",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

const endpointChartConfig = {
  count: {
    label: "Requests",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function AnalyticsPanel() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.developer.getAnalytics.queryOptions({ days: 30 })
  );

  return (
    <div className="space-y-6">
      {/* Requests over time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Requests over time
          </CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {data.daily.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No API requests recorded yet.
            </p>
          ) : (
            <ChartContainer
              config={requestsChartConfig}
              className="h-[250px] w-full"
            >
              <AreaChart data={data.daily} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) => {
                    const d = new Date(value);
                    return d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="requests"
                  type="monotone"
                  fill="var(--color-requests)"
                  fillOpacity={0.2}
                  stroke="var(--color-requests)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="errors"
                  type="monotone"
                  fill="var(--color-errors)"
                  fillOpacity={0.2}
                  stroke="var(--color-errors)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Requests by endpoint */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Requests by endpoint
          </CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {data.endpoints.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No API requests recorded yet.
            </p>
          ) : (
            <ChartContainer
              config={endpointChartConfig}
              className="h-[200px] w-full"
            >
              <BarChart data={data.endpoints} layout="vertical" accessibilityLayer>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="path"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={150}
                  tickFormatter={(value: string) =>
                    value.replace("/api/v1/", "/")
                  }
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
