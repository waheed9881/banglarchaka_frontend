import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md bg-slate-200/90 motion-safe:animate-pulse dark:bg-slate-700/80",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
