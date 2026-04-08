import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit max-w-[calc(100vw-1rem)] rounded-2xl border bg-background p-2 shadow-sm sm:p-4", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-3 sm:space-y-4",
        month_caption: "relative flex h-10 items-center justify-center px-10",
        caption: "relative flex h-10 items-center justify-center px-10",
        caption_label: "text-base font-semibold text-foreground sm:text-lg",
        dropdowns: "inline-flex items-center gap-[3px]",
        dropdown_root:
          "relative inline-flex min-w-[94px] items-center justify-between gap-[3px] rounded-md px-2 py-1 pr-5 text-base font-semibold text-foreground sm:min-w-[102px] sm:text-lg",
        months_dropdown: "absolute inset-0 cursor-pointer opacity-0",
        years_dropdown: "absolute inset-0 cursor-pointer opacity-0",
        dropdown: "absolute inset-0 cursor-pointer opacity-0",
        chevron: "h-4 w-4 text-muted-foreground pointer-events-none",
        nav: "absolute inset-x-0 top-0 flex h-10 items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 rounded-md p-[10px] text-foreground/80 hover:bg-muted hover:text-foreground"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 rounded-md p-[10px] text-foreground/80 hover:bg-muted hover:text-foreground"
        ),
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 rounded-md p-[10px] text-foreground/80 hover:bg-muted hover:text-foreground"
        ),
        nav_button_previous: "absolute left-0 top-0",
        nav_button_next: "absolute right-0 top-0",
        month_grid: "w-full border-collapse",
        table: "w-full border-collapse",
        weekdays: "flex",
        head_row: "flex",
        weekday: "h-8 w-8 text-center text-xs font-normal text-muted-foreground sm:h-10 sm:w-10 sm:text-base",
        head_cell: "h-8 w-8 text-center text-xs font-normal text-muted-foreground sm:h-10 sm:w-10 sm:text-base",
        weeks: "space-y-1",
        week: "mt-1 flex w-full",
        row: "mt-1 flex w-full",
        day: "h-8 w-8 p-0 text-center text-xs sm:h-10 sm:w-10 sm:text-base",
        cell: "h-8 w-8 p-0 text-center text-xs sm:h-10 sm:w-10 sm:text-base",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 rounded-md p-0 text-xs font-normal text-foreground aria-selected:opacity-100 sm:h-10 sm:w-10 sm:text-base"
        ),
        selected: "rounded-md bg-muted text-foreground",
        day_selected: "rounded-md bg-muted text-foreground hover:bg-muted focus:bg-muted",
        today: "text-foreground",
        day_today: "text-foreground",
        outside: "text-muted-foreground opacity-50",
        day_outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-35",
        day_disabled: "text-muted-foreground opacity-35",
        range_middle: "aria-selected:bg-muted aria-selected:text-foreground",
        range_end: "aria-selected:bg-muted aria-selected:text-foreground",
        range_start: "aria-selected:bg-muted aria-selected:text-foreground",
        day_hidden: "invisible",
        hidden: "invisible",
        ...classNames
      }}
      components={{
        Chevron: ({ className: iconClassName, orientation = "left", ...iconProps }) => {
          if (orientation === "right") {
            return <ChevronRight className={cn("h-4 w-4", iconClassName)} {...iconProps} />;
          }

          if (orientation === "up") {
            return (
              <ChevronRight
                className={cn(
                  "pointer-events-none absolute right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 -rotate-90",
                  iconClassName
                )}
                {...iconProps}
              />
            );
          }

          if (orientation === "down") {
            return (
              <ChevronRight
                className={cn(
                  "pointer-events-none absolute right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90",
                  iconClassName
                )}
                {...iconProps}
              />
            );
          }

          return <ChevronLeft className={cn("h-4 w-4", iconClassName)} {...iconProps} />;
        }
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };

