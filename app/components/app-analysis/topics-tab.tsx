import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function TopicsTab() {
  return (
    <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Topic Analysis</CardTitle>
        <CardDescription>
          This tab will be developed in the next phase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-8 text-center text-muted-foreground">
          Topic Analysis tab content will be added soon.
        </div>
      </CardContent>
    </Card>
  );
}
