import { Skeleton } from '@/components/ui/skeleton';
import React, { Suspense } from 'react'
import PeriodSelector from './_components/PeriodSelector';
import StatsCard from './_components/StatsCard';
import { CirclePlayIcon, CoinsIcon, WaypointsIcon } from 'lucide-react';
import ExecutionStatusChart from './_components/ExecutionStatusChart';
import { getPeriods } from '@/actions/analytics/getPeriods';
import { getStatsCardsValue } from '@/actions/analytics/getStatsCardsValue';
import { getWorkflowExecutionsStats } from '@/actions/analytics/getWorkflowExecutionsStats';
import { getCreditsUsageInPeriod } from '@/actions/analytics/getCreditsUsageInPeriod';
import { Period } from '@/type/analytics';
import CreditUsageChart from '../billing/_components/CreditUsageChart';


function Homepage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const currDate = new Date();
  const { month, year } = searchParams;

  const period: Period = {
    month: month ? parseInt(month) : currDate.getMonth(),
    year: year ? parseInt(year) : currDate.getFullYear(),
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="flex justify-between">
        <h1 className="text-3xl text-bold">Home</h1>
        <Suspense fallback={<Skeleton className="w-[180px] h-[40px]" />}>
          <PeriodSelectorWrapper selectedPeriod={period} />
        </Suspense>
      </div>
      <div className="h-full py-6 flex flex-col gap-5">
        <Suspense fallback={<StatsCardSkeleton />}>
          <StatsCards selectedPeriod={period} />
        </Suspense>{" "}
        <Suspense fallback={<Skeleton className="w-full h-[300px]" />}>
          <StatsExecutionStatus period={period} />
        </Suspense>
        <Suspense fallback={<Skeleton className="w-full h-[300px]" />}>
          <CreditsUsageInPeriod period={period} />
        </Suspense>
      </div>
    </div>
  );
}

export default Homepage;

async function PeriodSelectorWrapper({
  selectedPeriod,
}: {
  selectedPeriod: Period;
}) {
  const periods = await getPeriods();

  return <PeriodSelector periods={periods} selectedPeriod={selectedPeriod} />;
}
async function StatsCards({ selectedPeriod }: { selectedPeriod: Period }) {
  const data = await getStatsCardsValue(selectedPeriod);

  return (
    <div className="grid gap-3 lg:gap-8 lg:grid-cols-3 min-h-[120px]">
      <StatsCard
        title="Workflow Executions"
        value={data.WorkflowExecutions}
        icon={CirclePlayIcon}
      />
      <StatsCard
        title="Phase Executions"
        value={data.phaseExecutions}
        icon={WaypointsIcon}
      />
      <StatsCard
        title="Credis Consumed"
        value={data.creditsConsumed}
        icon={CoinsIcon}
      />
    </div>
  );
}

async function StatsExecutionStatus({ period }: { period: Period }) {
  const data = await getWorkflowExecutionsStats(period);

  return <ExecutionStatusChart data={data} />;
}
async function CreditsUsageInPeriod({ period }: { period: Period }) {
  const data = await getCreditsUsageInPeriod(period);

  return (
    <CreditUsageChart
      data={data}
      title="Daily credits spent"
      description="Daily credits consumed in selected period"
    />
  );
}

function StatsCardSkeleton() {
  return (
    <div className="grid gap-3 lg:gap-8 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="w-full min-h-[120px]" />
      ))}
    </div>
  );
}